const assert = require('assert');
const RuleService = require('../rule.service');
const MeersensService = require('../meersens.service');

describe('Rule service', function () {

    const ruleService = new RuleService();
    const rule = {
        "_id": "2",
        "name": "Healthy rule",
        "description": "Alert when Ozone is too high with high temperature",
        "organization": "ACME Enterprise",
        "criteria": [
            {
                "$date": {
                    "after": "2022-01-01",
                    "before": "2024-12-31"
                }
            },
            {
                "$air": {
                    "o3": {
                        "lt": 60
                    }
                }
            },
            {
                "$weather": {
                    "temperature": {
                        "gt": 18
                    }
                }
            }
        ]
    }
    ruleService.create(rule);

    describe('getAll', function () {
        it('should return a list with 1 rule', function () {
            const totalRules = ruleService.getAll().length;
            assert.equal(totalRules, 1);
        });
    });

    describe('get : where rule exists', function () {
        it('should return the "Healthy rule" description', function () {
            const ruleDescription = ruleService.get('Healthy rule').description;
            assert.equal(ruleDescription, rule.description);
        });
    });

    describe('get : where rule does not exist', function () {
        it('should throw a "not found" error', function () {
            const foundRule = ruleService.get('random rule name');
            assert.equal(!!foundRule, false);
        });
    });

    describe('ruleIsInEffect : 31/12/2022', function () {
        it('should return true', function () {
            const inEffect = ruleService.ruleIsInEffect(rule, new Date('2022-12-31'));
            assert.equal(inEffect, true);
        });
    });

    describe('ruleIsInEffect : 31/12/2025', function () {
        it('should return false', function () {
            const inEffect = ruleService.ruleIsInEffect(rule, new Date('2025-12-31'));
            assert.equal(inEffect, false);
        });
    });
});

describe('Meersens service', function () {

    const meersensService = new MeersensService();
    const rule = {
        "_id": "2",
        "name": "Healthy rule",
        "description": "Alert when Ozone is too high with high temperature",
        "organization": "ACME Enterprise",
        "criteria": [
            {
                "$date": {
                    "after": "2022-01-01",
                    "before": "2024-12-31"
                }
            },
            {
                "$air": {
                    "o3": {
                        "lt": 60
                    }
                }
            },
            {
                "$weather": {
                    "temperature": {
                        "gt": 18
                    }
                }
            }
        ]
    }
    const request = {
        "name": "Healthy rule",
        "coordinates": { "lat": 48.8534, "lng": "2.3488" }
    };

    describe('watch : invalid coordinates', function () {
        it('should throw an "invalid coordinates" error', function () {
            request.coordinates.lat = "not a lattitude";
            let watchResult;
            try {
                watchResult = meersensService.watchData(rule, request.coordinates);
            } catch(error) {
                watchResult = error;
            }
            assert.equal(watchResult, "Meersens API exception : invalid coordinates");
        });
    });

    describe('watch : missing coordinates', function () {
        it('should throw an "missing parameter lng" error', function () {
            request.coordinates.lng = undefined;
            let watchResult;
            try {
                watchResult = meersensService.watchData(rule, request.coordinates);
            } catch(error) {
                watchResult = error;
            }
            assert.equal(watchResult, "Meersens API exception : missing parameter 'lng'");
        });
    });

});