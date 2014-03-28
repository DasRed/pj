'use strict';
var lodash = require('./../../lodash/lodash.js');
var config = require('./../config/loader');

/**
 * constructor
 *
 * @param {Webpage} page
 * @param {Function} onComplete
 * @returns {PageResourceWatcher}
 */
var PageResourceWatcher = function(page, onComplete)
{
	var self = this;
	this.onComplete = onComplete || this.onComplete;

	page.onLoadFinished = function()
	{
		self.loadFinished();
	};

	page.onResourceRequested = function(resource, networkRequest)
	{
		self.request(resource, networkRequest);
	};

	page.onResourceReceived = function(resource)
	{
		self.receive(resource);
	};

	page.onResourceError = function(resource)
	{
		self.error(resource);
	};

	return this;
};

// prototype
PageResourceWatcher.prototype = Object.create(Object.prototype,
{
	finished:
	{
		writable: true,
		configurable: true,
		enumerable: true,
		value: false
	},
	onComplete:
	{
		writable: true,
		configurable: true,
		enumerable: true,
		value: function() {}
	},
	resources:
	{
		writable: true,
		configurable: true,
		enumerable: true,
		value: {}
	},
	timer:
	{
		writable: true,
		configurable: true,
		enumerable: true,
		value: null
	}
});

/**
 * if a resource is errored
 *
 * @param {Object} resource
 * @returns {PageResourceWatcher}
 */
PageResourceWatcher.prototype.error = function(resource)
{
	if (config.log.page.resource.error === true)
	{
		console.warn('[PageResourceWatcher] Unable to load resource (#' + resource.id + '): Error: ' + resource.errorCode + ' - ' + resource.errorString);
	}

	this.remove(resource);

	return this;
};

/**
 * if page loading is started
 *
 * @returns {PageResourceWatcher}
 */
PageResourceWatcher.prototype.loadFinished = function()
{
	this.setTimer();

	return this;
};

/**
 * if a resource is received
 *
 * @param {Object} resource
 * @returns {PageResourceWatcher}
 */
PageResourceWatcher.prototype.receive = function(resource)
{

	if (config.log.page.resource.received === true)
	{
		console.debug('[PageResourceWatcher] Response (#' + resource.id + '): [' + resource.stage + '] ' + resource.url);
	}

	switch (resource.stage)
	{
		case 'start':
			this.set('start', resource);
			break;

		case 'end':
			this.remove(resource);
			break;

		default:
			console.warn('[PageResourceWatcher] Unkown stage "' + resource.stage + '" for resource (#' + resource.id + '): ' + resource.url);
			break;
	}

	return this;
};

/**
 * if a resource is requested
 *
 * @param {Object} resource
 * @param {Object} networkRequest
 * @returns {PageResourceWatcher}
 */
PageResourceWatcher.prototype.request = function(resource, networkRequest)
{
	if (this.finished && config.pathResources !== null)
	{
		var url = resource.url.replace(phantom.libraryPath, '').replace('file:///', '');
		if (url.substr(0, 1) === '/')
		{
			url = url.substr(1);
		}
		url = 'file:///' + phantom.libraryPath + '/' + config.pathResources + '/' + url;

		networkRequest.changeUrl(url);

		console.debug('[PageResourceWatcher] Request (#' + resource.id + '): switching ' + resource.url + ' to ' + url);
	}
	else if (config.log.page.resource.request === true)
	{
		console.debug('[PageResourceWatcher] Request (#' + resource.id + '): ' + resource.url);
	}

	this.set('request', resource);

	return this;
};

/**
 * remove a resource
 *
 * @param {Object} resource
 * @returns {PageResourceWatcher}
 */
PageResourceWatcher.prototype.remove = function(resource)
{
	this.setTimer();

	if (this.resources[resource.id] !== undefined)
	{
		delete this.resources[resource.id];
	}

	return this;
};

/**
 * set a resource
 *
 * @param {Object} resource
 * @returns {PageResourceWatcher}
 */
PageResourceWatcher.prototype.set = function(status, resource)
{
	this.setTimer();

	if (this.resources[resource.id] === undefined)
	{
		this.resources[resource.id] = status;
	}

	this.resources[resource.id] = status;

	return this;
};

/**
 * timer handling to detecting if all resources loaded
 *
 * @returns {PageResourceWatcher}
 */
PageResourceWatcher.prototype.setTimer = function()
{
	if (this.timer !== null)
	{
		clearTimeout(this.timer);
	}

	if (this.finished === false)
	{
		var self = this;
		this.timer = setTimeout(function()
		{
			clearTimeout(self.timer);
			if (self.finished === false)
			{
				self.finished = true;
				self.onComplete();
			}
		}, config.resourceTimeout);
	}

	return this;
};

module.exports = PageResourceWatcher;