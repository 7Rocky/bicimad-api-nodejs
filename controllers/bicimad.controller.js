const Cloudant = require('../modules/cloudant');
const { getDateFromMilliseconds, sortDates } = require('../helpers/dates.helpers');

const bicimad = new Cloudant('bicimad');

const ORIGIN = { name: 'origin', column: 'idunplug_station' };
const DESTINATION = { name: 'destination', column: 'idplug_station' };

const getStations = async (req, res, kind) => {
  try {
    const data = await bicimad.find({ }, [kind.column]);
    const ids = data.map(item => item[kind.column]);
    const stations = { };

    stations[kind.name] = [... new Set(ids)].sort((a, b) => a - b);

    res.json({ stations });
  } catch (error) {
    res.status(500).json({ message: 'Something unexpected happened' });
  }
};

module.exports = class BicimadController {

  async getNumberOfDates(req, res) {
    try {
      const data = await bicimad.find({ }, ['Fecha']);
      const repeated_dates = data.map(item => item['Fecha']);
      const dates = sortDates(repeated_dates);

      const count = dates.length;
      const first = getDateFromMilliseconds(dates[0]);
      const last = getDateFromMilliseconds(dates[count - 1]);

      res.json({ count, first, last });
    } catch (error) {
      res.status(500).json({ message: 'Something unexpected happened' });
    }
  }

  async getStationsOrigin(req, res) {
    getStations(req, res, ORIGIN);
  }

  async getStationsDestination(req, res) {
    getStations(req, res, DESTINATION);
  }

  async getMovements(req, res) {
    const { date } = req.query;
    try {
      res.json(await bicimad.find({
        'Fecha': { '$eq': date }
      }));
    } catch (error) {
      res.status(500).json({ message: 'Something unexpected happened' });
    }
  }

  async getMovementsFrom(req, res) {
    const { date, from } = req.query;

    try {
      res.json(await bicimad.find({
        'Fecha': { '$eq': date },
        'idunplug_station': { '$eq': Number(from) }
      }));
    } catch (error) {
      res.status(500).json({ message: 'Something unexpected happened' });
    }
  }

  async getMovementsTo(req, res) {
    const { date, to } = req.query;

    try {
      res.json(await bicimad.find({
        'Fecha': { '$eq': date },
        'idplug_station': { '$eq': Number(to) }
      }));
    } catch (error) {
      res.status(500).json({ message: 'Something unexpected happened' });
    }
  }

  async getMovementsFromTo(req, res) {
    const { date, from, to } = req.query;

    try {
      res.json(await bicimad.find({
        'Fecha': { '$eq': date },
        'idunplug_station': { '$eq': Number(from) },
        'idplug_station': { '$eq': Number(to) }
      }));
    } catch (error) {
      res.status(500).json({ message: 'Something unexpected happened' });
    }
  }

  async getMovementsFromToIn(req, res) {
    const { date, from, to } = req.query;
    const timeSelector = req.query.gt === 'true' ? 
      { '$gt': Number(req.query.in) } : { '$lt': Number(req.query.in) };

    try {
      res.json(await bicimad.find({
        'Fecha': { '$eq': date },
        'idunplug_station': { '$eq': Number(from) },
        'idplug_station': { '$eq': Number(to) },
        'travel_time': timeSelector
      }));
    } catch (error) {
      res.status(500).json({ message: 'Something unexpected happened' });
    }
  }

};
