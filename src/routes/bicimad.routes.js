const crypto = require('crypto');
const { Router } = require('express');
const NodeCache = require('node-cache');

const BicimadController = require('../controllers/bicimad.controller');
const { verifyDate } = require('../helpers/dates.helpers');

const endpoint = '/bicimad-api/v1.0';

const bicimadCtrl = new BicimadController();
const myCache = new NodeCache({ checkperiod: 120, stdTTL: 60 });
const router = Router();

router.get(`${endpoint}/dates`, async (req, res) => {
  try {
    const dates = myCache.get('dates') || await bicimadCtrl.getNumberOfDates();
    myCache.set('dates', dates);
    res.json(dates);
  } catch (error) {
    res.status(500);
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
      return res.status(404).json({ error: 'Not Found' });
    }

    myCache.set(kind, stations);
    res.json(stations);
  } catch (error) {
    res.status(500);
  }
});

router.get(`${endpoint}/movements`, async (req, res) => {
  const { date, from, to } = req.query;
  const key = `date=${date}&from=${from}&to=${to}`;
  let movements = [];

  try {
    if (verifyDate(date.trim())) {
      if (from && to && from >= 1 && to >= 1) {
        movements = myCache.get(key) || await bicimadCtrl.getMovementsFromTo(date, from, to);
      } else if (from && from >= 1 && !to) {
        movements = myCache.get(key) || await bicimadCtrl.getMovementsFrom(date, from);
      } else if (!from && to && to >= 1) {
        movements = myCache.get(key) || await bicimadCtrl.getMovementsTo(date, to);
      } else if (!from && !to) {
        movements = myCache.get(key) || await bicimadCtrl.getMovements(date);
      } else {
        return res.status(400).json({ error: 'Some parameters are wrong' });
      }

      myCache.set(key, movements);
      res.json(movements);
    } else {
      res.status(400).json({ error: 'Some parameters are wrong' });
    }
  } catch (error) {
    res.status(500);
  }
});

router.get(`${endpoint}/movements/time`, async (req, res) => {
  const { date, from, to, gt } = req.query;
  const _in = Number(req.query.in);
  const key = `date=${date}&from=${from}&to=${to}&in=${_in}&gt=${gt}`

  try {
    if (verifyDate(date.trim()) && from && from >= 1 && to && to >= 1 && !isNaN(_in) && _in >= 0) {
      const movements = myCache.get(key) || await bicimadCtrl.getMovementsFromToIn(date, from, to, _in, gt);
      myCache.set(key, movements);
      res.json(movements);
    } else {
      res.status(400).json({ error: 'Some parameters are wrong' });
    }
  } catch (error) {
    res.status(500);
  }
});

const verifyAuth = async (req, res, next) => {
  const auth = req.headers.authorization;

  try {
    if (auth && auth.startsWith('Basic ')) {
      const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
      const hash = crypto.createHash('sha256').update(credentials[1]).digest('hex');

      if (hash === await bicimadCtrl.getUsersHash(credentials[0])) {
        return next();
      }
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    res.status(500);
  }
};

router.post(`${endpoint}/new`, verifyAuth, async (req, res) => {
  try {
    const document = await bicimadCtrl.new(req.body);
    myCache.flushAll();
    res.status(document.error ? 400 : 201).json(document);
  } catch (error) {
    res.status(500);
  }
});

router.put(`${endpoint}/time/update`, async (req, res) => {
  try {
    const document = await bicimadCtrl.update(req.body);

    if (document.error) {
      return res.status(document.status).json({ error: document.error });
    }

    myCache.flushAll();
    res.status(200).json(document);
  } catch (error) {
    res.status(500);
  }
});

module.exports = router;
