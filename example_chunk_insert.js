"use strict";

const storage_iris = require('./lib/storage_iris');

const IRIS_HOST = process.env.IRIS_HOST || '127.0.0.1';
const IRIS_PORT = process.env.IRIS_PORT || 1972;
const IRIS_NS = process.env.IRIS_NS || 'TORUS';
const IRIS_USER = process.env.IRIS_USER || '_SYSTEM';
const IRIS_PWD = process.env.IRIS_PWD || 'SYS';

const start_timer = Math.floor(+new Date() / 1000);

let data = [];
for (let i = 0; i < 100000; i++) {
    let k = 'key_'+i;
    let v = 'value_'+i;
    let item = {'item_key':k, 'item_value':v};
    data.push(item);
}

const storage = new storage_iris({host: IRIS_HOST, port: IRIS_PORT, ns: IRIS_NS, user: IRIS_USER, pwd: IRIS_PWD});

storage.init();

storage.processor.on('error', (err) => {
    console.error(err);
});

storage.processor.on('ready', () => {
    console.log('start');

    storage.dropIfExists('TORUS', 'ITEMS')
        .then(() => {
            console.log('TORUS.ITEMS dropped!');

            let sql = "CREATE TABLE TORUS.ITEMS (\n" +
                "    item_key VARCHAR(50) NOT NULL,\n" +
                "    item_value VARCHAR(50) DEFAULT 'Unknown'\n" +
                ")  WITH %CLASSPARAMETER DEFAULTGLOBAL = '^TORUS.ITEMS'";

            storage.iris.sql(sql)
                .then(() => {
                    console.log("TORUS.ITEMS created");
                }).then(() => {
                    storage.iris.chunk_insert('TORUS.ITEMS', data).then((out) => {
                        console.log('inserted', out, Math.floor(+new Date() / 1000) - start_timer);

                    }).catch(err => { console.log(err); });
                })
                .catch(err => { console.error(err); });
        })
        .catch((err) => {
        console.error(err);
    });

});