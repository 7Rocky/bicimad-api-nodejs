const Cloudant = require('../modules/cloudant');
const { getDateFromMilliseconds, sortDates } = require('../helpers/dates.helpers');

const bicimad = new Cloudant('bicimad');
const bicimad_admin = new Cloudant('bicimad_admin');

const ORIGIN = { name: 'origin', column: 'idunplug_station' };
const DESTINATION = { name: 'destination', column: 'idplug_station' };
const FIELDS = ['Fecha', 'idunplug_base', 'idplug_base', 'idunplug_station', 'idplug_station', 
  'ageRange', 'user_type', 'travel_time', 'Fichero'];

const getStations = async kind => {
  try {
    console.time('query');
    const data = await bicimad.find({ }, [kind.column]);
    console.timeEnd('query');
    console.time('process');
    const ids = data.map(item => item[kind.column]);
    const stations = { };

    stations[kind.name] = [... new Set(ids)].sort((a, b) => a - b);
    console.timeEnd('process');
    return stations;
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

      return { count, first, last };
    } catch (error) {
      return { error };
    }
  }

  async getStationsOrigin() {
    return await getStations(ORIGIN);
  }

  async getStationsDestination() {
    return await getStations(DESTINATION);
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

  async new(document) {
    document['Fichero'] = 0;

    for (const field in document) {
      if (FIELDS.indexOf(field) === -1) {
        return;
      }
    }

    try {
      const doc = await bicimad.insert(document);
      delete doc['_id'];
      delete doc['_rev'];
      return doc;
    } catch (error) {
      console.log(error);
    }
  }

  async getUsersHash(username) {
    try {
      const hashes = await bicimad_admin.find({ username }, [ 'hash' ]);

      if (hashes.length === 1) {
        return hashes[0].hash;
      }

      return;
    } catch (error) {
      console.log(error);
    }
  }

};
