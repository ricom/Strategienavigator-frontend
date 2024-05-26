import {defineConfig} from "cypress";

process.env.NODE_ENV = "test"

require('react-scripts/config/env')


export default defineConfig({
    video: false,
    viewportHeight: 1080,
    viewportWidth: 1920,
    defaultCommandTimeout: 10000,

    env: {
        DB_HOST: process.env.CYPRESS_DB_HOST,
        DB_NAME: process.env.CYPRESS_DB_NAME,
        DB_USER: process.env.CYPRESS_DB_USER,
        DB_PASSWORD: process.env.CYPRESS_DB_PASSWORD,
        DB_PORT: process.env.CYPRESS_DB_PORT ?? 3306,
        SMTP_PORT: process.env.CYPRESS_SMTP_PORT ?? 7777,
        BACKEND_URL: process.env.REACT_APP_API,
        APP_CLIENT_ID: process.env.REACT_APP_CLIENT_ID,
        APP_CLIENT_SECRET: process.env.REACT_APP_CLIENT_SECRET,
        TEST_LOGIN_USERNAME: process.env.CYPRESS_TEST_LOGIN_USERNAME??"max@test.test",
        TEST_LOGIN_PASSWORD: process.env.CYPRESS_TEST_LOGIN_PASSWORD??"password",
    },
    watchForFileChanges: process.env.CYPRESS_WATCH_FOR_FILE_CHANGES!=="false",


    e2e: {
        // We've imported your old cypress plugins here.
        // You may want to clean this up later by importing these.
        setupNodeEvents(on, config) {
            return require("./cypress/plugins/index.js")(on, config);
        },
        baseUrl: process.env.CYPRESS_BASE_URL,
    },

    component: {
        devServer: {
            framework: 'create-react-app',
            bundler: 'webpack'
        },
        supportFile: false,
    },
});
