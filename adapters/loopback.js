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
    switch (association.associationType) {
      case 'BelongsTo':
      case 'HasOne':
        return 'Number';
      case 'HasMany':
      case 'BelongsToMany':
        return ['Number'];
    }
  }

  function getInverseOf(association) {
    return association.source.options.name.pluralize;
  }

  function getSchemaForColumn(fieldName, type) {
    var schema = { field: fieldName, type: type.name };
    return schema;
  }

//   function getSchemaForAssociation(association) {
//     var schema = {
//       field: association.associationAccessor,
//       type: getTypeForAssociation(association),
//       reference: association.target.options.name.plural + '.id',
//       inverseOf: getInverseOf(association)
//     };

//     return schema;
//   }
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

//   var associations = P
//     .each(_.values(model.associations), function (association) {
//       var schema = getSchemaForAssociation(association);
//       fields.push(schema);
//     });

  return P.all([columns])
    .then(function () {
      return {
        name: model.pluralModelName,
        fields: fields,
        idKey: idKey
      };
    });
};

