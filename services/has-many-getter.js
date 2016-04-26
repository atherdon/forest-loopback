'use strict';
var _ = require('lodash');
var P = require('bluebird');

function HasManyGetter(model, association, opts, params) {
  function getIncludes() {
    return _.chain(association.relations)
      .filter(function (relation) {
        return ['hasOne', 'belongsTo'].indexOf(relation.type) > -1;
      })
      .map(function (relation) {
        return relation.name;
      })
      .value();
  }

  function count() {
    return model.findById(params.recordId)
      .then(function (record) {
        return (record[params.associationName].count)();
      })
      .then(function (count) {
        return count;
      });
  }

  function getRecords() {
    var fieldsFilter = {};
    fieldsFilter[params.associationName] = true;

    return model
      .findById(params.recordId)
      .then(function (record) {
        return record[params.associationName].apply(this, [{
          limit: getLimit(),
          skip: getSkip(),
          include: getIncludes()
        }]);
      })
      .then(function (records) {
        return P.map(records, function (record) {
          return record.toJSON();
        });
      });
  }

  function hasPagination() {
    return params.page && params.page.number;
  }

  function getLimit() {
    if (hasPagination()) {
      return params.page.size || 10;
    } else {
      return 10;
    }
  }

  function getSkip() {
    if (hasPagination()) {
      return (parseInt(params.page.number) - 1) * getLimit();
    } else {
      return 0;
    }
  }

  this.perform = function () {
    return P.all([count(), getRecords()]);
  };
}

module.exports = HasManyGetter;
