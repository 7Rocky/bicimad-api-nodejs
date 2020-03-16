const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const express_openapi_validator = require('express-openapi-validator');
const fs = require('fs');
const jsyaml = require('js-yaml');
const swagger_parameters = require('oas3-tools/dist/middleware/swagger.parameters');
const swagger_router = require('oas3-tools/dist/middleware/swagger.router');
const swagger_ui = require('oas3-tools/dist/middleware/swagger.ui');

const port = process.env.PORT || 3000;

const definitionPath = `${__dirname}/swagger/api/openapi.yaml`;
const routingOptions = { controllers: `${__dirname}/swagger/controllers` };
const spec = fs.readFileSync(definitionPath, 'utf8');
const swaggerDoc = jsyaml.safeLoad(spec);
const swaggerUi = new swagger_ui.SwaggerUI(swaggerDoc);

app = express();

app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(swaggerUi.serveStaticContent());

app.use(require('./routes/bicimad.routes'));

new express_openapi_validator.OpenApiValidator({ apiSpec: definitionPath })
  .install(app)
  .then(() => {
    app.use(new swagger_parameters.SwaggerParameters().checkParameters());
    app.use(new swagger_router.SwaggerRouter().initialize(routingOptions));
    app.use((err, req, res) => {
      res.status(err.status || 500).json({ message: err.message, errors: err.errors });
    });
});

app.disable('x-powered-by');

app.listen(port, () => {
  console.log('App running at http://localhost:' + port);
  console.log(`Swagger-ui is available on http://localhost:${port}/docs`);
});
