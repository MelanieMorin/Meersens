const axios = require('axios');
const res = require('express/lib/response');
var config = require('./config');

module.exports = class MerseensService {
  headers = { "apikey": config.meersensAPI.key, "content-type": "application/json" };

  watchData(rule, coordinates) {

    // call API according to rule criteria : water, weather or air
    const watchCriteria = config.meersensAPI.routes
      .filter(route => rule.criteria.some(c => c.hasOwnProperty('$' + route)));
    const results = [];

    this.checkCoordinates(coordinates);

    watchCriteria.forEach(criteria => {

      axios.get(config.meersensAPI.url + criteria + '/current', {
        headers: this.headers,
        params: coordinates,
      }, data => {

        results.push(this.checkDataCriterium(data, criteria));

      }).then(function (response) {
        // handle success
        console.log(response);
      })
        .catch(function (err) {
          // handle error
          res.send(err);
        });
    });

    return {
      status: results.every(r => r === true) ? "OK" : "ALERT"
    }
  }

  checkCoordinates(coordinates) {
    if (!coordinates.lat) {
      res.status(400).send("Meersens API exception : missing parameter 'lat'");
    }
    if (!coordinates.lng) {
      res.status(400).send("Meersens API exception : missing parameter 'lng'");
    }
    if (isNaN(coordinates.lat) || isNaN(coordinates.lng)) {
      res.status(400).send("Meersens API exception : invalid coordinates");
    }
  }

  checkDataCriterium(data, criterium) {
    // todo : check according to criterium
    return true;
  }
};
