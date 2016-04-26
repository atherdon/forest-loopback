'use strict';
var ResourceGetter = require('./resource-getter');
var Interface = require('forest-express');

function ResourceUpdater(model, params) {
  var schema = Interface.Schemas.schemas[model.modelName];

  this.perform = function () {
    // DK : TODO - Using upsert is probably not the best option here,
    // updateAttributes is better but it requires to have a handle to the
    // ModelInstance, which means a
    var where = {};
    where[schema.idField] = params[schema.idField];
    return model
      .findById(params[schema.idField])
      .then(function(instance){
        return instance.updateAttributes(params);
      })
      .then(function () {
        return new ResourceGetter(model, {
          recordId: params[schema.idField]
        }).perform();
      });
  };
}

module.exports = ResourceUpdater;
