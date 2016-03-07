'use strict';
var _ = require('lodash');
var P = require('bluebird');

function HasManyFinder(model, association, opts, params) {
  function count() {
    return model.findById(params.recordId)
      .then(function (record) {
        return (record[params.associationName].count)();
      })
      .then(function (count) {
        return count;
      })
      ;
  }

  function getRecords() {
    var fieldsFilter = {};
    fieldsFilter[params.associationName] = true;

      return model
      .findById(params.recordId, {include : params.associationName})
      .then(function (record) {
            return new P(function (resolve, reject) {
                record[params.associationName].apply(this, [{
                    limit: getLimit(),
                    skip: getSkip()
                }, function(err, results){
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                }]);
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
    return P.all([
        count(),
        getRecords()
        ])
    .then(function(results){
        return {count : results[0], records: results[1]};
    });
  };
}

module.exports = HasManyFinder;
