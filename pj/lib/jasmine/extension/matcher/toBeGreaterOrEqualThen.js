'use strict';

(function(jasmine)
{
	jasmine.Expectation.addCoreMatchers(
	{
		toBeGreaterOrEqualThen: function()
		{
			return {
				compare: function(actual, expected)
				{
					return {
						pass: actual >= expected
					};
				}
			};
		}
	});
})(jasmine);