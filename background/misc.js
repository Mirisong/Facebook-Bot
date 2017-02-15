let permalinks = [];
browser.browserAction.onClicked.addListener(handleButton);

function handleButton() {
	if (permalinks.length > 0) {
		deletePosts(permalinks);
	}
	else {
		extractPosts();
	}
}
