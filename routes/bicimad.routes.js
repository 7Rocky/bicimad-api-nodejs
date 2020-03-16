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
      return res.status(404).json({ error: 'Not found' });
    }

    myCache.set(kind, stations);
    res.json(stations);
  } catch (error) {
    res.json({ error });
  }
});

router.get(`${endpoint}/movements`, async (req, res) => {
  const { date, from, to } = req.query;
  let movements = [];

  if (date) {
    if (from && to) {
      movements = myCache.get(`date=${date}&from=${from}&to=${to}`) ||
        await bicimadCtrl.getMovementsFromTo(date, Number(from), Number(to));
      myCache.set(`date=${date}&from=${from}&to=${to}`, movements);
    } else if (from && !to) {
      movements = myCache.get(`date=${date}&from=${from}`) ||
        await bicimadCtrl.getMovementsFrom(date, Number(from));
      myCache.set(`date=${date}&from=${from}`, movements);
    } else if (!from && to) {
      movements = myCache.get(`date=${date}&to=${to}`) ||
        await bicimadCtrl.getMovementsTo(date, Number(to));
      myCache.set(`date=${date}&to`, movements);
    } else {
      movements = myCache.get(`date=${date}`) || await bicimadCtrl.getMovements(date);
      myCache.set(`date=${date}`, movements)
    }

    res.json(movements);
  } else {
    res.status(400).json({ error: 'Date parameter not provided' });
  }
});

router.get(`${endpoint}/movements/time`, async (req, res) => {
  const { date, from, to, gt } = req.query;
  const _in = Number(req.query.in);

  if (date && from && to && !isNaN(_in) && _in > 0) {
    const movements_time = myCache.get(`date=${date}&from=${from}&to=${to}&in=${_in}&gt=${gt}`) || 
      await bicimadCtrl.getMovementsFromToIn(date, Number(from), Number(to), _in, gt);
    myCache.set(`date=${date}&from=${from}&to=${to}&in=${_in}&gt=${gt}`, movements_time);
    res.json(movements_time);
  } else {
    res.status(400).json({ error: 'Some parameters are wrong' });
  }
});

const verifyAuth = async (req, res, next) => {
  const auth = req.headers.authorization;
  console.log(auth);

  if (auth) {
    const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
    const hash = crypto.createHash('sha256').update(credentials[1]).digest('hex');
    console.log(credentials);

    if (hash === await bicimadCtrl.getUsersHash(credentials[0])) {
      return next();
    }
  }

  return res.status(403).json({ error: 'No valid credentials' });
};

router.post(`${endpoint}/new`, verifyAuth, async (req, res) => {
  const document = await bicimadCtrl.new(req.body);
  res.status(document.error ? 400 : 201).json(document);
});

router.put(`${endpoint}/update`, async (req, res) => {
  const document = await bicimadCtrl.update(req.body);

  if (document.error) {
    res.status(document.status).json({ error: document.error });
  }

  res.status(200).json(document);
});

module.exports = router;
