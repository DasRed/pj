'use strict';

require(
[
	'jquery',
	'offline/detector/ping'
], function(
	jQuery,
	DetectorPing
)
{
	describe('Offline Detector Ping (Basics)', function()
	{
		var detector = null;

		afterEach(function()
		{
			if (detector !== null)
			{
				detector.destroy();
			}
			detector = null;
		});

		beforeEach(function()
		{
			detector = new DetectorPing();
		});

		it('should have the initial state "online"', function()
		{
			expect(detector.initialState).toBe(DetectorPing.STATE_IS_ONLINE);
		});

		it('should have the state "online" if no initial state was defined', function()
		{
			expect(detector.state).toBe(DetectorPing.STATE_IS_ONLINE);
		});

		describe('constructor', function()
		{
			it('constructor should set the initial state "online" to the state property', function()
			{
				var detector = new DetectorPing(
				{
					initialState: DetectorPing.STATE_IS_ONLINE
				});

				expect(detector.getState()).toBe(DetectorPing.STATE_IS_ONLINE);

				detector.destroy();
			});

			it('constructor should set the initial state "offline" to the state property', function()
			{
				var detector = new DetectorPing(
				{
					initialState: DetectorPing.STATE_IS_OFFLINE
				});

				expect(detector.getState()).toBe(DetectorPing.STATE_IS_OFFLINE);

				detector.destroy();
			});
		});

		describe('method "destroy"', function()
		{
			it('should return itself', function()
			{
				expect(detector.destroy()).toBe(detector);
			});

			it('should remove all events', function()
			{
				var callback = jasmine.createSpy('callback for event');

				detector.on('nuff', callback);
				detector.destroy();

				detector.trigger('nuff');

				expect(callback).not.toHaveBeenCalled();
			});
		});

		it('method "getState" should get the setted state', function()
		{
			detector.setState(DetectorPing.STATE_IS_ONLINE);
			expect(detector.getState()).toBe(DetectorPing.STATE_IS_ONLINE);

			detector.setState(DetectorPing.STATE_IS_OFFLINE);
			expect(detector.getState()).toBe(DetectorPing.STATE_IS_OFFLINE);
		});

		describe('method "initialize"', function()
		{
			it('should return itself', function()
			{
				expect(detector.initialize()).toBe(detector);
			});

			it('should set the initial state to the state property', function()
			{
				var detector = new DetectorPing(
				{
					initialState: DetectorPing.STATE_IS_ONLINE
				});

				expect(detector.getState()).toBe(DetectorPing.STATE_IS_ONLINE);
				detector.destroy();

				detector = new DetectorPing(
				{
					initialState: DetectorPing.STATE_IS_OFFLINE
				});

				expect(detector.getState()).toBe(DetectorPing.STATE_IS_OFFLINE);
				detector.destroy();
			});
		});

		describe('method "isOnline"', function()
		{
			it('should return TRUE if the state is setted to "online"', function()
			{
				var detector = new DetectorPing(
				{
					initialState: DetectorPing.STATE_IS_ONLINE
				});

				expect(detector.isOnline()).toBe(true);

				detector.destroy();
			});

			it('should return FALSE if the state is setted to "offline"', function()
			{
				var detector = new DetectorPing(
				{
					initialState: DetectorPing.STATE_IS_OFFLINE
				});

				expect(detector.isOnline()).toBe(false);

				detector.destroy();
			});
		});

		describe('method "setState"', function()
		{
			it('should return itself', function()
			{
				expect(detector.setState(DetectorPing.STATE_IS_OFFLINE)).toBe(detector);
				expect(detector.setState(DetectorPing.STATE_IS_OFFLINE)).toBe(detector);
				expect(detector.setState(DetectorPing.STATE_IS_ONLINE)).toBe(detector);
			});

			it('should do nothing if the status is already set', function()
			{
				var callback = jasmine.createSpy('callback for status was change');
				var detector = new DetectorPing(
				{
					on:
					{
						change: callback
					}
				});

				detector.setState(DetectorPing.STATE_IS_ONLINE);
				expect(callback).not.toHaveBeenCalled();

				detector.destroy();
			});

			it('should throw an error if the value is not set to "online" or "offline"', function()
			{
				expect(function()
				{
					detector.setState('nuff');
				}).toThrowError('OfflineDetectorPing: Invalid online state given to set "nuff".');
			});

			it('should set the status from "offline" to "online"', function()
			{
				var detector = new DetectorPing(
				{
					initialState: DetectorPing.STATE_IS_OFFLINE
				});

				detector.setState(DetectorPing.STATE_IS_ONLINE);
				expect(detector.getState()).toBe(DetectorPing.STATE_IS_ONLINE);

				detector.destroy();
			});

			it('should set the status "online" to "offline"', function()
			{
				var detector = new DetectorPing(
				{
					initialState: DetectorPing.STATE_IS_ONLINE
				});

				detector.setState(DetectorPing.STATE_IS_OFFLINE);
				expect(detector.getState()).toBe(DetectorPing.STATE_IS_OFFLINE);

				detector.destroy();
			});

			it('should trigger the event "online" with the detector as parameter if the status was setted from "offline" to "online"', function()
			{
				var callback = jasmine.createSpy('callback for status switch to online');
				var detector = new DetectorPing(
				{
					initialState: DetectorPing.STATE_IS_OFFLINE,
					on:
					{
						online: callback
					}
				});

				detector.setState(DetectorPing.STATE_IS_ONLINE);
				expect(callback).toHaveBeenCalledWith(jasmine.any(Object), detector);

				detector.destroy();
			});

			it('should trigger the event "offline" with the detector as parameter  if the status was setted from "online" to "offline"', function()
			{
				var callback = jasmine.createSpy('callback for status  switch to offline');
				var detector = new DetectorPing(
				{
					initialState: DetectorPing.STATE_IS_ONLINE,
					on:
					{
						offline: callback
					}
				});

				detector.setState(DetectorPing.STATE_IS_OFFLINE);
				expect(callback).toHaveBeenCalledWith(jasmine.any(Object), detector);

				detector.destroy();
			});

			it('should trigger the event "change" with the detector and status as parameters if a new status was setted', function()
			{
				var callback = jasmine.createSpy('callback for status was change');
				var detector = new DetectorPing(
				{
					initialState: DetectorPing.STATE_IS_ONLINE,
					on:
					{
						change: callback
					}
				});

				detector.setState(DetectorPing.STATE_IS_OFFLINE);
				expect(callback).toHaveBeenCalledWith(jasmine.any(Object), detector, DetectorPing.STATE_IS_OFFLINE);

				detector.destroy();
			});
		});
	},
	{
		inherit: true
	});

	describe('Detector Ping (Handling)', function()
	{
		var configSuccess =
		{
			interval: 10000000,
			timeout: 2,
			url: 'app/offline/detector/pingSuccess.json'
		};
		var configFailed =
		{
			interval: 10000000,
			timeout: 2,
			url: 'app/offline/detector/pingFailed.json'
		};

		it('should use a default interval of 10000', function()
		{
			expect(DetectorPing.prototype.interval).toBe(10000);
		});

		describe('constructor', function()
		{
			it('should set the given interval', function()
			{
				var detector = new DetectorPing(configSuccess);

				expect(detector.interval).toBe(configSuccess.interval);
				detector.destroy();
			});

			it('should set the given timeout', function()
			{
				var detector = new DetectorPing(configSuccess);

				expect(detector.timeout).toBe(configSuccess.timeout);
				detector.destroy();
			});

			it('should set the given url', function()
			{
				var detector = new DetectorPing(configSuccess);

				expect(detector.url).toBe(configSuccess.url);
				detector.destroy();
			});
		});

		describe('method "destroy"', function()
		{
			it('should return itself', function()
			{
				var detector = new DetectorPing(configSuccess);

				expect(detector.destroy()).toBe(detector);
			});

			it('should remove the interval', function()
			{
				var detector = new DetectorPing(configSuccess);
				detector.destroy();

				expect(detector.timer).toBeNull();
			});
		});

		describe('method "initialize"', function()
		{
			it('should return itself', function()
			{
				var detector = new DetectorPing(configSuccess);

				expect(detector.initialize()).toBe(detector);

				detector.destroy();
			});

			it('should set the initial state "offline" if the ping failed', function(done)
			{
				var detector = new DetectorPing(configFailed);

				var timer = null;
				timer = setTimeout(function()
				{
					clearTimeout(timer);
					expect(detector.getState()).toBe(DetectorPing.STATE_IS_OFFLINE);
					detector.destroy();
					done();
				}, 10);
			});

			it('should set the initial state "online" if the ping was successfull', function(done)
			{
				var detector = new DetectorPing(configSuccess);

				var timer = null;
				timer = setTimeout(function()
				{
					clearTimeout(timer);
					expect(detector.getState()).toBe(DetectorPing.STATE_IS_ONLINE);
					detector.destroy();
					done();
				}, 10);
			});

			it('should set the state "online" if the ping becomes successfull', function(done)
			{
				var detector = new DetectorPing(
				{
					interval: 1,
					timeout: 2,
					url: configFailed.url
				});

				setTimeout(function()
				{
					detector.url = configSuccess.url;
					setTimeout(function()
					{
						expect(detector.getState()).toBe(DetectorPing.STATE_IS_ONLINE);
						done();
						detector.destroy();
					}, 5);
				}, 5);
			});

			it('should set the state "offline" if the ping becomes failed', function(done)
			{
				var detector = new DetectorPing(
				{
					interval: 1,
					timeout: 2,
					url: configSuccess.url
				});

				setTimeout(function()
				{
					detector.url = configFailed.url;
					setTimeout(function()
					{
						expect(detector.getState()).toBe(DetectorPing.STATE_IS_OFFLINE);
						done();
						detector.destroy();
					}, 50);
				}, 50);
			});
		});
	});
});