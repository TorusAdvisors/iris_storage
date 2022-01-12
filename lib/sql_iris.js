const irisnative = require('./intersystems-iris-native/index');

module.exports = class sql_iris {
    constructor(params) {
        const connection = irisnative.createConnection(params);
        this.native = connection.createIris()
    }

    sql(query) {
        let o = this;
        return new Promise((resolve, reject) => {
            let output = o.native.classMethodValue('dc.torus.Storage', 'Sql', query);

            if (output.indexOf("ERROR ", 0) === 0) {
                reject(output);
            }

            try {
                let data = JSON.parse(output);

                if (data && data.children) {
                    resolve(data.children);
                }
            } catch (e) {
                resolve(output);
            }
        });
    }
}