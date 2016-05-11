'use strict';
var P = require('bluebird');
var OperatorValueParser = require('./operator-value-parser');

function ValueStatGetter(model, params, opts) {
  //function getAggregateField() {
    //// jshint sub: true
    //return params['aggregate_field'] || 'id';
  //}

  //function getFilters() {
    //var filters = {};

    //if (params.filters) {
      //params.filters.forEach(function (filter) {
        //filters[filter.field] = new OperatorValueParser(opts).perform(model,
          //filter.field, filter.value);
      //});
    //}

    //return filters;
  //}

  function aggregate() {
    switch (params.aggregate) {
      case 'Count':
        return 'COUNT(*)';
      case 'Sum':
        // jshint camelcase: false
        return 'SUM(' + params.aggregate_field +')';
    }
  }

  this.perform = function () {
    var ds = model.dataSource;

    var sql = 'SELECT ' + aggregate() + ' FROM ' +
      model.settings.postgresql.table;

    return new P(function (resolve, reject) {
      ds.connector.query(sql, null, function (err, results) {
        if (err) { return reject(err); }
        resolve({ value: results[0][params.aggregate.toLowerCase()] });
      });
    });
  };
}

module.exports = ValueStatGetter;
