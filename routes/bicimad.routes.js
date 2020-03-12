const { Router } = require('express');
const BicimadController = require('../controllers/bicimad.controller');

const endpoint = '/bicimad-api/v1.0';

const router = Router();
const bicimadCtrl = new BicimadController();

router.get(`${endpoint}/dates`, bicimadCtrl.getNumberOfDates);

router.get(`${endpoint}/stations/origin`, bicimadCtrl.getStationsOrigin);

router.get(`${endpoint}/stations/destination`, bicimadCtrl.getStationsDestination);

router.get(`${endpoint}/movements`, (req, res) => {
  const { date, from, to } = req.query;

  if (date) {
    if (from && to) {
      bicimadCtrl.getMovementsFromTo(req, res);
    } else if (from && !to) {
      bicimadCtrl.getMovementsFrom(req, res);
    } else if (!from && to) {
      bicimadCtrl.getMovementsTo(req, res);
    } else {
      bicimadCtrl.getMovements(req, res);
    }
  } else {
    res.status(400).json({ message: 'Date parameter not provided' });
  }
});

router.get(`${endpoint}/movements/time`, (req, res) => {
  const { date, from, to } = req.query;

  if (date && from && to && req.query.in) {
    bicimadCtrl.getMovementsFromToIn(req, res);
  } else {
    res.status(400).json({ message: 'Some parameters are missing' });
  }
});

module.exports = router;
