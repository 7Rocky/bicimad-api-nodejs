const Cloudant = require('@cloudant/cloudant');
console.log(process.env);
const vcapLocal = require('./vcap-local.json');
const appEnv = require('cfenv').getAppEnv(vcapLocal ? { vcap: vcapLocal } : { });

let cloudant;

if (appEnv.services.cloudantNoSQLDB) {
  cloudant = Cloudant(appEnv.services.cloudantNoSQLDB[0].credentials);
} else if (process.env.CLOUDANT_URL) {
  cloudant = Cloudant(process.env.CLOUDANT_URL);
}

module.exports = class Cloudant {

  constructor(dbName) {
    this.dbName = dbName;
    this.db = null;

    if (cloudant) {
      cloudant.db.create(dbName)
        .then(() => console.log(`Created database: ${dbName}`))
        .catch(() => console.log(`Using database: ${dbName}`));

      this.db = cloudant.db.use(dbName);
    }
  }

  insert(doc) {
    return this.db.insert(doc)
      .then(body => {
        doc._id = body.id;
        return doc;
      })
      .catch(error => console.log(`[${this.dbName}.insert] `, error.message));
  }

  find(selector = { }, fields = [], sort = []) {
    return this.db.find({ selector, fields, sort })
      .then(body => body.docs)
      .catch(error => console.log(`[${this.dbName}.find] `, error.message));
  }

};
