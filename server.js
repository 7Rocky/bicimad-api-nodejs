const cors = require('cors');
const express = require('express');

const app = require('./swagger/index')(); // express()
const port = process.env.PORT || 3000;

app.disable('x-powered-by');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(require('./routes/bicimad.routes'));

app.listen(port, () => {
  console.log('App running at http://localhost:' + port);
  console.log(`Swagger-ui is available on http://localhost:${port}/docs`);
});
