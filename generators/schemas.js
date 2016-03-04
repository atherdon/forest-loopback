'use strict';
var P = require('bluebird');
var SchemaAdapter = require('../adapters/loopback');
var Inflector = require('inflected');

module.exports = {
  schemas: [],
  perform: function (models, opts) {
    var that = this;

    return P.each(Object.keys(models), function (modelName) {
      var model = models[modelName];

      return new SchemaAdapter(model, opts)
        .then(function (schema) {
          that.schemas[model.modelName] = schema;
        });
    });
  }
};
