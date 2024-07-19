// Listener for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Check if the updated tab's URL includes "youtube.com/watch"
    if (tab.url && tab.url.includes("youtube.com/watch")) {
        // Extract query parameters from the URL
        const queryParameters = tab.url.split("?")[1];
        const urlParameters = new URLSearchParams(queryParameters);

        // Get the video ID from the URL parameters
        const videoId = urlParameters.get("v");

        // Send a message to the content script with the video ID
        if (videoId) {
            chrome.tabs.sendMessage(tabId, {
                type: "NEW",
                videoId: videoId,
            });
        }
    }
});
