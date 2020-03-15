const { Router } = require('express');
const BicimadController = require('../controllers/bicimad.controller');

const endpoint = '/bicimad-api/v1.0';

const router = Router();
const bicimadCtrl = new BicimadController();

router.get(`${endpoint}/dates`, async (req, res) => {
  res.json(await bicimadCtrl.getNumberOfDates());
});

router.get(`${endpoint}/stations/origin`, async (req, res) => {
  res.json(await bicimadCtrl.getStationsOrigin());
});

router.get(`${endpoint}/stations/destination`, async (req, res) => {
  res.json(await bicimadCtrl.getStationsDestination());
});

router.get(`${endpoint}/movements`, async (req, res) => {
  const { date, from, to } = req.query;

  if (date) {
    if (from && to) {
      res.json(await bicimadCtrl.getMovementsFromTo(date, Number(from), Number(to)));
    } else if (from && !to) {
      res.json(await bicimadCtrl.getMovementsFrom(date, Number(from)));
    } else if (!from && to) {
      res.json(await bicimadCtrl.getMovementsTo(date, Number(to)));
    } else {
      res.json(await bicimadCtrl.getMovements(date));
    }
  } else {
    res.status(400).json({ message: 'Date parameter not provided' });
  }
});

router.get(`${endpoint}/movements/time`, (req, res) => {
  const { date, from, to, gt } = req.query;
  const _in = Number(req.query.in);

  if (date && from && to && !isNaN(_in) && _in > 0) {
    res.json(bicimadCtrl.getMovementsFromToIn(date, Number(from), Number(to), _in, gt));
  } else {
    res.status(400).json({ message: 'Some parameters are wrong' });
  }
});

module.exports = router;
