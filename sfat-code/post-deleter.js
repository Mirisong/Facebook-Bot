var self = require("sdk/self");
var pageWorker = require("sdk/page-worker");
var tabs = require("sdk/tabs");
var timer = require('sdk/timers');

exports.isReady = isReady;
exports.deletePost = deletePost;

var ready = true;
var worker;
var tick = 0, timeout = 2 * 60;

function monitor()
{
	if (tick > timeout)
	{
		console.log('post-deleter: aborting');
		postDeleted();
	}
	else
	{
		console.log('post-deleter: tick');
		tick++;
		timer.setTimeout(monitor, 1000);
	}
}

function isReady()
{
	return ready;
}

function deletePost(href)
{
	console.log('post-deleter: deleting post');
	ready = false;

	monitor();
	console.log('-------------------------------------------------------------------');
	tabs.activeTab.url = href;
	worker = tabs.activeTab.attach({
		contentScriptFile: self.data.url('delete.js')
	});
	worker.port.on('post-deleted', postDeleted);
	worker.port.emit('delete-post');
}

function postDeleted()
{
	console.log('post-deleter: post deleted');
	timer.clearTimeout(timeout);
	destroy();
	ready = true;
}

function destroy()
{
	worker.destroy();
	worker = undefined;
}
