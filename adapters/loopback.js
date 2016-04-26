'use strict';
var _ = require('lodash');
var P = require('bluebird');

module.exports = function (model) {
  var fields = [];

  function getTypeFor(type) {
    if (type === 'GeoPoint') {
      return 'String';
    } else {
      return type;
    }
  }

  function getTypeForAssociation(association) {
    switch (association.type) {
      case 'belongsTo':
      case 'hasOne':
        return 'String';
      case 'hasMany':
      case 'belongsToMany':
        return ['String'];
    }
  }

  function getReferenceType(association) {
    return association.modelTo.modelName + '.' + association.keyFrom;
  }

  function getSchemaForColumn(fieldName, type) {
    var schema = { field: fieldName, type: getTypeFor(type.name) };
    return schema;
  }

  function getSchemaForAssociation(association) {
    var schema = {
      field: association.name,
      type: getTypeForAssociation(association),
      reference: getReferenceType(association),
      inverseOf: null
    };

    return schema;
  }

  var idField = 'id';

  var columns = P
    .each(_.keys(model.definition.properties), function (columnName) {
      var column = model.definition.properties[columnName];
      var schema = getSchemaForColumn(columnName, column.type);

      if (typeof column.id !== 'undefined' && column.id) {
        idField = columnName;
      }

      fields.push(schema);
    });

  var associations = P
    .each(_.values(model.relations), function (association) {
      fields.push(getSchemaForAssociation(association));
    });

  return P.all([columns, associations])
    .then(function () {
      return {
        name: model.modelName,
        fields: fields,
        idField: idField
      };
    });
};

