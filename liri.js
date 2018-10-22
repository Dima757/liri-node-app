require("dotenv").config();

var keys = require("./keys.js");
var fs= require("fs");
var request = require("request");
var Spotify = require('node-spotify-api');
var moment = require("moment");