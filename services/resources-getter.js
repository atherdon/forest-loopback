'use strict';
var _ = require('lodash');
var OperatorValueParser = require('./operator-value-parser');
var Interface = require('forest-express');

function ResourcesGetter(model, opts, params) {
  var schema = Interface.Schemas.schemas[model.modelName];

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

  function getOrder() {
    var sort = [];
    if (params.sort) {
      var order = 'ASC';

      if (params.sort[0] === '-') {
        params.sort = params.sort.substring(1);
        order = 'DESC';
      }

      sort.push(params.sort + ' ' + order);
    }

    return sort;
  }

  function getRecords() {
    var queryParams = {
      limit: getLimit(),
      skip: getSkip(),
      where: getWhere(),
      include : getIncludes()
    };

    var order = getOrder();
    if (order.length !== 0) { queryParams.order = order; }

    return model
      .find(queryParams)
      .then(function (results) {
        return results.map(function (r) {
          return r.toJSON();
        });
      })
      .then(function (records) {
        return model.count()
          .then(function (total) {
            return [total, records];
          });
      });
  }

  function handleSearchParam() {
    var where = {};
    var or = [];

    _.each(schema.fields, function (field) {
      var q = {};

      if (field.type === 'String' && typeof field.reference === 'undefined') {
        q[field.field] = { like: '%' + params.search + '%' };
        or.push(q);
      }

    });

    where.or = or;
    return where;
  }

  function handleFilterParams() {
    var where = {};
    var and = [];

    _.each(params.filter, function (value, key) {
      var q = {};

      if (key.indexOf(':') === -1) {
        q[key] = new OperatorValueParser().perform(model, key, value);
      }

      and.push(q);
    });

    where.and = and;
    return where;
  }

  function getWhere() {
    var where = {};

    if (params.search) {
      where = _.extend(where, handleSearchParam());
    }

    if (params.filter) {
      where = _.extend(where, handleFilterParams());
    }

    return where;
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
    return getRecords();
  };
}

module.exports = ResourcesGetter;
