let tab = false;

function deletePosts() {
	if (permalinks.length === 0) {
		cleanup("normal exit");
		return;
	}

	browser.tabs.onUpdated.addListener(reinject);
	browser.runtime.onMessage.addListener(onDeleted);

	let permalink = permalinks[0];
	let updating = browser.tabs.update({ url: permalink });
	updating.then(function(tabInfo){ tab = tabInfo; }, cleanup);
}

function onDeleted(message) {
	// HACK: this gets spurious calls for some reason;
	// not sure why, so for now just detect and ignore them.
	if (message.to === "deleter" &&
		message.body === permalinks[0]) {
		permalinks.shift();
		deletePosts();
	}
}

function reinject(tabId, changeInfo, tabInfo) {
	if (shouldInject(tabId, tabInfo) === false) {
		return;
	}

	tab = tabInfo;
	let injecting = browser.tabs.executeScript({file: "/content/deleter.js"});
	injecting.then(
		function() { },
		cleanup
	);
}

function shouldInject(tabId, tabInfo) {
	return (
		tab &&
		tab.id === tabId &&
		tabInfo.status === "complete"
	);
}

function cleanup(reason) {
	if (browser.tabs.onUpdated.hasListener(reinject)) {
		browser.tabs.onUpdated.removeListener(reinject);
	}

	if (browser.runtime.onMessage.hasListener(onDeleted)) {
		browser.runtime.onConnect.removeListener(onDeleted);
	}

	console.log(reason);
}
