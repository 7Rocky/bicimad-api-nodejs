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
    return { stations };
  } catch (error) {
    console.log(error);
  }
};

const verifyDoc = doc => {
  const keys = Object.keys(doc).sort();

  return keys.toString() === FIELDS.toString() &&
    doc.Fecha && verifyDate(doc.Fecha.trim()) &&
    doc.Fichero >= 0 &&
    doc.idunplug_station >= 1 &&
    doc.idplug_station >= 1 &&
    doc.idunplug_base >= 1 && doc.idunplug_base <= 30 &&
    doc.idplug_base >= 1 && doc.idplug_base <= 30 &&
    doc.ageRange >= 0 && doc.ageRange <= 6 &&
    doc.user_type >= 1 && doc.user_type <= 3 &&
    doc.travel_time >= 0;
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
      console.log(error);
    }
  }

  async getStationsOrigin() {
    try {
      return await getStations(ORIGIN);
    } catch (error) {
      console.log(error);
    }
  }

  async getStationsDestination() {
    try {
      return await getStations(DESTINATION);
    } catch (error) {
      console.log(error);
    }
  }

  async getMovements(date) {
    try {
      return await bicimad.find({
        'Fecha': date
      }, FIELDS);
    } catch (error) {
      console.log(error);
    }
  }

  async getMovementsFrom(date, from) {
    try {
      return await bicimad.find({
        'Fecha': date,
        'idunplug_station': Number(from)
      }, FIELDS);
    } catch (error) {
      console.log(error);
    }
  }

  async getMovementsTo(date, to) {
    try {
      return await bicimad.find({
        'Fecha': date,
        'idplug_station': Number(to)
      }, FIELDS);
    } catch (error) {
      console.log(error);
    }
  }

  async getMovementsFromTo(date, from, to) {
    try {
      return await bicimad.find({
        'Fecha': date,
        'idunplug_station': Number(from),
        'idplug_station': Number(to)
      }, FIELDS);
    } catch (error) {
      console.log(error);
    }
  }

  async getMovementsFromToIn(date, from, to, _in, gt) {
    try {
      return await bicimad.find({
        'Fecha': date,
        'idunplug_station': Number(from),
        'idplug_station': Number(to),
        'travel_time': gt === 'true' ? { '$gt': _in } : { '$lt': _in }
      }, FIELDS);
    } catch (error) {
      console.log(error);
    }
  }

  async new(document) {
    document['Fichero'] = 0;

    if (!verifyDoc(document)){
      return { error: 'Some fields/values are invalid. Please, check the API documentation' };;
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

  async update(document) {
    const { travel_time } = document; 

    if (!isNaN(Number(travel_time)) && Number(travel_time) >= 0 && verifyDoc(document)) {
      try {
        const existingDocuments = await bicimad.find({
          'Fecha': document.Fecha,
          'idunplug_station': document.idunplug_station,
          'idplug_station': document.idplug_station,
        });

        if (existingDocuments.length) {
          let existsDocument = false;

          for (const doc of existingDocuments) {
            if (doc.Fichero === document.Fichero && doc.idunplug_base === document.idunplug_base &&
                doc.idplug_base === document.idplug_base && doc.user_type === document.user_type &&
                doc.ageRange === document.ageRange) {

              existsDocument = true;
              document = doc;
            }
          }

          if (existsDocument) {
            document.travel_time = travel_time;
            const finalDocument = await bicimad.insert(document);

            delete finalDocument['_id'];
            delete finalDocument['_rev'];
            return finalDocument;
          }
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      return { error: 'Some fields are invalid', status: 400 };
    }

    return { error: 'Document not found in the database', status: 404 };
  }

  async getUsersHash(username) {
    try {
      const hashes = await bicimad_admin.find({ username }, ['hash']);

      if (hashes && hashes.length === 1) {
        return hashes[0].hash;
      }

      return;
    } catch (error) {
      console.log(error);
    }
  }

};
