'use strict';
var _ = require('lodash');

function ResourceFinder(model, params) {
  this.perform = function () {
    var includeFilter = Object.keys(model.relations); 
    return model
      .findById(params.recordId, {
        include: includeFilter
      })
      .then(function (record) {
        return record.toJSON();
      });
  };
}

module.exports = ResourceFinder;
