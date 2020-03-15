const Cloudant = require('../modules/cloudant');
const { getDateFromMilliseconds, sortDates } = require('../helpers/dates.helpers');

const bicimad = new Cloudant('bicimad');

const ORIGIN = { name: 'origin', column: 'idunplug_station' };
const DESTINATION = { name: 'destination', column: 'idplug_station' };
const FIELDS = ['Fecha', 'idunplug_base', 'idplug_base', 'idunplug_station', 'idplug_station', 
  'ageRange', 'user_type', 'travel_time', 'Fichero'];

const getStations = async (kind) => {
  try {
    const data = await bicimad.find({ }, [kind.column]);
    const ids = data.map(item => item[kind.column]);
    const stations = { };

    stations[kind.name] = [... new Set(ids)].sort((a, b) => a - b);

    return { stations };
  } catch (error) {
    return { error };
  }
};

module.exports = class BicimadController {

  async getNumberOfDates() {
    try {
      const data = await bicimad.find({ }, ['Fecha']);
      const repeated_dates = data.map(item => item['Fecha']);
      const dates = sortDates(repeated_dates);

      const count = dates.length;
      const first = getDateFromMilliseconds(dates[0]);
      const last = getDateFromMilliseconds(dates[count - 1]);

      return { dates: { count, first, last } };
    } catch (error) {
      return { error };
    }
  }

  async getStationsOrigin() {
    getStations(ORIGIN);
  }

  async getStationsDestination() {
    getStations(DESTINATION);
  }

  async getMovements(date) {
    return await bicimad.find({
      'Fecha': date
    }, FIELDS);
  }

  async getMovementsFrom(date, from) {
    try {
      return await bicimad.find({
        'Fecha': date,
        'idunplug_station': from
      }, FIELDS);
    } catch (error) {
      return { error };
    }
  }

  async getMovementsTo(date, to) {
    try {
      return await bicimad.find({
        'Fecha': date,
        'idplug_station': to
      }, FIELDS);
    } catch (error) {
      return { error };
    }
  }

  async getMovementsFromTo(date, from, to) {
    try {
      return await bicimad.find({
        'Fecha': date,
        'idunplug_station': from,
        'idplug_station': to
      });
    } catch (error) {
      return { error };
    }
  }

  async getMovementsFromToIn(date, from, to, _in, gt) {
    try {
      return await bicimad.find({
        'Fecha': date,
        'idunplug_station': from,
        'idplug_station': to,
        'travel_time': gt === 'true' ? { '$gt': _in } : { '$lt': _in }
      });
    } catch (error) {
      return { error };
    }
  }

};
