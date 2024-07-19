import { getActiveTab } from "./utils.js";

const addNewBookmark = (bookmarks, bookmark) => {
    const bookmarkTitleElement = document.createElement("div");
    const controlsElement = document.createElement("div");
    const newBookmarkElement = document.createElement("div");

    bookmarkTitleElement.textContent = bookmark.desc;
    bookmarkTitleElement.className = "bookmark-title";
    controlsElement.className = "bookmark-controls";

    setBookmarkAttributes("play", onPlay, controlsElement);
    setBookmarkAttributes("delete", onDelete, controlsElement);

    newBookmarkElement.id = "bookmark-" + bookmark.time;
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("timestamp", bookmark.time);

    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlsElement);
    bookmarks.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks = []) => {
    const bookmarksElement = document.getElementById("bookmarks");
    bookmarksElement.innerHTML = "";

    if (currentBookmarks.length > 0) {
        for (const bookmark of currentBookmarks) {
            addNewBookmark(bookmarksElement, bookmark);
        }
    } else {
        bookmarksElement.innerHTML = '<i class="row">No saves</i>';
    }
};

const onPlay = async e => {
    const bookmarkTime = e.target.closest(".bookmark").getAttribute("timestamp");
    const activeTab = await getActiveTab();

    if (activeTab && activeTab.id) {
        chrome.tabs.sendMessage(activeTab.id, {
            type: "PLAY",
            value: bookmarkTime,
        });
    } else {
        console.error("Active tab not found");
    }
};

const onDelete = async e => {
    const activeTab = await getActiveTab();
    const bookmarkTime = e.target.closest(".bookmark").getAttribute("timestamp");
    const bookmarkElementToDelete = document.getElementById("bookmark-" + bookmarkTime);

    if (bookmarkElementToDelete) {
        bookmarkElementToDelete.remove();
    }

    if (activeTab && activeTab.id) {
        chrome.tabs.sendMessage(activeTab.id, {
            type: "DELETE",
            value: bookmarkTime,
        }, viewBookmarks);
    } else {
        console.error("Active tab not found");
    }
};

const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement("img");

    controlElement.src = "assets/" + src + ".png";
    controlElement.title = src;
    controlElement.addEventListener("click", eventListener);
    controlParentElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", async () => {
    const activeTab = await getActiveTab();
    const queryParameters = activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentVideo = urlParameters.get("v");

    if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
        chrome.storage.sync.get([currentVideo], (data) => {
            const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];
            viewBookmarks(currentVideoBookmarks);
        });
    } else {
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML = '<div class="title">What are you tryna do dude?? Open Youtube....</div>';
    }
});
