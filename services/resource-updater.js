'use strict';
var ResourceFinder = require('./resource-finder');
var Schemas = require('../generators/schemas');

function ResourceUpdater(model, params) {
  var schema = Schemas.schemas[model.modelName];

  this.perform = function () {
    // DK : TODO - Using upsert is probably not the best option here, updateAttributes is better
    // but it requires to have a handle to the ModelInstance, which means a 
    var where = {};
    where[schema.idKey] = params[schema.idKey];
    return model
      .findById(params[schema.idKey])
      .then(function(instance){
          return instance.updateAttributes(
            where,
            params
          );
      })
      .then(function () {
        return new ResourceFinder(model, { recordId: params[schema.idKey] }).perform();
      });
  };
}

module.exports = ResourceUpdater;
