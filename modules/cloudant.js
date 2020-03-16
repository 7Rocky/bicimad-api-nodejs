module.exports = class Cloudant {

  constructor(dbName) {
    const Cloudant = require('@cloudant/cloudant');
    const appEnv = require('cfenv').getAppEnv(
      process.env.NODE_ENV === 'production' ? { } : { vcap: require('./vcap-local.json') }
    );

    this.dbName = dbName;
    this.db = null;

    let cloudant;

    if (appEnv.services.cloudantNoSQLDB) {
      cloudant = Cloudant(appEnv.services.cloudantNoSQLDB[0].credentials);
    } else if (process.env.CLOUDANT_URL) {
      cloudant = Cloudant(process.env.CLOUDANT_URL);
    }

    if (cloudant) {
      cloudant.db.create(dbName)
        .then(() => console.log(`Created database: ${dbName}`))
        .catch(() => console.log(`Using database: ${dbName}`));

      this.db = cloudant.db.use(dbName);
    }

    console.log(this.db);
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
