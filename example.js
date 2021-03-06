"use strict";

const storage_iris = require('@torusadvisors/iris_storage');

const IRIS_HOST = process.env.IRIS_HOST || '127.0.0.1';
const IRIS_PORT = process.env.IRIS_PORT || 1972;
const IRIS_NS = process.env.IRIS_NS || 'TORUS';
const IRIS_USER = process.env.IRIS_USER || '_SYSTEM';
const IRIS_PWD = process.env.IRIS_PWD || 'SYS';

const storage = new storage_iris({host: IRIS_HOST, port: IRIS_PORT, ns: IRIS_NS, user: IRIS_USER, pwd: IRIS_PWD});

storage.init();

storage.processor.on('error', (err) => {
    console.error(err);
});

storage.processor.on('ready', () => {
    console.log('start');

    storage.dropIfExists('TORUS', 'Items')
        .then(() => {
            console.log('Torus.Items dropped!');

            let sql = "CREATE TABLE TORUS.Items (\n" +
                "    item_key VARCHAR(50) NOT NULL,\n" +
                "    item_value VARCHAR(50) DEFAULT 'Unknown'\n" +
                ")  WITH %CLASSPARAMETER DEFAULTGLOBAL = '^TORUS.ITEMS';";

            storage.iris.sql(sql)
                .then(() => {
                    console.log("Torus.Items created");
                }).then(() => {
                    sql = "";

                }).then(() => {
                    storage.iris.sql("INSERT INTO TORUS.Items (item_key, item_value) VALUES ('key_1', 'value_1')")
                        .then(() => {
                            console.log('Insert items');
                            storage.iris.sql("SELECT * FROM TORUS.Items")
                                .then(data => {
                                    console.log('result: ', data);
                                })
                        })
                })
                .catch(err => { console.error(err); });

        })
        .catch((err) => {
        console.error(err);
    });

});