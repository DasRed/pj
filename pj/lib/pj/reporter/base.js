'use strict';

/**
 * constructor
 *
 * @returns {ReporterBase}
 */
var ReporterBase = function()
{
	return this;
};

/**
 * Spec result status messages: success
 *
 * @var {String}
 */
ReporterBase.RESULT_STATUS_SUCCESS = 'passed';

/**
 * Spec result status messages: skipped
 *
 * @var {String}
 */
ReporterBase.RESULT_STATUS_SKIPPED = 'pending';

/**
 * Spec result status messages: failed
 *
 * @var {String}
 */
ReporterBase.RESULT_STATUS_FAILED = 'failed';

/**
 * protype definition
 */
ReporterBase.prototype = Object.create(Object.prototype,
{
	jasmine:
	{
		writable: true,
		configurable: true,
		enumerable: true,
		value: null
	},
	runnerStartTime:
	{
		writable: true,
		configurable: true,
		enumerable: true,
		value: 0
	},
	specsFailed:
	{
		enumerable: false,
		configurable: false,
		get: function()
		{
			if (this._specsFailed == undefined)
			{
				this._specsFailed = [];
			}

			return this._specsFailed;
		}
	},
	specsRunned:
	{
		enumerable: false,
		configurable: false,
		get: function()
		{
			if (this._specsRunned == undefined)
			{
				this._specsRunned = [];
			}

			return this._specsRunned;
		}
	},
	specsSkipped:
	{
		enumerable: false,
		configurable: false,
		get: function()
		{
			if (this._specsSkipped == undefined)
			{
				this._specsSkipped = [];
			}

			return this._specsSkipped;
		}
	}
});

/**
 * if jamsine has all done
 *
 * @returns {ReporterBase}
 */
ReporterBase.prototype.jasmineDone = function()
{
	return this;
};

/**
 * if jamsine is starting
 *
 * @param {Object} info {totalSpecsDefined: NUMBER}
 * @returns {ReporterBase}
 */
ReporterBase.prototype.jasmineStarted = function(info)
{
	this.runnerStartTime = new Date();

	return this;
};

/**
 * a spec is finished
 *
 * @param {Object} specResult
 * @returns {ReporterBase}
 */
ReporterBase.prototype.specDone = function(specResult)
{
	this.specsRunned.push(specResult);

	switch (specResult.status)
	{
		case ReporterBase.RESULT_STATUS_SUCCESS:
			break;

		case ReporterBase.RESULT_STATUS_SKIPPED:
			this.specsSkipped.push(specResult);
			break;

		case ReporterBase.RESULT_STATUS_FAILED:
			this.specsFailed.push(specResult);
			break;
	}

	return this;
};

/**
 * a spec is started
 *
 * @param {Object} specResult
 * @returns {ReporterBase}
 */
ReporterBase.prototype.specStarted = function(specResult)
{
	return this;
};

/**
 * a suite is started
 *
 * @param {Object} suiteResult
 * @returns {ReporterBase}
 */
ReporterBase.prototype.suiteDone = function(suiteResult)
{
	return this;
};

/**
 * a suite is started
 *
 * @param {Object} suiteResult
 * @returns {ReporterBase}
 */
ReporterBase.prototype.suiteStarted = function(suiteResult)
{
	return this;
};

//export
module.exports = ReporterBase;