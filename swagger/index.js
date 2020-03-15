const oas3Tools = require('oas3-tools');

const options = { controllers: `${__dirname}/controllers` };

module.exports = () => {
  const expressAppConfig = oas3Tools.expressAppConfig(`${__dirname}/api/openapi.yaml`, options);
  expressAppConfig.addValidator();

  return expressAppConfig.getApp();
};
