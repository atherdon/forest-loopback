'use strict';
var P = require('bluebird');
var OperatorValueParser = require('./operator-value-parser');

function ValueStatGetter(model, params, opts) {
  function getColumnName(field) {
    return model.definition.rawProperties[field].postgresql.columnName;
  }

  function getAggregateField() {
    // jshint sub: true
    let aggregateField = params['aggregate_field'] || 'id';
    return getColumnName(aggregateField);
  }

  function getFilters() {
    var filters = {};

    if (params.filters) {
      params.filters.forEach(function (filter) {
        filters[filter.field] = new OperatorValueParser().perform(model,
          filter.field, filter.value);
      });
    }

    return filters;
  }

  function getFiltersSQL() {
    if (params.filters) {
      let filters = [];
      params.filters.forEach(function (filter) {
        filters.push(new OperatorValueParser().perform(model,
          filter.field, filter.value, true));
      });
      return filters.join(' AND ');
    } else {
      return null;
    }
  }

  this.perform = function () {
    if (params.aggregate === 'Count') {
      return model
        .count(getFilters())
        .then((count) => {
          return { value: count };
        });
    } else {
      const table = model.settings.postgresql.table;
      const filters = getFiltersSQL();

      let sql = `SELECT SUM("${getAggregateField()}") FROM ${table}`;
      if (filters) { sql += ` WHERE ${filters}`; }

      return new P(function (resolve, reject) {
        model.dataSource.connector.query(sql, null, function (error, results) {
          if (error) { return reject(error); }
          resolve({ value: results[0][params.aggregate.toLowerCase()] });
        });
      });
    }
  };
}

module.exports = ValueStatGetter;
