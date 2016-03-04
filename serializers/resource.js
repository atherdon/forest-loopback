'use strict';
var _ = require('lodash');
var JSONAPISerializer = require('jsonapi-serializer').Serializer;
var Inflector = require('inflected');
var Schemas = require('../generators/schemas');

function ResourceSerializer(model, records, opts, meta) {
  var schema = Schemas.schemas[model.modelName];

  this.perform = function () {
    var typeForAttributes = {};

    function getTypeForAttribute(fieldType) {
        if (_.isArray(fieldType)) {
            return fieldType[0];
        } else {
            return fieldType;
        }
    }
    
    function getAttributesFor(dest, fields) {
      _.map(fields, function (field) {
        if (_.isPlainObject(field.type)) {
          dest[field.field] = {
            attributes: _.map(field.type.fields, 'field')
          };

          getAttributesFor(dest[field.field], field.type.fields);
        } else if (field.reference) {
          var referenceType = typeForAttributes[field.field] =
            field.reference.split('.')[0];


          var referenceSchema = Schemas.schemas[referenceType];
          dest[field.field] = {
            // Hmmm - This probably can't be hardcoded
            ref: 'id',
            attributes: _.map(referenceSchema.fields, 'field'),
            relationshipLinks: {
              related: function (dataSet, relationship) {
                // FIXME - use a Util Fn to return this from a central location
                //var resourcePath = Inflector.pluralize(Inflector.underscore(model.modelName)).toLowerCase();
                var resourcePath = model.modelName;
                var ret = {
                  href: '/forest/' + resourcePath + '/' +
                    dataSet[dest.id] + '/' + field.field,
                };

                if (_.isArray(field.type)) {
                  ret.meta = { count: relationship.length || 0 };
                }

                return ret;
              }
            }
          };

          if (_.isArray(field.type)) {
            dest[field.field].ignoreRelationshipData = true;
            dest[field.field].included = false;
          }
        }
      });
    }

    var serializationOptions = {
      attributes: _.map(schema.fields, 'field'),
      keyForAttribute: function (key) {
        return Inflector.underscore(key);
      },
      typeForAttribute: function (attribute) {
        return typeForAttributes[attribute] || attribute;
      },
      meta: meta,
      id : schema.idKey
    };

    getAttributesFor(serializationOptions, schema.fields);

    return new JSONAPISerializer(schema.name,
      serializationOptions).serialize(records);
  };
}

module.exports = ResourceSerializer;
