var MongoClient = require('mongodb').MongoClient;
var common = require('./routes/common');

exports.addConnection = async function(connection, app) {

    return new Promise((resolve, reject) => {

        if (!app.locals.dbConnections) {
            app.locals.dbConnections = [];
        }

        if (!connection.connOptions) {
            connection.connOptions = {};
        }

        common.initTunnel(connection.ssh_options)(function(tunnel) {

            MongoClient.connect(connection.connString, connection.connOptions, function(err, database) {
                if (err) {
                    reject(err);
                } else {
                    var dbObj = {};
                    dbObj.native = database;
                    dbObj.connString = connection.connString;
                    dbObj.connOptions = connection.connOptions;
                    dbObj.tunnel = common.initTunnel(connection.ssh_options);

                    app.locals.dbConnections[connection.connName] = null;
                    app.locals.dbConnections[connection.connName] = dbObj;
                    resolve();
                }

                tunnel && tunnel.close();

            });

        });

    });

};

exports.removeConnection = function(connection, app) {

    if (!app.locals.dbConnections) {
        app.locals.dbConnections = [];
    }

    try {
        app.locals.dbConnections[connection].native.close();
    } catch (e) {}

    delete app.locals.dbConnections[connection];
    return;
};