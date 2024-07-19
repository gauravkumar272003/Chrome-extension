(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];

    const fetchBookmarks = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([currentVideo], (obj) => {
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
            });
        });
    };

    const addNewBookmarkEventHandler = async () => {
        const currentTime = youtubePlayer.currentTime;
        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at " + getTime(currentTime),
        };

        currentVideoBookmarks = await fetchBookmarks();

        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
        });
    };

    const newVideoLoaded = async () => {
        youtubeLeftControls = document.querySelector(".ytp-left-controls");
        youtubePlayer = document.querySelector(".video-stream");

        if (!youtubeLeftControls || !youtubePlayer) {
            console.error("YouTube player elements not found");
            return;
        }

        const bookmarkBtnExists = document.querySelector(".bookmark-btn");

        if (!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement("img");
            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.className = "ytp-button bookmark-btn";
            bookmarkBtn.title = "Click to bookmark current timestamp";

            youtubeLeftControls.appendChild(bookmarkBtn);
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
        }
    };

    chrome.runtime.onMessage.addListener(async (obj, sender, response) => {
        const { type, value, videoId } = obj;

        if (type === "NEW") {
            currentVideo = videoId;
            newVideoLoaded();
        } else if (type === "PLAY") {
            if (youtubePlayer) {
                youtubePlayer.currentTime = value;
                youtubePlayer.play(); // Ensure the video plays
            } else {
                console.error("YouTube player not found");
            }
        } else if (type === "DELETE") {
            currentVideoBookmarks = await fetchBookmarks();
            const updatedBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
            chrome.storage.sync.set({ [currentVideo]: JSON.stringify(updatedBookmarks) });

            response(updatedBookmarks);
        }
    });

    newVideoLoaded();
})();

const getTime = t => {
    var date = new Date(0);
    date.setSeconds(t);
    return date.toISOString().substr(11, 8);
};
