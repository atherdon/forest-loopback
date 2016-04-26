'use strict';
var _ = require('lodash');

function ResourceGetter(model, params) {
  this.perform = function () {
    function getIncludes() {
      return _.chain(model.relations)
        .filter(function (relation) {
          return ['hasOne', 'belongsTo'].indexOf(relation.type) > -1;
        })
        .map(function (relation) {
          return relation.name;
        })
        .value();
    }

    return model
      .findById(params.recordId, {
        include: getIncludes()
      })
      .then(function (record) {
        return record.toJSON();
      });
  };
}

module.exports = ResourceGetter;
