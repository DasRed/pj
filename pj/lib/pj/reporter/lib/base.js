'use strict';

/**
 * constructor
 *
 * @param {WebPage} page
 * @returns {ReporterBase}
 */
var ReporterBase = function(page, onFinish)
{
	this.page = page;

	var self = this;
	var oldCallback = page.onCallback;

	// link into comunication
	page.onCallback = function(data)
	{
		if (oldCallback !== undefined)
		{
			oldCallback(page, data);
		}

		if (data.type === 'PhantomJsJasmineReporterBridge')
		{
			console.debug('[Reporter] Callback from PhantomJsJasmineReporterBridge for method: ', data.method, JSON.stringify(data.parameters));

			self.jasmine = data.jasmine;
			if (self[data.method] !== undefined)
			{
				self[data.method].apply(self, data.parameters);
			}

			if (data.method === 'jasmineDone' && onFinish!== undefined)
			{
				onFinish();
			}
		}
	};

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
	page:
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
		writable: true,
		configurable: true,
		enumerable: true,
		value: []
	},
	specsRunned:
	{
		writable: true,
		configurable: true,
		enumerable: true,
		value: []
	},
	specsSkipped:
	{
		writable: true,
		configurable: true,
		enumerable: true,
		value: []
	}
});

/**
 * if jamsine has all done
 *
 * @returns {ReporterBase}
 */
ReporterBase.prototype.jasmineDone = function()
{
	console.info('[Reporter] Jasmine has finished.');

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
	console.info('[Reporter] Jasmine is started with ' + info.totalSpecsDefined + ' specs defined.');

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

	console.info('[Reporter] Jasmine has finished the spec "' + specResult.fullName + '" with status "' + specResult.status + '".');

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
	console.info('[Reporter] Jasmine starts the spec "' + specResult.fullName + '".');

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
	console.info('[Reporter] Jasmine has finished the suite "' + suiteResult.fullName + '".');

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
	console.info('[Reporter] Jasmine starts the suite "' + suiteResult.fullName + '".');

	return this;
};

//export
module.exports = ReporterBase;