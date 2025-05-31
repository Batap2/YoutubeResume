const browserApi = (typeof browser !== "undefined") ? browser : chrome;

function ifKeysDoNotExists() {
    browserApi.storage.local.get('resume', function (result) {
        if (!result.resume) {
            browserApi.storage.local.set({ 'resume': true });
        }
    });
    browserApi.storage.local.get('newUrl', function (result) {
        if (!result.resume) {
            browserApi.storage.local.set({ 'newUrl': "" });
        }
    });
}

function checkResume() {
    const currentUrl = window.location.href;
    if (!currentUrl.includes("youtube.com/watch")) return;

    browserApi.storage.local.get("resume", function (result) {
        console.log("____");
        console.log(currentUrl);
        console.log(result.resume);
        if (result.resume == currentUrl) {
            browserApi.storage.local.set({ resume: "" });
            return;
        }

        browserApi.storage.local.set({ resume: "" });

        browserApi.storage.local.get("youtubeHistory", (data) => {
            const history = data.youtubeHistory || [];
            const match = history.find(item => currentUrl.includes(item.url.split("&")[0]));

            if (!match || !match.time || match.time < 5) return;

            const shouldResume = confirm("Would you like to resume where you left off?");
            if (shouldResume) {
                const video = document.querySelector("video");
                if (video) {
                    video.currentTime = match.time;
                    video.play();
                } else {
                    const interval = setInterval(() => {
                        const v = document.querySelector("video");
                        if (v) {
                            v.currentTime = match.time;
                            v.play();
                            clearInterval(interval);
                        }
                    }, 500);
                }
            }
        });
    });
}

function test() {
    const banner = document.createElement("div");
    banner.textContent = "_______________";
    banner.style.position = "fixed";
    banner.style.top = "0";
    banner.style.left = "0";
    banner.style.zIndex = "9999";
    banner.style.background = "limegreen";
    banner.style.color = "black";
    banner.style.padding = "500px 10px";
    banner.style.fontWeight = "bold";
    banner.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 3000);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "refresh") {
        ifKeysDoNotExists();
        browserApi.storage.local.get("newUrl", (data) => {
            //test();
            checkResume();
        });
        sendResponse({ result: "done" });
    }
});

ifKeysDoNotExists();
checkResume();
