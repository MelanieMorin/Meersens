const store = require('store');
const config = require('./config');
const uuid = require('uuid');

module.exports = class RuleService {

  create(ruleInfo) {
    const existingRules = this.getAll();
    store.set('rules', [ruleInfo, ...existingRules]);
  }

  getAll() {
    return store.get('rules') || [];
  }

  get(ruleName) {
    return this.getAll().find(rule => rule.name === ruleName);
  }

  ruleIsInEffect(rule, date) {

    // check if rule has a date criterium
    const ruleDateCriterium = (rule.criteria || []).find(c => c.hasOwnProperty('$date'));
    const ruleDateObject = ruleDateCriterium ? ruleDateCriterium['$date'] : null;

    if (!!ruleDateObject && ruleDateObject.hasOwnProperty('after') && ruleDateObject.hasOwnProperty('before')) {
      // get rule validity start and end date
      const ruleStartDate = new Date(ruleDateObject.after);
      const ruleEndDate = new Date(ruleDateObject.before);

      // returns true if rule validity includes today's date
      return date > ruleStartDate && date < ruleEndDate;
    }
    else {
      return false;
    }
  }
};
