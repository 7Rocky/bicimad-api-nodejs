const utils = require('../utils/writer.js');
const Default = require('../service/DefaultService');

module.exports.datesGET = (req, res, next) => {
  Default.datesGET()
    .then(response => utils.writeJson(res, response))
    .catch(response => utils.writeJson(res, response));
};

module.exports.movementsGET = (req, res, next, date, from, to) => {
  Default.movementsGET(date, from, to)
    .then(response => utils.writeJson(res, response))
    .catch(response => utils.writeJson(res, response));
};

module.exports.movementsTimeGET = (req, res, next, date, from, to, _in, gt) => {
  Default.movementsTimeGET(date, from, to, _in, gt)
    .then(response => utils.writeJson(res, response))
    .catch(response => utils.writeJson(res, response));
};

module.exports.stationsKindGET = (req, res, next, kind) => {
  Default.stationsKindGET(kind)
    .then(response => utils.writeJson(res, response))
    .catch(response => utils.writeJson(res, response));
};

module.exports.timeUpdatePUT = (req, res, next, body) => {
  Default.timeUpdatePUT(body)
    .then(response => utils.writeJson(res, response))
    .catch(response => utils.writeJson(res, response));
};
