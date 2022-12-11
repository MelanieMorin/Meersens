const axios = require('axios');
const res = require('express/lib/response');
var config = require('./config');

module.exports = class MerseensService {

  watchData(rule, coordinates) {

    // list existing criteria according to api config
    const watchCriteria = config.meersensAPI.routes
      .filter(route => rule.criteria.some(c => c.hasOwnProperty('$' + route)));

    this.checkCoordinates(coordinates);

    // build boolean array to check every criterium
    const results = [];

    const requestsPromise = new Promise((resolve, reject) => {
      watchCriteria.forEach((criteria, index) => {
        // call API according to rule criteria : water, weather or air
        this.sendWatchRequest(config.meersensAPI.url + criteria + '/current?lat=' + coordinates.lat + '&lng=' + coordinates.lng)
          .then(response => {
            // check data according to the rule
            results.push(this.checkDataCriterium(response.data, rule, criteria));
          })
          .catch(err => {
            // handle error
            res.send(err.response.data);
            reject();
          })
          .finally(() => {
            if (index === watchCriteria.length - 1) {
              resolve(results.every(r => r === true) ? "OK" : "ALERT");
            }
          });
      });
    });

    // if no criterium found in rule or all data was checked and no alert was sent, return status ok
    return requestsPromise.then(status => ({
        status: status
      })
    );
  }

  sendWatchRequest(url) {
    return axios({
      method: 'get',
      url: url,
      headers: {
        'apikey': config.meersensAPI.key,
        'Content-Type': 'application/json'
      }
    });
  }

  checkCoordinates(coordinates) {
    if (!coordinates.lat) {
      res.status(400);
      throw "Meersens API exception : missing parameter 'lat'";
    }
    if (!coordinates.lng) {
      res.status(400);
      throw "Meersens API exception : missing parameter 'lng'";
    }
    if (isNaN(coordinates.lat) || isNaN(coordinates.lng)) {
      res.status(400);
      throw "Meersens API exception : invalid coordinates";
    }
  }

  checkDataCriterium(data, rule, criterium) {

    // if checking water or air, we must watch amongst our pollutants
    if (criterium === 'air' || criterium === 'water') {
      data = data.pollutants;
    } else if (criterium === 'weather') {
      data = data.parameters;
    }

    const criteriumWatchProperties = rule.criteria.find(c => c.hasOwnProperty('$' + criterium))['$' + criterium];

    // for each property to watch within criteria, compare measured values to applied rule
    return Object.keys(criteriumWatchProperties).map(index => {
      if (data.hasOwnProperty(index) && data[index].value) {
        // check that value is out of rule range
        const value = data[index].value;
        const lowerLimit = criteriumWatchProperties[index].gt;
        const higherLimit = criteriumWatchProperties[index].lt;

        // if measured value is out of range according to the rule, throw alert
        if ((higherLimit !== undefined && value > higherLimit) || (lowerLimit !== undefined && value < lowerLimit)) {
          return false;
        }
      }
      // otherwise return that data is fine
      return true;
    }).every(result => result === true); // returns false if at least one criterium is not respected (alert)
  }
}
