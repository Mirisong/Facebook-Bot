let workerWindow = false;
let workerTab = false;

function deletePosts() {
	if (permalinks.length === 0) {
		cleanup("normal exit");
		return;
	}

	if (needsSetup()) {
		// setup() completes asynchronously, so continuing would be an error.
		// return instead and let setup() call back.
		setup();
		return;
	}

	let permalink = permalinks.pop();
	let updating = browser.tabs.update(workerTab.id, { url: permalink });
	updating.then(injectDeleter, cleanup);
}

function injectDeleter() {
	setTimeout(function() {
		console.log("injecting deleter");
		browser.tabs.executeScript(workerTab.id, {file: "/content/empty.js"});
	}, 1000);
	//let injecting = browser.tabs.executeScript(
	//	workerTab.id,
	//	{ file: "/content/empty.js" });
	//console.log("about to do then");
	//settimeout(1000, function() {
//		injecting.then(
//			function() { console.log("successfully injected"); },
//			cleanup
//		)
//	});
}

function cleanup(reason) {
	if (workerTab) {
		// closing the tab would be pointless since its window
		// is about to go away.
		workerTab = false;
	}
	if (workerWindow) {
		browser.windows.remove(workerWindow.id);
		workerWindow = false;
	}

	console.log(reason);
}

function needsSetup() {
	return (
		workerWindow === false ||
		workerTab === false
	);
}

function setup() {
	if (!workerWindow) {
		// browser.windows.create() finishes asynchronously, so continuing would
		// be an error. return instead and let onCreatedWindow call back.
		let creating = browser.windows.create({
			url: "https://www.facebook.com"
		});
		creating.then(onCreatedWindow, cleanup);
		return;
	}

	if (!workerTab) {
		// browser.tabs.create() finishes asynchronously, so continuing would
		// be an error. return instead and let onFetchedTab call back.
		let fetching = browser.tabs.query({
			windowId: workerWindow.id
		});
		fetching.then(onFetchedTab, cleanup);
		return;
	}

	// deletePosts() expects setup() to call it back since setup()
	// has to be run asynchronously.
	deletePosts();
}

function onCreatedWindow(windowInfo) {
	workerWindow = windowInfo;

	// setup() expects onCreatedWindow() to call it back since onCreatedWindow()
	// has to be run asynchronously.
	setup();
}

function onFetchedTab(tabInfos) {
	if (tabInfos.length === 0) {
		cleanup("No tabs found");
		return;
	}

	if (tabInfos.length > 1) {
		cleanup("Too many tabs found");
		return;
	}

	workerTab = tabInfos[0];

	// setup() expects onFetchedTab() to call it back since onFetchedTab()
	// has to be run asynchronously.
	setup();
}
