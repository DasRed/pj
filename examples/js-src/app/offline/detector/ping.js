'use strict';

define(
[
	'jquery',
	'lodash'
], function(jQuery, lodash)
{
	console.log('INNER PING');
	/**
	 * DetectorPing base
	 *
	 * @param {Object} options
	 * @returns {DetectorPing}
	 */
	var DetectorPing = function(options)
	{
		this._jQueryObject = jQuery(this);

		options = options || {};

		// bind events
		if (options.on !== undefined)
		{
			this.on(options.on);
			delete options.on;
		}

		// copy options
		jQuery.extend(this, options);

		this.initialize();

		return this;
	};

	/**
	 * state online
	 */
	DetectorPing.STATE_IS_ONLINE = 'online';

	/**
	 * state OFFLINE
	 */
	DetectorPing.STATE_IS_OFFLINE = 'offline';

	// prototyping
	DetectorPing.prototype = Object.create(Object.prototype);

	/**
	 * this object as jQuery Object
	 *
	 * @var {jQuery}
	 */
	DetectorPing.prototype._jQueryObject = null;

	/**
	 * initial state
	 *
	 * @var {String}
	 */
	DetectorPing.prototype.initialState = DetectorPing.STATE_IS_ONLINE;

	/**
	 * testing interval
	 *
	 * @var {Number}
	 */
	DetectorPing.prototype.interval = 10000;

	/**
	 * current online state
	 *
	 * @var {String}
	 */
	DetectorPing.prototype.state = DetectorPing.STATE_IS_ONLINE;

	/**
	 * timeout for request
	 *
	 * @var {Number}
	 */
	DetectorPing.prototype.timeout = 1000;

	/**
	 * timer
	 *
	 * @var {Number}
	 */
	DetectorPing.prototype.timer = null;

	/**
	 * testing url
	 *
	 * @var {string}
	 */
	DetectorPing.prototype.url = '/robots.txt';

	/**
	 * destroy
	 *
	 * @returns {DetectorPing}
	 */
	DetectorPing.prototype.destroy = function()
	{
		// remove all events
		this.off();

		if (this.timer !== null)
		{
			clearInterval(this.timer);
			this.timer = null;
		}

		return this;
	};

	/**
	 * returns the online state
	 *
	 * @returns {String}
	 */
	DetectorPing.prototype.getState = function()
	{
		return this.state;
	};

	/**
	 * init
	 *
	 * @returns {Detector}
	 */
	DetectorPing.prototype.initialize = function()
	{
		var fnTest = lodash.bind(function()
		{
			jQuery.ajax(
			{
				url: this.url,
				cache: false,
				timeout: this.timeout,
				success: lodash.bind(this.setState, this, DetectorPing.STATE_IS_ONLINE),
				error: lodash.bind(this.setState, this, DetectorPing.STATE_IS_OFFLINE)
			});
		}, this);

		if (this.timer !== null)
		{
			this.destroy();
		}
		this.timer = setInterval(fnTest, this.interval);

		// parent call
		if (this.initialState != this.state)
		{
			this.setState(this.initialState);
		}

		fnTest();

		return this;
	};

	/**
	 * returns state of online / offline
	 *
	 * @returns {Boolean}
	 */
	DetectorPing.prototype.isOnline = function()
	{
		return this.getState() === DetectorPing.STATE_IS_ONLINE;
	};

	/**
	 * off binding
	 *
	 * @see http://api.jquery.com/off/
	 * @param {Mixed} see jQuery.on
	 * @returns {DetectorPing}
	 */
	DetectorPing.prototype.off = function(events, selector, handler)
	{
		this._jQueryObject.off(events, selector, handler);

		return this;
	};

	/**
	 * on binding
	 *
	 * @see http://api.jquery.com/on/
	 * @param {Mixed} see jQuery.on
	 * @returns {DetectorPing}
	 */
	DetectorPing.prototype.on = function(events, selector, data, handler)
	{
		this._jQueryObject.on(events, selector, data, handler);

		return this;
	};

	/**
	 * set the online state
	 *
	 * @param {String} state
	 */
	DetectorPing.prototype.setState = function(state)
	{
		if (this.state === state)
		{
			return this;
		}

		// validate
		switch (state)
		{
			case DetectorPing.STATE_IS_ONLINE:
			case DetectorPing.STATE_IS_OFFLINE:
				break;

			default:
				throw new Error('OfflineDetectorPing: Invalid online state given to set "' + state + '".');
				break;
		}

		console.log('OfflineDetectorPing: Switching to state "' + state + '".');

		// remember
		this.state = state;

		// trigger events
		this.trigger(this.state, [this]);
		this.trigger('change', [this, this.state]);

		return this;
	};

	/**
	 * trigger
	 *
	 * @see http://api.jquery.com/trigger/
	 * @param {String} eventType
	 * @param {Array} extraParameters
	 * @returns {DetectorPing}
	 */
	DetectorPing.prototype.trigger = function(eventType, extraParameters)
	{
		this._jQueryObject.trigger(eventType, extraParameters);

		return this;
	};

	return DetectorPing;
});