'use strict';

var config = require('./../../config/loader');
var ReporterBase = require('./../base.js');

/**
 * indent a string
 *
 * @param {String} thing
 * @param {Number} times
 * @returns {String}
 */
var indent = function (str, spaces)
{
	if (spaces === 0)
	{
		return str;
	}

	var lines = (str || '').split('\n');
	var newArr = [];
	var repeatedString = '';
	for (var i = 0; i < spaces; i++)
	{
		repeatedString += ' ';
	}

	for (var i = 0; i < lines.length; i++)
	{
		newArr.push(repeatedString + lines[i]);
	}
	return newArr.join('\n');
};

/**
 * log function
 *
 * @param {String} message
 * @param {Number} spaces Default 0
 * @param {Boolean} newLine Default True
 */
var log = function(message, spaces, newLine)
{
	if (config.log.level > 4 || config.log.page.message === true || config.log.page.resource.request === true || config.log.page.resource.received === true || config.log.page.resource.error === true)
	{
		if (message !== undefined)
		{
			console.writeLine('[ReporterConsole] ' + message);
		}
		return;
	}

	message = indent(message || '', spaces || 0);

	if (newLine === undefined || newLine === true)
	{
		console.writeLine(message);
	}
	else
	{
		console.write(message);
	}
};

/**
 * constructor
 *
 * @returns {ReporterConsole}
 */
var ReporterConsole = function()
{
	ReporterBase.apply(this, arguments);
	return this;
};

/**
 * protype definition
 */
ReporterConsole.prototype = Object.create(ReporterBase.prototype);

/**
 * if jamsine has all done
 *
 * @returns {ReporterConsole}
 */
ReporterConsole.prototype.jasmineDone = function()
{
	ReporterBase.prototype.jasmineDone.apply(this, arguments);

	if (this.specsRunned.length >= 1)
	{
		log();
		log();
	}

	log('Time: ' + (new Date() - this.runnerStartTime) / 1000 + ' seconds');

	// dump failed specs
	if (this.specsFailed.length >= 1)
	{
		log();
		log('There was ' + this.specsFailed.length + ' failure' + (this.specsFailed.length !== 1 ? 's' : '') + ':');

		this.specsFailed.forEach(function(result, index)
		{
			log((index + 1) + ') ' + result.fullName, 3);

			// dump failed messages
			result.failedExpectations.forEach(function(failedExpectation)
			{
				log(failedExpectation.message, 3);
			});
		});
	}

	// dump skipped specs
	if (this.specsSkipped.length >= 1)
	{
		log();
		log('There was ' + this.specsSkipped.length + ' skipped test' + (this.specsSkipped.length !== 1 ? 's' : '') + ':');
		this.specsSkipped.forEach(function(result, index)
		{
			log((index + 1) + ') ' + result.fullName, 3);
		});
	}

	// failures
	log();
	if (this.specsFailed.length >= 1)
	{
		var message = 'Tests: ' + this.specsRunned.length + ', Failures: ' + this.specsFailed.length;
		if (this.specsSkipped.length >= 1)
		{
			message += ', Skipped: ' + this.specsSkipped.length;
		}
		log('FAILURES!');
		log(message + '.');
	}
	// success
	else
	{
		var message = this.specsRunned.length + ' test' + (this.specsRunned.length !== 1 ? 's' : '');
		if (this.specsSkipped.length >= 1)
		{
			message += ', ' + this.specsSkipped.length + ' test' + (this.specsSkipped.length !== 1 ? 's' : '') + ' skipped';
		}
		log('OK (' + message +'.)');
	}

	return this;
};

/**
 * if jamsine is starting
 *
 * @returns {ReporterConsole}
 */
ReporterConsole.prototype.jasmineStarted = function()
{
	ReporterBase.prototype.jasmineStarted.apply(this, arguments);

	log('Jasmine ' + this.jasmine.version + '.');
	log();

	return this;
};

/**
 * a spec is finished
 *
 * @param {Object} result
 * @returns {ReporterConsole}
 */
ReporterConsole.prototype.specDone = function(result)
{
	ReporterBase.prototype.specDone.apply(this, arguments);

	if (config.log.level <= 4)
	{
		switch (result.status)
		{
			case ReporterBase.RESULT_STATUS_SUCCESS:
				log('.', 0, false);
				break;

			case ReporterBase.RESULT_STATUS_SKIPPED:
				log('S', 0, false);
				break;

			case ReporterBase.RESULT_STATUS_FAILED:
				log('F', 0, false);
				break;

			default:
				console.warn('[ReporterConsole] Unkown spec done status "' + result.status + '".');
				break;
		}
	}

	return this;
};

// export
module.exports = ReporterConsole;