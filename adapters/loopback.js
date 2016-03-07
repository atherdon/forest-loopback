'use strict';
var _ = require('lodash');
var P = require('bluebird');
var Inflector = require('inflected');

module.exports = function (model, opts) {
  var fields = [];

  // FIXME - Map loopback types to the 4 forest admin recognized types
  function getTypeFor(type) {
    if (type === 'date') {
      return 'Date';
    } else if (type === 'boolean') {
      return 'Boolean';
    } else if (type === 'number') {
      return 'Number';
    } else if (type === 'any') {
      return 'String';
    } else if (type === 'geopoint') {
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

  function getInverseOf(association) {
    return association.modelFrom.modelName;
  }
  
  function getReferenceType(association) {
      return association.modelTo.modelName + '.' + association.keyFrom;
  }

  function getSchemaForColumn(fieldName, type) {
    var schema = { field: fieldName, type: type.name };
    return schema;
  }

  function getSchemaForAssociation(association) {
    var schema = {
      field: association.name,
      type: getTypeForAssociation(association),
      reference: getReferenceType(association),
      inverseOf: null//getInverseOf(association)
    };

    return schema;
  }
  
  var idKey = 'id';
  var columns = P
    .each(_.keys(model.definition.properties), function (columnName) {
      var column = model.definition.properties[columnName];
      var schema = getSchemaForColumn(columnName, column.type);
      if (typeof column.id !== 'undefined' && column.id ) {
          idKey = columnName;
      }
      fields.push(schema);
    });

  var associations = P
    .each(_.values(model.relations), function (association) {
      var schema = getSchemaForAssociation(association);
      fields.push(schema);
    });

  return P.all([
      columns,
      associations
      ])
    .then(function () {
      return {
        name: model.modelName,
        fields: fields,
        idKey: idKey
      };
    });
};

