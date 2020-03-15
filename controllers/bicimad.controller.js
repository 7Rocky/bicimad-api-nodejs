const Cloudant = require('../modules/cloudant');
const { getDateFromMilliseconds, sortDates } = require('../helpers/dates.helpers');

const bicimad = new Cloudant('bicimad');
console.log(process.env);

const ORIGIN = { name: 'origin', column: 'idunplug_station' };
const DESTINATION = { name: 'destination', column: 'idplug_station' };
const FIELDS = ['Fecha', 'idunplug_base', 'idplug_base', 'idunplug_station', 'idplug_station', 
  'ageRange', 'user_type', 'travel_time', 'Fichero']

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

      res.json({ dates: { count, first, last } });
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

  async getMovements(date) {
    return await bicimad.find({
      'Fecha': date
    }, FIELDS);
  }

  async getMovementsFrom(date, from) {
    res.json(await bicimad.find({
      'Fecha': date,
      'idunplug_station': from
    }, FIELDS));
  }

  async getMovementsTo(date, to) {
    try {
      return await bicimad.find({
        'Fecha': date,
        'idplug_station': to
      }, FIELDS);
    } catch (error) {
      return { message: 'Something unexpected happened' };
    }
  }

  async getMovementsFromTo(date, from, to) {
    try {
      res.json(await bicimad.find({
        'Fecha': date,
        'idunplug_station': from,
        'idplug_station': to
      }));
    } catch (error) {
      res.status(500).json({ message: 'Something unexpected happened' });
    }
  }

  async getMovementsFromToIn(date, from, to, _in, gt) {
    try {
      res.json(await bicimad.find({
        'Fecha': date,
        'idunplug_station': from,
        'idplug_station': to,
        'travel_time': gt === 'true' ? { '$gt': _in } : { '$lt': _in }
      }));
    } catch (error) {
      res.status(500).json({ message: 'Something unexpected happened' });
    }
  }

};
