const event_emitter = require('events');
const sql_iris = require("./sql_iris");
class processor extends event_emitter {}

module.exports = class storage_iris {
    constructor(connection_params) {
        this.iris = new sql_iris(connection_params);

        this.processor = new processor();
    }

    debug(...args) {
        if (process.env.IRIS_DEBUG) {
            console.log(...args);
        }
    }

    init() {
        let o = this;

        o.iris.sql("SELECT 'test ok' as test").then(res => {
            if (res && res[0] && res[0].test === 'test ok') {
                o.processor.emit('ready');
            }
        }).catch(err => { o.processor.emit('error', {msg:'No connection', error:err}); });
    }

    dropIfExists(table_scheme, table_name) {
        let o = this;

        return new Promise((resolve, reject) => {
            o.iris
                .sql("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = " +
                    "'"+ table_scheme + "' AND TABLE_NAME = '" + table_name + "'")
                .then(data => {
                    if (data.length > 0) {
                        o.debug('really dropped');
                        o.iris
                            .sql("DROP TABLE "+table_scheme+"."+table_name)
                            .then(data => {
                                resolve();
                            })
                            .catch(err => {
                                reject(err);
                            });
                    }

                    resolve();
                })
                .catch(err => {
                    reject(err);
                });
        });
    }
}