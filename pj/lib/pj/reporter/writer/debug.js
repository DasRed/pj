'use strict';

var ReporterBase = require('./../base.js');

/**
 * constructor
 *
 * @returns {ReporterDebug}
 */
var ReporterDebug = function()
{
	ReporterBase.apply(this);
	return this;
};

/**
 * protype definition
 */
ReporterDebug.prototype = Object.create(ReporterBase.prototype);

/**
 * if jamsine has all done
 *
 * @returns {ReporterDebug}
 */
ReporterDebug.prototype.jasmineDone = function()
{
	console.info('[ReporterDebug] Jasmine has finished.');

	ReporterBase.prototype.jasmineDone.apply(this, arguments);

	return this;
};

/**
 * if jamsine is starting
 *
 * @param {Object} info {totalSpecsDefined: NUMBER}
 * @returns {ReporterDebug}
 */
ReporterDebug.prototype.jasmineStarted = function(info)
{
	console.info('[ReporterDebug] Jasmine is started with ' + info.totalSpecsDefined + ' specs defined.');

	ReporterBase.prototype.jasmineStarted.apply(this, arguments);

	return this;
};

/**
 * a spec is finished
 *
 * @param {Object} result
 * @returns {ReporterDebug}
 */
ReporterDebug.prototype.specDone = function(specResult)
{
	console.info('[ReporterDebug] Jasmine has finished the spec "' + specResult.fullName + '" with status "' + specResult.status + '".');

	ReporterBase.prototype.specDone.apply(this, arguments);

	return this;
};

/**
 * a spec is started
 *
 * @param {Object} specResult
 * @returns {ReporterDebug}
 */
ReporterDebug.prototype.specStarted = function(specResult)
{
	console.info('[ReporterDebug] Jasmine starts the spec "' + specResult.fullName + '".');

	ReporterBase.prototype.specStarted.apply(this, arguments);

	return this;
};

/**
 * a suite is started
 *
 * @param {Object} suiteResult
 * @returns {ReporterDebug}
 */
ReporterDebug.prototype.suiteDone = function(suiteResult)
{
	console.info('[ReporterDebug] Jasmine has finished the suite "' + suiteResult.fullName + '".');

	ReporterBase.prototype.suiteDone.apply(this, arguments);

	return this;
};

/**
 * a suite is started
 *
 * @param {Object} suiteResult
 * @returns {ReporterDebug}
 */
ReporterDebug.prototype.suiteStarted = function(suiteResult)
{
	console.info('[ReporterDebug] Jasmine starts the suite "' + suiteResult.fullName + '".');

	ReporterBase.prototype.suiteStarted.apply(this, arguments);

	return this;
};

// export
module.exports = ReporterDebug;