const utils = require('../utils/writer.js');
const Admins = require('../service/AdminsService');

module.exports.newPOST = (req, res, next, body) => {
  Admins.newPOST(body)
    .then(response => utils.writeJson(res, response))
    .catch(response => utils.writeJson(res, response));
};
