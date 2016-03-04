'use strict';
var _ = require('lodash');
var Inflector = require('inflected');
var auth = require('../services/auth');
var HasManyFinder = require('../services/has-many-finder');
var ResourceSerializer = require('../serializers/resource');
var Schemas = require('../generators/schemas');

module.exports = function (app, model, opts) {

  function getAssociationModel(associationName) {
    var schema = Schemas.schemas[model.modelName];
    var field = _.findWhere(schema.fields, { field: associationName });
    if (field && field.reference) {
      var referenceName = field.reference.split('.')[0];
      return Inflector.camelize(Inflector.singularize(referenceName));
    }
  }

  function index(req, res, next) {
    var params = _.extend(req.query, req.params);
    var associationModel = opts.loopback.models[
      getAssociationModel(req.params.associationName)];

    return new HasManyFinder(model, associationModel, opts, params)
      .perform()
      .then(function (result) {
        return new ResourceSerializer(associationModel, result.records, opts, {
          count: result.count
        }).perform();
      })
      .then(function (records) {
        res.send(records);
      })
      .catch(next);
  }

  this.perform = function () {
    //var resourcePath = Inflector.pluralize(Inflector.underscore(model.modelName)).toLowerCase();
    var resourcePath = model.modelName;

    app.get('/forest/' + resourcePath + '/:recordId/:associationName',
      auth.ensureAuthenticated, index);
  };
};
