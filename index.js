'use strict';
var P = require('bluebird');
var Interface = require('forest-express');

exports.collection = Interface.collection;
exports.ensureAuthenticated = Interface.ensureAuthenticated;
exports.StatSerializer = Interface.StatSerializer;
exports.ResourceSerializer = Interface.ResourceSerializer;

exports.init = function(opts) {
  exports.opts = opts;

  exports.getLianaName = function () {
    return 'forest-loopback';
  };

  exports.getLianaVersion = function () {
    return require('./package.json').version;
  };

  exports.SchemaAdapter = require('./adapters/loopback');

  exports.getModels = function () {
    return opts.loopback.models;
  };

  exports.getModelName = function (model) {
    return model.modelName;
  };

  exports.ResourcesGetter = require('./services/resources-getter');
  exports.ResourceGetter = require('./services/resource-getter');
  exports.ResourceCreator = require('./services/resource-creator');
  exports.ResourceUpdater = require('./services/resource-updater');
  exports.ResourceRemover = require('./services/resource-remover');

  exports.HasManyGetter = require('./services/has-many-getter');

  exports.ValueStatGetter = require('./services/value-stat-getter');
  exports.PieStatGetter = require('./services/pie-stat-getter');
  exports.LineStatGetter = require('./services/line-stat-getter');

  exports.Stripe = {
    getCustomer: function (customerModel, customerId) {
        if (customerId) {
          return customerModel
            .findById(customerId)
            .then(function (customer) {
              return customer.toJSON();
            });
        } else {
          return new P(function (resolve) { resolve(); });
        }
    },
    getCustomerByUserField: function (customerModel, userField) {
        if (!customerModel) {
          return new P(function (resolve) { resolve(); });
        }

        var query = {};
        query[opts.integrations.stripe.userField] = userField;

        return customerModel
          .findOne({ where: query })
          .then(function (customer) {
            if (!customer) { return null; }
            return customer.toJSON();
          });
    }
  };

  exports.Intercom = {
    getCustomer: function (userModel, customerId) {
      return new P(function (resolve, reject) {
        if (customerId) {
          return userModel
          .findById(customerId)
          .lean()
          .exec(function (err, customer) {
            if (err) { return reject(err); }
            if (!customer) { return reject(); }
            resolve(customer);
          });
        } else {
          resolve();
        }
      });
    }
  };

  return Interface.init(exports);
};

//'use strict';
//var _ = require('lodash');
//var P = require('bluebird');
//var express = require('express');
//var cors = require('express-cors');
//var bodyParser = require('body-parser');
//var jwt = require('express-jwt');
//var ResourcesRoutes = require('./routes/resources');
//var AssociationsRoutes = require('./routes/associations');
//var StatRoutes = require('./routes/stats');
//var SessionRoute = require('./routes/sessions');
//var Schemas = require('./generators/schemas');
//var SchemaAdapter = require('./adapters/loopback');
//var JSONAPISerializer = require('jsonapi-serializer').Serializer;
//var request = require('superagent');
//var logger = require('./services/logger');
//var Inflector = require('inflected');

//function mapSeries(things, fn) {
  //var results = [];
  //return P.each(things, function (value, index, length) {
    //var ret = fn(value, index, length);
    //results.push(ret);
    //return ret;
  //}).thenReturn(results).all();
//}

//exports.init = function (opts) {
  //var app = express();

  //if (opts.jwtSigningKey) {
    //console.warn('DEPRECATION WARNING: the use of jwtSigningKey option is ' +
    //'deprecated. Use secret_key and auth_key instead. More info at: ' +
    //'https://github.com/ForestAdmin/forest-express-sequelize/releases/tag/0.1.0');
    //opts.authKey = opts.jwtSigningKey;
    //opts.secretKey = opts.jwtSigningKey;
  //}

  //// CORS
  //app.use(cors({
    //allowedOrigins: ['localhost:4200', '*.forestadmin.com'],
      //headers: ['Authorization', 'X-Requested-With', 'Content-Type',
        //'Stripe-Reference']
  //}));

  //// Mime type
  //app.use(bodyParser.json());

  //// Authentication
  //app.use(jwt({
    //secret: opts.authKey,
    //credentialsRequired: false
  //}));

  //new SessionRoute(app, opts).perform();

  //// Init
  //new P(function (resolve) { resolve(opts.loopback.models); })
    //.then(function (models) {
      //return Schemas.perform(models, opts)
        //.then(function () {
          //return _.values(models);
        //});
    //})
    //.each(function (model) {
      //new ResourcesRoutes(app, model, opts).perform();
      //new AssociationsRoutes(app, model, opts).perform();
      //new StatRoutes(app, model, opts).perform();
    //})
    //.then(function (models) {
      //if (opts.secretKey) {
        //mapSeries(models, function (model) {
          //return new SchemaAdapter(model, opts);
        //})
        //.then(function (collections) {
          //return new JSONAPISerializer('collections', {
            //id: 'name',
            //attributes: ['name', 'fields'],
            //fields: {
              //attributes: ['field', 'type', 'reference', 'inverseOf',
                //'collection_name']
            //},
            //meta: {
              //'liana': 'forest-express-loopback',
              //'liana_version': require('./package.json').version
            //},
            //keyForAttribute: function (key) {
              //return Inflector.camelize(key, false);
            //}
          //}).serialize(collections);
        //})
        //.then(function (json) {
          //var forestUrl = process.env.FOREST_URL ||
            //'https://forestadmin-server.herokuapp.com';

          //request
            //.post(forestUrl + '/forest/apimaps')
              //.send(json)
              //.set('forest-secret-key', opts.secretKey)
              //.end(function(err, res) {
                //if (res.status !== 204) {
                  //logger.debug('Forest cannot find your project secret key. ' +
                    //'Please, ensure you have installed the Forest Liana ' +
                    //'correctly.');
                //}
              //});
        //});
      //}
    //});

  //return app;
//};

//exports.ensureAuthenticated = require('./services/auth').ensureAuthenticated;
//exports.StatSerializer = require('./serializers/stat') ;
//exports.ResourceSerializer = require('./serializers/resource') ;
