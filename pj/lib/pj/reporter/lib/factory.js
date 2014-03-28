'use strict';

var fs = require('fs');
var config = require('./../../config/loader');
var lodash = require('./../../../lodash/lodash.js');

// test all these files
var reporterFile = lodash.find([
	phantom.libraryPath + '/' + config.reporter,
	phantom.libraryPath + '/' + config.reporter + '.js',
	phantom.libraryPath + '/lib/pj/reporter/' + config.reporter,
	phantom.libraryPath + '/lib/pj/reporter/' + config.reporter + '.js',
	'./' + config.reporter,
	'./' + config.reporter + '.js'
], function(file)
{
	console.debug('[Reporter] Testing for file for reporter: ' + file);
	return fs.isFile(file) === true;
});

if (reporterFile === undefined)
{
	throw new Error('[Reporter] Reporter "' + config.reporter + '" in config not found!');
}

module.exports = require(reporterFile);