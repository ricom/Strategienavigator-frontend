/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const ms = require('smtp-tester');
const crypto = require("crypto");
/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
    // `on` is used to hook into various events Cypress emits
    // `config` is the resolved Cypress config

    // Usage: cy.task('queryDb', query)

    if (config.testingType === 'component') {
        require('@cypress/react/plugins/react-scripts')(on, config)
    } else {
        // starts the SMTP server at localhost:7777
        const port = config.env["SMTP_PORT"];
        const mailServer = ms.init(port)
        console.log('mail server at port %d', port)

        // process all emails
        mailServer.bind((addr, id, email) => {
            console.log('--- email ---')
            console.log(addr, id, email)
        })


        const options = {
            outputRoot: 'cypress/',
            outputTarget: {
                'logs/txt|txt': 'txt',
                'logs/json|json': 'json'
            },
            printLogsToFile: 'always'
        };

        require('cypress-terminal-report/src/installLogsPrinter')(on, options);


        const mysql = require("mysql2");
        const bcrypt = require('bcrypt');
        const crypto = require('crypto');
        const fs = require('node:fs/promises');

        function getConnection(config) {
            const connection = mysql.createConnection({
                "host": config.env.DB_HOST,
                "user": config.env.DB_USER,
                "password": config.env.DB_PASSWORD,
                "port": config.env.DB_PORT
            });
            // start connection to db
            connection.connect();
            return connection;
        }

        function queryTestDb(query, config) {
            // creates a new mysql connection using credentials from cypress.json env's
            const connection = getConnection(config)
            // exec query + disconnect to db as a Promise
            return new Promise((resolve, reject) => {
                connection.query(query, (error, results) => {
                    if (error) reject(error);
                    else {
                        connection.end();
                        // console.log(results)
                        return resolve(results);
                    }
                });
            });
        }

        async function insertResource(saveId, path, name, type, config) {

            // read file
            const data = await fs.readFile(path);
            let hashFunction = crypto.createHash("sha256");
            hashFunction.update(data);
            let hash = hashFunction.digest('hex');


            const query = `INSERT INTO \`${config.env.DB_NAME}\`.save_resources
                                    (save_id, file_name, file_type,contents ,contents_hash,hash_function,created_at, updated_at)
                                    VALUES
                                    (?,?,?,?,?,
                                    "sha256",
                                    CURRENT_TIMESTAMP,
                                    CURRENT_TIMESTAMP);`;
            // creates a new mysql connection using credentials from cypress.json env's
            const connection = getConnection(config);

            return await new Promise((resolve, reject) => {
                connection.query(query, [saveId, name, type, data,hash], (error, results) => {
                    if (error) reject(error);
                    else {
                        connection.end();
                        // console.log(results)
                        return resolve(results);
                    }
                });
            });

        }

        on("task", {
            queryDb: query => {
                return queryTestDb(query, config);
            }
        });
        on("task", {
            insertResource: ({saveId, name, type, path}) => {
                return insertResource(saveId, path, name, type, config);
            }
        });
        on("task", {
            bcrypt: password => {
                const saltRounds = 10;
                var myPlaintextPassword = password;
                var passwordHashed = bcrypt.hashSync(myPlaintextPassword, saltRounds)
                return passwordHashed;
            }
        });
    }

    return config;
}

