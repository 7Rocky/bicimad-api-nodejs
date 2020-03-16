const crypto = require('crypto');
const { Router } = require('express');
const NodeCache = require('node-cache');

const BicimadController = require('../controllers/bicimad.controller');

const endpoint = '/bicimad-api/v1.0';

const bicimadCtrl = new BicimadController();
const myCache = new NodeCache({ checkperiod: 120, stdTTL: 60 });
const router = Router();

router.get(`${endpoint}/dates`, async (req, res) => {
  try {
    const dates = myCache.get('dates') || await bicimadCtrl.getNumberOfDates();
    myCache.set('dates', dates);
    res.json({ dates });
  } catch (error) {
    res.json({ error });
  }
});

router.get(`${endpoint}/stations/:kind`, async (req, res) => {
  const kind = req.params.kind;
  let stations = { };

  try {
    if (kind === 'origin') {
      stations = myCache.get(kind) || await bicimadCtrl.getStationsOrigin();
    } else if (kind === 'destination') {
      stations = myCache.get(kind) || await bicimadCtrl.getStationsDestination();
    } else {
      return res.status(404).json({ message: 'Not found' });
    }

    myCache.set(kind, stations);
    res.json({ stations });
  } catch (error) {
    res.json({ error });
  }
});

router.get(`${endpoint}/movements`, async (req, res) => {
  const { date, from, to } = req.query;
  let movements = [];

  if (date) {
    if (from && to) {
      movements = myCache.get('date_from_to') ||
        await bicimadCtrl.getMovementsFromTo(date, Number(from), Number(to));
      myCache.set('date_from_to', movements);
    } else if (from && !to) {
      movements = myCache.get('date_from') ||
        await bicimadCtrl.getMovementsFrom(date, Number(from));
      myCache.set('date_from', movements);
    } else if (!from && to) {
      movements = myCache.get('date_to') ||
        await bicimadCtrl.getMovementsTo(date, Number(to));
      myCache.set('date_to', movements);
    } else {
      movements = myCache.get('date') || await bicimadCtrl.getMovements(date);
      myCache.set('date', movements);
    }

    res.json(movements);
  } else {
    res.status(400).json({ message: 'Date parameter not provided' });
  }
});

router.get(`${endpoint}/movements/time`, async (req, res) => {
  const { date, from, to, gt } = req.query;
  const _in = Number(req.query.in);

  if (date && from && to && !isNaN(_in) && _in > 0) {
    const movements_time = myCache.get('time') || 
      await bicimadCtrl.getMovementsFromToIn(date, Number(from), Number(to), _in, gt);
    myCache.set('time', movements_time);
    res.json(movements_time);
  } else {
    res.status(400).json({ message: 'Some parameters are wrong' });
  }
});

const verifyAuth = async (req, res, next) => {
  const credentials = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString().split(':');
  const hash = crypto.createHash('sha256').update(credentials[1]).digest('hex');

  if (hash === await bicimadCtrl.getUsersHash(credentials[0])) {
    next();
  } else {
    res.status(403).json({ error: 'No valid credentials' });
  }
};

router.post(`${endpoint}/new`, verifyAuth, async (req, res) => {
  const document = await bicimadCtrl.new(req.body);
  if (document) {
    res.status(201).json(document);
  } else {
    res.status(400).json({ error: 'Some fields are invalid' });
  }
});

module.exports = router;
