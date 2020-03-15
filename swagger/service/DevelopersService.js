/**
 * Get number of dates
 * Obtain the number of available dates and also the first and last dates 
 *
 * no response value expected for this operation
 **/
exports.datesGET = () => new Promise((resolve, reject) => resolve());

/**
 * Get movements information
 * Obtain all movements within a certain day. Specify origin and/or destination stations if necessary 
 *
 * date date Date when the movement was released
 * from Integer Origin station (optional)
 * to Integer Destination station (optional)
 * no response value expected for this operation
 **/
exports.movementsGET = (date, from, to) => new Promise((resolve, reject) => resolve());

/**
 * Get movements information
 * Obtain all movements within a certain day. Specify origin and/or destination stations and a travel time if necessary 
 *
 * date date Date when the movement was released
 * from Integer Origin station
 * to Integer Destination station
 * _in Integer Travel time in seconds
 * gt Boolean Travel time greater than the value specified (optional)
 * no response value expected for this operation
 **/
exports.movementsTimeGET = (date, from, to, _in, gt) => new Promise((resolve, reject) => resolve());

/**
 * Get station identifiers
 * Obtain all the destination station identifiers 
 *
 * no response value expected for this operation
 **/
exports.stationsDestinationGET = () => new Promise((resolve, reject) => resolve());

/**
 * Get station identifiers
 * Obtain all the origin station identifiers 
 *
 * no response value expected for this operation
 **/
exports.stationsOriginGET = () => new Promise((resolve, reject) => resolve());
