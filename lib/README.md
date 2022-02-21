## @torusadvisors/iris_storage

Library for filling data into Iris (InterSystems) 

### Usage

#### Run docker instance of InterSystems IRIS with library (https://github.com/TorusAdvisors/iris)
https://hub.docker.com/repository/docker/torusadvisors/iris
```bash
docker run --rm --name iris -d --publish 1972:1972 --publish 52773:52773 torusadvisors/iris:latest
```


### Nodejs client 
@see example.js
```javascript
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

    // ready to use

});
```

### Create table 
```javascript
let sql = "CREATE TABLE TORUS.Items (\n" +
    "    Key VARCHAR(100) NOT NULL,\n" +
    "    Value VARCHAR(255) DEFAULT 'Unknown'\n" +
    ")";

storage.iris.sql(sql)
    .then(() => {
        console.log("Torus.Items created");

    })
    .catch(err => { console.error(err); });
```

### Insert items 
```javascript
let sql = "INSERT INTO TORUS.Items (Key, Value) VALUES ('key_1', 'value_1')";
storage.iris.sql(sql);
```

### Select items 
```javascript
storage.iris.sql("SELECT * FROM TORUS.Items")
    .then(data => {
        console.log('result: ', data);
    })

```

### Chunk insert items
```javascript
let data = [];
for (let i = 0; i < 30000; i++) {
    let k = 'key_'+i;
    let v = 'value_'+i;
    let item = {'item_key':k, 'item_value':v};
    data.push(item);
}

data = JSON.stringify(data);

let sql = "CREATE TABLE TORUS.Items (\n" +
    "    item_key VARCHAR(50) NOT NULL,\n" +
    "    item_value VARCHAR(50) DEFAULT 'Unknown'\n" +
    ")  WITH %CLASSPARAMETER DEFAULTGLOBAL = '^TORUS.ITEMS'";

storage.iris.sql(sql)
    .then(() => {
        console.log("Torus.Items created");
    }).then(() => {
        storage.iris.chunk_insert('^TORUS.ITEMS.1', data).then((out) => {
            console.log('inserted', out, Math.floor(+new Date() / 1000) - start_timer);
    
        }).catch(err => { console.log(err); });
    }).catch(err => { console.error(err); });
```

More https://docs.intersystems.com/irislatest/csp/docbook/DocBook.UI.Page.cls?KEY=GSQL_intro