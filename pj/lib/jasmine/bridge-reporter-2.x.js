'use strict';

(function(jasmine)
{
	/**
	 * constructor
	 *
	 * @returns {jasmine.PhantomJsJasmineReporterBridge}
	 */
	jasmine.PhantomJsJasmineReporterBridge = function()
	{
		return this;
	};

	/**
	 * protype definition
	 */
	jasmine.PhantomJsJasmineReporterBridge.prototype = Object.create(Object.prototype);

	// create all relevant callbacks
	[
		"jasmineStarted",
		"jasmineDone",
		"suiteStarted",
		"suiteDone",
		"specStarted",
		"specDone"
	].forEach(function(method)
	{
		jasmine.PhantomJsJasmineReporterBridge.prototype[method] = function()
		{
			// convert arguments to array
			var parameters = [];
			for (var i = 0; i < arguments.length; i++)
			{
				parameters.push(arguments[i]);
			}

			window.callPhantom(
			{
				type: 'PhantomJsJasmineReporterBridge',
				method: method,
				parameters: parameters,
				jasmine:
				{
					version: jasmine.version
				}
			});

			return this;
		};
	});
})(jasmine);
