'use strict';

var ReporterBase = require('./../base.js');

/**
 * constructor
 *
 * @returns {ReporterFinished}
 */
var ReporterFinished = function()
{
	ReporterBase.apply(this, arguments);
	return this;
};

/**
 * protype definition
 */
ReporterFinished.prototype = Object.create(ReporterBase.prototype);

/**
 * if jamsine has all done
 *
 * @returns {ReporterFinished}
 */
ReporterFinished.prototype.jasmineDone = function()
{
	ReporterBase.prototype.jasmineDone.apply(this, arguments);

	console.info('[ReporterFinished] Jasmine has finished, exiting phantom.');
	phantom.exit(0);

	return this;
};

// export
module.exports = ReporterFinished;