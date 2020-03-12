module.exports = dbName => {
  const Cloudant = require('@cloudant/cloudant'),
    vcapLocal = require('./vcap-local.json'),
    appEnv = require('cfenv').getAppEnv(vcapLocal ? { vcap: vcapLocal } : {});

  let db,
    cloudant;

  if (appEnv.services.cloudantNoSQLDB) {
    cloudant = Cloudant(appEnv.services.cloudantNoSQLDB[ 0 ].credentials);
  } else if (process.env.CLOUDANT_URL) {
    cloudant = Cloudant(process.env.CLOUDANT_URL);
  }

  if (cloudant) {
    cloudant.db.create(dbName)
      .then(() => console.log(`Created database: ${dbName}`))
      .catch(() => console.log(`Using database: ${dbName}`));
    db = cloudant.db.use(dbName);
  }

  return {
    insert(doc) {
      return db.insert(doc)
        .then(body => {
          doc._id = body.id;
          return doc;
        })
        .catch(error => console.log(`[${dbName}.insert] `, error.message));
    },
    find(selector = {}, fields = [], sort = []) {
      return db.find({ selector, fields, sort })
        .then(body => body.docs)
        .catch(error => console.log(`[${dbName}.find] `, error.message));
    }
  };
};
