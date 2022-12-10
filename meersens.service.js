const axios = require('axios');
const res = require('express/lib/response');
var config = require('./config');

module.exports = class MerseensService {

  watchData(rule, coordinates) {

    // list existing criteria according to api config
    const watchCriteria = config.meersensAPI.routes
      .filter(route => rule.criteria.some(c => c.hasOwnProperty('$' + route)));

    this.checkCoordinates(coordinates);

    watchCriteria.forEach(criteria => {
      // call API according to rule criteria : water, weather or air
      this.sendWatchRequest(config.meersensAPI.url + criteria + '/current?lat=' + coordinates.lat + '&lng=' + coordinates.lng)
        .then(function (response) {
          // check data according to the rule
          this.checkDataCriterium(response.data, rule, criteria);
        })
        .catch(function (err) {
          // handle error
          res.send(err.response.data);
        });
    });

    // if no criterium found in rule or all data was checked and no alert was sent, return status ok
    res.send({
      status: "OK"
    });
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
    let propertiesObjectInData = '$' + criterium;
    const ruleObjectForThisCriteria = rule.criteria.find(c => c.hasOwnProperty('$' + criterium));

    if (!!ruleObjectForThisCriteria) {
      const ruleForThisCriteria = ruleObjectForThisCriteria['$' + criterium];

      // if checking water or air, we must watch amongst our pollutants
      if (criterium === 'air' || criterium === 'water') {
        propertiesObjectInData += '.pollutants';
      }

      // for each property to watch within criteria, compare mesured values to applied rule
      Object.keys(ruleForThisCriteria).forEach(index => {
        if (data[propertiesObjectInData].hasOwnProperty(index) && data[propertiesObjectInData][index].value) {
          // check that value is out of rule range
          const value = data[propertiesObjectInData][index].value;
          const lowerLimit = ruleForThisCriteria[criterium].gt;
          const higherLimit = ruleForThisCriteria[criterium].lt;

          // if measured value is out of range according to the rule, throw alert
          if (value > higherLimit || value < lowerLimit) {
            res.send({
              status: "ALERT"
            })
          }
        }
      });
    }
  }
}
