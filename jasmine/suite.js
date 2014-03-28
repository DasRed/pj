'use strict';

(function()
{
	/**
	 * extending the originale describe with options
	 */
	var describeOriginal = describe;

	/**
	 * new describe
	 *
	 * @param {String}  description
	 * @param {Function} specDefinitions
	 * @param {Object} options
	 * 		{
	 * 			 inherit: BOOLEAN .. inherit beforeEaches and afterEaches to child
	 * 		}
	 * @returns {jasmine.Suite}
	 */
	describe = function(description, specDefinitions, options)
	{
		options = options || {};
		options.inherit = !!options.inherit;

		var suite = describeOriginal.call(this, description, specDefinitions);
		suite._options = options;

		if (suite.parentSuite && suite.parentSuite._options && suite.parentSuite._options.inherit === true)
		{
			suite.beforeFns = suite.parentSuite.beforeFns;
			suite.afterFns = suite.parentSuite.afterFns;
		}

		return suite;
	};
})();
