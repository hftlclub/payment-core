//small export script of app object
//this object will be required from almost every file

const express = require('express');
const app = express();

app.getNewRouter = express.Router;

//attach helpers to app
require('./lib/helpers')(app);

module.exports = app;