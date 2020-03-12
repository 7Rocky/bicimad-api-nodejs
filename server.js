const cors = require('cors');
const express = require('express');

const app = require('./swagger/index')(); // express()
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(require('./routes/bicimad.routes'));

/*const data = require('../../bicimad.json');
const len = data.length;
const step = 10
let i = 0;

console.log(len);
let interval;

app.get(`${endpoint}/`, (req, res) => {
  interval = setInterval(insertData, 1000);
});

const insertData = () => {
  if (i < len - 1) {
    console.log(i);

    for (let j = i; j < i + step; j++) {
      bicimad.insert(data[j]);
    }

    i += step;
  } else {
    bicimad.insert(data[len - 1]);
    console.log('Fin');
    clearInterval(interval);
  }
};*/

app.listen(port, () => {
  console.log('App running at http://localhost:' + port);
  console.log(`Swagger-ui is available on http://localhost:${port}/docs`);
});
