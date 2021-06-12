const axios = require('axios');
const { expect } = require('chai');
const queryString = require('query-string');

const TIME_OUT = 1000000;

const HOSTS = [
  'https://rockyPython.mybluemix.net',
  'http://localhost:3000',
  'http://localhost:8000',
  'https://rockyPython.azurewebsites.net',
];
const HOST = HOSTS[3];

const endpoint = `${HOST}/bicimad-api/v1.0`;
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

const verifyDate = date => {
  expect(date).to.be.a('string');
  expect(date).to.match(/^((0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/[12]\d{3})$/);
  expect(date).to.not.have.string('30/02');
  expect(date).to.not.have.string('31/02');
  expect(date).to.not.have.string('31/04');
  expect(date).to.not.have.string('31/06');
  expect(date).to.not.have.string('31/09');
  expect(date).to.not.have.string('31/11');

  if (date.startsWith('29/02')) {
    expect(date.substring(8, 10) % 4).to.be.equal(0);
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

describe('Endpoints', () => {
  it('GET /dates', async function() {
    this.timeout(TIME_OUT);

    try {
      const response = await axios.get(`${endpoint}/dates`);
      const data = response.data;
      const status = response.status;

      expect(status).to.be.equal(200);

      expect(data).to.be.an('object');
      expect(data).to.have.all.keys('count', 'first', 'last');

      expect(data.count).to.be.a('number');
      verifyDate(data.first);
      verifyDate(data.last);
    } catch (error) {
      console.log(error);
    }
  });

  it('GET /stations/{kind}', async function() {
    this.timeout(TIME_OUT);

    for (const kind of ['origin', 'destination']) {
      try {
        const response = await axios.get(`${endpoint}/stations/${kind}`);
        const data = response.data;
        const status = response.status;

        expect(status).to.be.equal(200);

        expect(data).to.be.an('object');
        expect(data).to.have.all.keys('stations');
        expect(data.stations).to.have.all.keys(kind);
        expect(data.stations[kind]).to.be.an('array');
        data.stations[kind].forEach(item => {
          expect(item).to.be.a('number');
        });
      } catch (error) {
        console.log(error);
      }
    }
  });

  it('GET /stations/{kind} Not Found', async function() {
    this.timeout(TIME_OUT);

    try {
      await axios.get(`${endpoint}/stations/hola`);
      console.log('Request has been successful');
    } catch (data) {
      const message = data.response.data;
      const status = data.response.status;

      expect(status).to.be.equal(404);

      expect(message).to.be.an('object');
      expect(message).to.have.all.keys('error');
      expect(message.error).to.be.equal('Not Found');
    }
  });

  it('GET /movements', async function() {
    this.timeout(TIME_OUT);
    const date = '03/06/2019';
    const from = 154;
    const to = 160;

    const urls = [
      `${endpoint}/movements?${queryString.stringify({ date })}`,
      `${endpoint}/movements?${queryString.stringify({ date, from })}`,
      `${endpoint}/movements?${queryString.stringify({ date, to })}`,
      `${endpoint}/movements?${queryString.stringify({ date, from, to })}`
    ];

    for (const url of urls) {
      try {
        const response = await axios.get(url);
        const data = response.data;
        const status = response.status;

        expect(status).to.be.equal(200);

        expect(data).to.be.an('array');
        data.forEach(verifyDoc);
      } catch (error) {
        console.log(error);
      }
    }
  });

  it('GET /movements Bad Requests', async function() {
    this.timeout(TIME_OUT);
    const date = '03/06/2019';
    const from = 154;
    const to = 160;

    const urls = [
      `${endpoint}/movements?${queryString.stringify({ date: '30/02/2020' })}`,
      `${endpoint}/movements?${queryString.stringify({ date: 'hola' })}`,
      `${endpoint}/movements?${queryString.stringify({ date: '3/6/2020', from })}`,
      `${endpoint}/movements?${queryString.stringify({ date, from: 'origin' })}`,
      `${endpoint}/movements?${queryString.stringify({ date: '3/6/2020', to })}`,
      `${endpoint}/movements?${queryString.stringify({ date, to: 'destination' })}`,
      `${endpoint}/movements?${queryString.stringify({ date: '3/6/2020', from, to })}`,
      `${endpoint}/movements?${queryString.stringify({ date, from: 'origin', to })}`,
      `${endpoint}/movements?${queryString.stringify({ date, from, to: 'destination' })}`
    ];

    for (const url of urls) {
      try {
        await axios.get(url);
        console.log('Request has been successful');
      } catch (data) {
        const message = data.response.data;
        const status = data.response.status;

        expect(status).to.be.equal(400);

        expect(message).to.be.an('object');
        expect(message).to.have.all.keys('error');
        expect(message.error).to.be.equal('Some parameters are wrong');
      }
    }
  });

  it('GET /movements/time', async function() {
    this.timeout(TIME_OUT);
    const date = '03/06/2019';
    const from = 154;
    const to = 160;
    const _in = 500;
    const gt = true;

    const urls = [
      `${endpoint}/movements/time?${queryString.stringify({ date, from, to, in: _in })}`,
      `${endpoint}/movements/time?${queryString.stringify({ date, from, to, in: _in, gt })}`
    ];

    for (const url of urls) {
      try {
        const response = await axios.get(url);
        const data = response.data;
        const status = response.status;

        expect(status).to.be.equal(200);

        expect(data).to.be.an('array');
        data.forEach(verifyDoc);
        data.forEach(doc => {
          if (url === url[0]) {
            expect(doc.travel_time <= _in).to.be.true; 
          } else {
            expect(doc.travel_time >= _in).to.be.true; 
          }
        });
      } catch (error) {
        console.log(error);
      }
    }
  });

  it('GET /movements/time Bad Requests', async function() {
    this.timeout(TIME_OUT);
    const date = '03/06/2019';
    const from = 154;
    const to = 160;
    const _in = 500;
    const gt = true;

    const urls = [
      `${endpoint}/movements/time?${queryString.stringify({ date })}`,
      `${endpoint}/movements/time?${queryString.stringify({ date: '25/02/2020' })}`,
      `${endpoint}/movements/time?${queryString.stringify({ date: 'hola' })}`,
      `${endpoint}/movements/time?${queryString.stringify({ date, from })}`,
      `${endpoint}/movements/time?${queryString.stringify({ date: '3/6/2020', from })}`,
      `${endpoint}/movements/time?${queryString.stringify({ date, from: 'origin' })}`,
      `${endpoint}/movements/time?${queryString.stringify({ date, to })}`,
      `${endpoint}/movements/time?${queryString.stringify({ date: '3/6/2020', to })}`,
      `${endpoint}/movements/time?${queryString.stringify({ date, to: 'destination' })}`,
      `${endpoint}/movements/time?${queryString.stringify({ date, from, to })}`,
      `${endpoint}/movements/time?${queryString.stringify({ date: '3/6/2020', from, to })}`,
      `${endpoint}/movements/time?${queryString.stringify({ date, from: 'origin', to })}`,
      `${endpoint}/movements/time?${queryString.stringify({ date, from, to: 'destination' })}`,
      `${endpoint}/movements/time?${queryString.stringify({ date: '3/6/2020', from, to, in: _in })}`,
      `${endpoint}/movements/time?${queryString.stringify({ date, from: 'from', to, in: _in })}`,
      `${endpoint}/movements/time?${queryString.stringify({ date, from, to: 'to', in: _in })}`,
      `${endpoint}/movements/time?${queryString.stringify({ date, from, to, in: 'in' })}`,
      `${endpoint}/movements/time?${queryString.stringify({ date: '3/6/2020', from, to, in: _in, gt })}`,
      `${endpoint}/movements/time?${queryString.stringify({ date, from: 'from', to, in: _in, gt })}`,
      `${endpoint}/movements/time?${queryString.stringify({ date, from, to: 'to', in: _in, gt })}`,
      `${endpoint}/movements/time?${queryString.stringify({ date, from, to, in: 'in', gt })}`
    ];

    for (const url of urls) {
      try {
        await axios.get(url);
        console.log('Request has been successful');
      } catch (data) {
        const message = data.response.data;
        const status = data.response.status;

        expect(status).to.be.equal(400);

        expect(message).to.be.an('object');
        expect(message).to.have.all.keys('error');
        expect(message.error).to.be.equal('Some parameters are wrong');
      }
    }
  })

  it('POST /new', async function() {
    this.timeout(TIME_OUT);
    const body = {
      "Fecha": "17/03/2020",
      "ageRange": 4,
      "idplug_base": 20,
      "idplug_station": 12,
      "idunplug_base": 17,
      "idunplug_station": 164,
      "travel_time": 581,
      "user_type": 1
    };
    const headers = {
      "Authorization": 'Basic YWRtaW46cm9vdA=='
    };

    try {
      const response = await axios.post(`${endpoint}/new`, body, { headers });
      const data = response.data;
      const status = response.status;

      expect(status).to.be.equal(201);

      expect(data).to.be.an('object');
      verifyDoc(data);
      
      for (const attr in body) {
        expect(data[attr]).to.be.equal(body[attr]);
      }

      expect(data['Fichero']).to.be.equal(0);

    } catch (error) {
      console.log(error);
    }
  });

  it('POST /new Bad Request', async function() {
    this.timeout(TIME_OUT);
    const bodies = [
      {
        "Fecha": "1/3/2020",
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 581,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "ageRange": 10,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 581,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "ageRange": -10,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 581,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "ageRange": "young",
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 581,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "ageRange": 4,
        "idplug_base": 40,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 581,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "ageRange": 4,
        "idplug_base": 0,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 581,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "ageRange": 4,
        "idplug_base": "first",
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 581,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": -1,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 581,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": "last",
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 581,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 40,
        "idunplug_station": 164,
        "travel_time": 581,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": -10,
        "idunplug_station": 164,
        "travel_time": 581,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": "hola",
        "idunplug_station": 164,
        "travel_time": 581,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 0,
        "travel_time": 581,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": "a",
        "travel_time": 581,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": -581,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": "hey",
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 581,
        "user_type": 0
      },
      {
        "Fecha": "17/03/2020",
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 581,
        "user_type": 4
      },
      {
        "Fecha": "17/03/2020",
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 581,
        "user_type": "b"
      }
    ];
    const headers = {
      "Authorization": 'Basic YWRtaW46cm9vdA=='
    };

    for (let i = 0; i < bodies.length; i++) {
      await (async () => {
        try {
          await axios.post(`${endpoint}/new`, bodies[i], { headers });
          console.log('Request has been successful');
        } catch (data) {
          if (data) {
            const message = data.response.data;
            const status = data.response.status;

            expect(status).to.be.equal(400);

            expect(message).to.be.an('object');
            expect(message).to.have.all.keys('error');
            expect(message.error).to.be.equal('Some fields/values are invalid. Please, check the API documentation');
          } else {
            //for (const attr in data) console.log(attr, data[attr]);
            expect(data.isAxiosError).to.be.true;
          }
        }
      })();

      let date1 = Date.now();
      let date2 = Date.now();

      while (date2 - date1 <= 1500) {
        date2 = Date.now();
      }
    }
  });

  it('POST /new Unauthorized', async function() {
    this.timeout(TIME_OUT);
    const body = {
      "Fecha": "17/03/2020",
      "ageRange": 4,
      "idplug_base": 20,
      "idplug_station": 12,
      "idunplug_base": 17,
      "idunplug_station": 164,
      "travel_time": 581,
      "user_type": 1
    };

    try {
      await axios.post(`${endpoint}/new`, body);
      console.log('Request has been successful');
    } catch (data) {
      const status = data.response.status;

      expect(status).to.be.equal(401);
    }

    try {
      await axios.post(`${endpoint}/new`, body, { headers: { 'Authorization': 'Hola' } });
      console.log('Request has been successful');
    } catch (data) {
      if (data.response) {
        const status = data.response.status;
        expect(status).to.be.equal(401);
      } else {
        expect(data.isAxiosError).to.be.true;
      }
    }
  });

  it('PUT /time/update', async function() {
    this.timeout(TIME_OUT);
    const body = {
      "Fecha": "17/03/2020",
      "Fichero": 0,
      "ageRange": 4,
      "idplug_base": 20,
      "idplug_station": 12,
      "idunplug_base": 17,
      "idunplug_station": 164,
      "travel_time": 1000,
      "user_type": 1
    };

    try {
      const response = await axios.put(`${endpoint}/time/update`, body);
      const data = response.data;
      const status = response.status;

      expect(status).to.be.equal(200);

      expect(data).to.be.an('object');
      verifyDoc(data);
      
      for (const attr in body) {
        expect(data[attr]).to.be.equal(body[attr]);
      }

    } catch (error) {
      console.log(error);
    }
  });

  it('PUT /time/update Bad Request', async function() {
    this.timeout(TIME_OUT);
    const bodies = [
      {
        "Fecha": "17/3/2020",
        "Fichero": 0,
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 1000,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "Fichero": -1,
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 1000,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "Fichero": "fichero",
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 1000,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "Fichero": 0,
        "ageRange": 40,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 1000,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "Fichero": 0,
        "ageRange": -4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 1000,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "Fichero": 0,
        "ageRange": "young",
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 1000,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "Fichero": 0,
        "ageRange": 4,
        "idplug_base": 40,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 1000,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "Fichero": 0,
        "ageRange": 4,
        "idplug_base": 0,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 1000,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "Fichero": 0,
        "ageRange": 4,
        "idplug_base": "one",
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 1000,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "Fichero": 0,
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": -12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 1000,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "Fichero": 0,
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": "hey",
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 1000,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "Fichero": 0,
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 170,
        "idunplug_station": 164,
        "travel_time": 1000,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "Fichero": 0,
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": -1,
        "idunplug_station": 164,
        "travel_time": 1000,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "Fichero": 0,
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": "hello",
        "idunplug_station": 164,
        "travel_time": 1000,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "Fichero": 0,
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 0,
        "travel_time": 1000,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "Fichero": 0,
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": "station",
        "travel_time": 1000,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "Fichero": 0,
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": -1000,
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "Fichero": 0,
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": "time",
        "user_type": 1
      },
      {
        "Fecha": "17/03/2020",
        "Fichero": 0,
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 1000,
        "user_type": 0
      },
      {
        "Fecha": "17/03/2020",
        "Fichero": 0,
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 1000,
        "user_type": 10
      },
      {
        "Fecha": "17/03/2020",
        "Fichero": 0,
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 1000,
        "user_type": "one"
      },
      {
        "Fecha": "17/03/2020",
        "Fichero": 0,
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 1000
      },
      {
        "Fecha": "17/03/2020",
        "Fichero": 0,
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "user_type": 1
      },
      {
        "Hola": "17/03/2020",
        "Fichero": 0,
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 1000,
        "user_type": 1
      },
      {
        "Hola": "17/03/2020",
        "Fecha": "17/03/2020",
        "Fichero": 0,
        "ageRange": 4,
        "idplug_base": 20,
        "idplug_station": 12,
        "idunplug_base": 17,
        "idunplug_station": 164,
        "travel_time": 1000,
        "user_type": 1
      }
    ];

    for (let i = 0; i < bodies.length; i++) {
      await (async () => {
        try {
          await axios.put(`${endpoint}/time/update`, bodies[i]);
          console.log('Request has been successful');
        } catch (data) {
          const message = data.response.data;
          const status = data.response.status;

          expect(status).to.be.equal(400);

          expect(message).to.be.an('object');
          expect(message).to.have.all.keys('error');
          expect(message.error).to.be.equal('Some fields are invalid');
        }
      })();
    }
  });

  it('PUT /time/update Not Found', async function() {
    this.timeout(TIME_OUT);
    const body = {
      "Fecha": "20/03/2020",
      "Fichero": 0,
      "ageRange": 4,
      "idplug_base": 20,
      "idplug_station": 12,
      "idunplug_base": 17,
      "idunplug_station": 164,
      "travel_time": 1000,
      "user_type": 1
    };

    try {
      await axios.put(`${endpoint}/time/update`, body);
      console.log('Request has been successful');
    } catch (data) {
      const message = data.response.data;
      const status = data.response.status;

      expect(status).to.be.equal(404);

      expect(message).to.be.an('object');
      expect(message).to.have.all.keys('error');
      expect(message.error).to.be.equal('Document not found in the database');
    }
  });
});
