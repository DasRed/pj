'use strict';

(function(jasmine)
{
	jasmine.Expectation.addCoreMatchers(
	{
		toBeLessOrEqualThen: function()
		{
			return {
				compare: function(actual, expected)
				{
					return {
						pass: actual <= expected
					};
				}
			};
		}
	});
})(jasmine);