const Cloudant = require('../modules/cloudant');
const { getDateFromMilliseconds, sortDates, verifyDate } = require('../helpers/dates.helpers');

const bicimad = new Cloudant('bicimad');
const bicimad_admin = new Cloudant('bicimad_admin');

const ORIGIN = { name: 'origin', column: 'idunplug_station' };
const DESTINATION = { name: 'destination', column: 'idplug_station' };
const FIELDS = [
  'Fecha',
  'Fichero',
  'ageRange',
  'idplug_base',
  'idplug_station',
  'idunplug_base',
  'idunplug_station',
  'travel_time',
  'user_type'
];

const getStations = async kind => {
  try {
    const data = await bicimad.find({ }, [kind.column]);
    const ids = data.map(item => item[kind.column]);
    const stations = { };

    stations[kind.name] = [... new Set(ids)].sort((a, b) => a - b);
    return stations;
  } catch (error) {
    return { error };
  }
};

const verifyDoc = doc => {
  return verifyDate(doc.Fecha.trim()) &&
    doc.idunplug_station >= 1 &&
    doc.idplug_station >= 1 &&
    doc.idunplug_base >= 1 && doc.idunplug_base <= 30 &&
    doc.idplug_base >= 1 && doc.idplug_base <= 30 &&
    doc.ageRange >= 1 && doc.ageRange <= 6 &&
    doc.user_type >= 1 && doc.user_type <= 3 &&
    doc.travel_time >= 0;
};

module.exports = class BicimadController {

  async getNumberOfDates() {
    try {
      const data = await bicimad.find({ }, ['Fecha']);
      console.log(data);
      const repeated_dates = data.map(item => item['Fecha']);
      console.log(repeated_dates);
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
    const keys = Object.keys(document).sort();

    if (keys.toString() !== FIELDS.toString()) {
      return { error: 'Some fields are invalid. Please, check the API documentation' };
    }

    if (!verifyDoc(document)){
      return { error: 'Some values are invalid. Please, check the API documentation' };;
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
