'use strict';
var lodash = require('./../../lodash/lodash');

/**
 * constructor
 *
 * @param {WebPage} page
 * @returns {ReporterHandler}
 */
var ReporterHandler = function(page)
{
	var oldCallback = page.onCallback;

	// link into comunication
	page.onCallback = lodash.bind(function(data)
	{
		if (oldCallback !== undefined)
		{
			oldCallback(data);
		}

		if (data.type === 'PhantomJsJasmineReporterBridge')
		{
			console.debug('[ReporterHandler] Callback from PhantomJsJasmineReporterBridge for method: ', data.method, JSON.stringify(data.parameters));

			lodash.each(this.reporters, function(reporter)
			{
				reporter.jasmine = data.jasmine;
				if (reporter[data.method] instanceof Function)
				{
					reporter[data.method].apply(reporter, data.parameters);
				}
			});
		}
	}, this);

	return this;
};

/**
 * protype definition
 */
ReporterHandler.prototype = Object.create(Object.prototype,
{
	reporters:
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
 * @param {ReporterBase} reporter
 * @returns {ReporterHandler}
 */
ReporterHandler.prototype.add = function(reporter)
{
	this.reporters.push(reporter);
	return this;
};

//export
module.exports = ReporterHandler;