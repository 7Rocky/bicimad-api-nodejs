/**
 * Get number of dates
 * Obtain the number of available dates and also the first and last dates
 *
 * returns inline_response_200
 **/
exports.datesGET = () => {
  return new Promise((resolve, reject) => {
    var examples = { };
    examples['application/json'] = {
      "count": 27,
      "first": "31/05/2020",
      "last": "26/06/2019"
    };

    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

/**
 * Get movements information
 * Obtain all movements within a certain day. Specify origin and/or destination stations if necessary
 *
 * date String Date when the movement was released
 * from BigDecimal Origin station (optional)
 * to BigDecimal Destination station (optional)
 * returns List
 **/
exports.movementsGET = (date, from, to) => {
  return new Promise((resolve, reject) => {
    var examples = { };
    examples['application/json'] = [
      {
        "Fecha": "03/06/2019",
        "Fichero": 201906,
        "ageRange": 5,
        "idplug_base": 23,
        "idplug_station": 154,
        "idunplug_base": 17,
        "idunplug_station": 160,
        "travel_time": 763,
        "user_type": 1
      },
      {
        "Fecha": "03/06/2019",
        "Fichero": 201906,
        "ageRange": 5,
        "idplug_base": 23,
        "idplug_station": 154,
        "idunplug_base": 17,
        "idunplug_station": 160,
        "travel_time": 763,
        "user_type": 1
      }
    ];

    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

/**
 * Get movements information
 * Obtain all movements within a certain day. Specify origin and destination stations and a travel time. Use *gt* parameter to search for movements lasting more or less than the specified travel time
 *
 * date String Date when the movement was released
 * from BigDecimal Origin station
 * to BigDecimal Destination station
 * _in BigDecimal Travel time in seconds
 * gt Boolean Travel time greater than the value specified (optional)
 * returns List
 **/
exports.movementsTimeGET = (date, from, to, _in, gt) => {
  return new Promise((resolve, reject) => {
    var examples = { };
    examples['application/json'] = [
      {
        "Fecha": "03/06/2019",
        "Fichero": 201906,
        "ageRange": 5,
        "idplug_base": 23,
        "idplug_station": 154,
        "idunplug_base": 17,
        "idunplug_station": 160,
        "travel_time": 763,
        "user_type": 1
      },
      {
        "Fecha": "03/06/2019",
        "Fichero": 201906,
        "ageRange": 5,
        "idplug_base": 23,
        "idplug_station": 154,
        "idunplug_base": 17,
        "idunplug_station": 160,
        "travel_time": 763,
        "user_type": 1
      }
    ];

    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

/**
 * Get stations identifiers
 * Obtain all the origin/destination stations identifiers
 *
 * kind String Kind of station
 * returns inline_response_200_1
 **/
exports.stationsKindGET = kind => {
  return new Promise((resolve, reject) => {
    var examples = { };
    examples['application/json'] = {
      "stations": {
        "origin": [ 1, 2, 3 ]
      }
    };

    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

/**
 * Update travel time
 * Update travel time in seconds for a specific document
 *
 * body Body_1 Document to update (optional)
 * returns inline_response_200_2
 **/
exports.timeUpdatePUT = body => {
  return new Promise((resolve, reject) => {
    var examples = { };
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
