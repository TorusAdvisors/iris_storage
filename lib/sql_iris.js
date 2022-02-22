const irisnative = require('./intersystems-iris-native/index');

module.exports = class sql_iris {
    constructor(params) {
        const connection = irisnative.createConnection(params);
        this.native = connection.createIris()
    }

    chunkSubstr(str, size) {
        const numChunks = Math.ceil(str.length / size)
        const chunks = new Array(numChunks)

        for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
            chunks[i] = str.substr(o, size)
        }

        return chunks
    }

    chunk_insert(table_name, data) {
        let o = this;
        return new Promise((resolve, reject) => {
            try {
                let json_string = JSON.stringify(data);
                let chunks = o.chunkSubstr(json_string, 10000);

                o.native.classMethodValue('dc.torus.Storage', 'ClearCache');

                chunks.forEach(chunk => {
                    o.native.classMethodValue('dc.torus.Storage', 'WriteToCache', chunk);
                });

                let output = o.native.classMethodValue('dc.torus.Storage', 'ChunkInsert', table_name);
                resolve(output);

            } catch (e) {
                reject(e);
            }
        });

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