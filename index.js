const express = require('express');
const MeersensService = require('./meersens.service');
const RuleService = require('./rule.service');
const app = express();
const port = 3111;
const ruleService = new RuleService();

app.use(express.json());

app.get('/', (req, res) => {
  res.send(ruleService.getAll());
});

app.post('/create', (req, res) => {
  ruleService.create(req.body);
  res.send("ok");
});

app.post('/watch', (req, res) => {
  const meersensService = new MeersensService();

  // check if rule exists and is in effect
  const foundRule = ruleService.get(req.body.name);
  if (!!foundRule) {
    if (ruleService.ruleIsInEffect(foundRule)) {
      if (!!req.body.coordinates) {
        try {
          const watchDataResult = meersensService.watchData(foundRule, req.body.coordinates);
          res.status(200).send(watchDataResult);
        } catch(error) {
          res.send(error);
        }
      } 
      else {
        // bad request : data cannot be checked
        res.status(400).send("Missing parameter 'coordinates'");
      }
    }
    else {
      // no rule to apply for current conditions : data does not have to be checked
      return res.status(200).send("Status OK");
    }
  }
  else {
    // rule not found : data is not checked
    return res.status(404).send("Rule not found for name '" + req.body.name + "'");
  }
});

app.listen(port, () => {
  console.log(`App is live at http://localhost:${port}`);
});
