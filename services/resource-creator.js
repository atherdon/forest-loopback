'use strict';
var ResourceFinder = require('./resource-finder');
var Schemas = require('../generators/schemas');

function ResourceCreator(model, params) {

  var schema = Schemas.schemas[model.modelName];
  
  this.perform = function () {
    return model.create(params)
      .then(function (record) {
        return new ResourceFinder(model, { recordId: record[schema.idKey] });
      });
  };
}

module.exports = ResourceCreator;
