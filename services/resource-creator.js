'use strict';
var ResourceGetter = require('./resource-getter');
var Interface = require('forest-express');

function ResourceCreator(model, params) {
  var schema = Interface.Schemas.schemas[model.modelName];

  this.perform = function () {
    return model.create(params)
      .then(function (record) {
        return new ResourceGetter(model, { recordId: record[schema.idField] });
      });
  };
}

module.exports = ResourceCreator;
