/**
 * Adds a new document to the database
 * Adds a new document to the database, only if the user is authenticated correctly. There is no need to specify *Fichero* field, it will be set to zero anyway
 *
 * body Body Document to add (optional)
 * returns inline_response_200_2
 **/
exports.newPOST = body => {
  return new Promise((resolve, reject) => {
    let examples = { };
    examples['application/json'] = {
      "Fecha": "03/06/2019",
      "Fichero": 201906,
      "ageRange": 5,
      "idplug_base": 23,
      "idplug_station": 154,
      "idunplug_base": 17,
      "idunplug_station": 160,
      "travel_time": 763,
      "user_type": 1
    };

    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
};
