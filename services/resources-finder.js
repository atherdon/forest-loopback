'use strict';
var _ = require('lodash');
var OperatorValueParser = require('./operator-value-parser');
var Schemas = require('../generators/schemas');
var P = require('bluebird');
var Inflector = require('inflected');


function ResourcesFinder(model, opts, params) {
  var schema = Schemas.schemas[model.modelName];
  
  function getIncludes() {
    var includes = Object.keys(model.relations);

    // _.each(params.filter, function (value, key) {
    //   if (key.indexOf(':') > -1) {
    //     var splitted = key.split(':');
    //     var associationName = splitted[0];
    //     var fieldName = splitted[1];

    //     var where = {};
    //     where[fieldName] = new OperatorValueParser()
    //       .perform(model, key, value);

    //     includes.push({
    //       model: model.associations[associationName].target,
    //       where: where
    //     });
    //   }
    // });

    return includes;
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
    // return model
    //   .findAndCountAll({
    //     include: getIncludes(),
    //     limit: getLimit(),
    //     offset: getSkip(),
    //     where: getWhere(),
    //     order: getOrder()
    //   })
    //   .then(function (result) {
    //     var records = result.rows.map(function (r) {
    //       return r.toJSON();
    //     });

    //     return [result.count, records];
    //   });
    var queryParams = {
          limit: getLimit(),
          skip: getSkip(),
          where: getWhere(),
          include : getIncludes()
        };
    if (getOrder().length !== 0) {
        queryParams.order = getOrder();
    }
    
    return model
      .find(queryParams)
      .then(function (results) {
        var records = results.map(function (r) {
          return r.toJSON();
        });
        
        // Get the total number of records
        return model.count().then(function(total){
            return [total, records];            
        })

      });
  }

  function handleSearchParam() {
    var where = {};
    var or = [];

    _.each(schema.fields, function (field) {
      var q = {};

      if (field.type === 'String' && !field.reference) {
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
    return new P(function(resolve,reject) {
        getRecords().then(function(results) {
            resolve({count : results[0], records : results[1]});
        });
    });
  };
}

module.exports = ResourcesFinder;
