var mysql = require('mysql');
var Tunnel = require('tunnel-ssh');

module.exports = function (server) {
    return new Object({
          // can really be any free port used for tunneling

            /**
             * DB server configuration. Please note that due to the tunneling the server host
             * is localhost and the server port is the tunneling port. It is because the tunneling
             * creates a local port on localhost
             */
            dbServer: {
                host: 'localhost',
                user: 'basezil1_elnikov',
                password: 'WsfzhUEr$noK',
				multipleStatements: true,
                database: 'basezil1_elnikovDB',
				port: 28000
            },

            /**
             * Default configuration for the SSH tunnel
             */
            tunnelConfig: {
			  host: 'uashared09.twinservers.net',
			  port: 21098,
			  username: 'basezil1',
			  password: '7kBB33aal9',
			  dstPort: 3306,
			  localPort: 28000
            },

            /**
             * Initialise the mysql connection via the tunnel. Once it is created call back the caller
             *
             * @param callback
             */
            init: function (callback) {
                /* tunnel-ssh < 1.0.0 
                //
                // SSH tunnel creation
                // tunnel-ssh < 1.0.0
                var me = this;
                me.tunnel = new Tunnel(this.tunnelConfig);
                me.tunnel.connect(function (error) {
                    console.log('Tunnel connected', error);
                    //
                    // Connect to the db
                    //
                    me.connection = me.connect(callback);

                });
                */

                /* tunnel-ssh 1.1.0 */
                //
                // SSH tunnel creation 
                //
                var me = this;

                // Convert original Config to new style config:
                var config = this.tunnelConfig;

               


                me.tunnel = new Tunnel(config, function (err) {
                    console.log('Tunnel connected', err);
                    if (err) {
						me.tunnel.close();
                        return console.log('Tunnel error!');
						process.exit(1);
                    }

                   me.connection  = me.connect(callback);
				   return me.connection;
                });
				me.tunnel.on('error', function(err){
					me.tunnel.close();
					console.error('Tunnel error!');
					process.exit(1);
					me.connection.end();
				});
			},

            /**
             * Mysql connection error handling
             *
             * @param err
             */
            errorHandler: function (err) {

                var me = this;
                //
                // Check for lost connection and try to reconnect
                //
				me.connection.end();
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.log('Reconnecting...');
                    me.connection = me.connect();
                } else if (err.code === 'ECONNREFUSED') {
                    //
                    // If connection refused then keep trying to reconnect every 3 seconds
                    //
                    console.log('MySQL connection refused. Trying soon again. ' + err);
					console.log('Reconnecting...');
                    setTimeout(function () {
                        me.connection = me.connect();
                    }, 3000);
                }else{
					console.log('MySQL connection error ' + err);
					console.log('Reconnecting...');
                    setTimeout(function () {
                        me.connection = me.connect();
                    }, 3000);
				}
            },

            
			
            connect: function (callback) {

                var me = this;
                //
                // Create the mysql connection object
                //
                var connection = mysql.createConnection(me.dbServer);
                connection.on('error', me.errorHandler);
                //
                // Try connecting
                //
                connection.connect(function (err) {
                    if (err) {
						console.log('Error fatal:'+err.fatal);
						process.exit(1);
					}else{
                    console.log('Mysql connected');
                    if (callback) callback(connection);
					}
                });

                return connection;
            }
        }
    );

};





