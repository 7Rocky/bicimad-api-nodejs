const utils = require('../utils/writer.js');
const Developers = require('../service/DevelopersService');

module.exports.datesGET = (req, res, next) => {
  Developers.datesGET()
    .then(response => utils.writeJson(res, response))
    .catch(response => utils.writeJson(res, response));
};

module.exports.movementsGET = (req, res, next, date, from, to) => {
  Developers.movementsGET(date, from, to)
    .then(response => utils.writeJson(res, response))
    .catch(response => utils.writeJson(res, response));
};

module.exports.movementsTimeGET = (req, res, next, date, from, to, _in, gt) => {
  Developers.movementsTimeGET(date, from, to, _in, gt)
    .then(response => utils.writeJson(res, response))
    .catch(response => utils.writeJson(res, response));
};

module.exports.stationsDestinationGET = (req, res, next) => {
  Developers.stationsDestinationGET()
    .then(response => utils.writeJson(res, response))
    .catch(response => utils.writeJson(res, response));
};

module.exports.stationsOriginGET = (req, res, next) => {
  Developers.stationsOriginGET()
    .then(response => utils.writeJson(res, response))
    .catch(response => utils.writeJson(res, response));
};
