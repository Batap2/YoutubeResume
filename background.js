const browserApi = (typeof browser !== "undefined") ? browser : chrome;

let lastUrl = "";
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    let newUrl = changeInfo.url;

    if (newUrl && newUrl.includes("youtube.com/watch")) {
        if (newUrl == lastUrl) {
            console.log("newUrl reset");
            browserApi.storage.local.set({ newUrl: false });
            return;
        }

        console.log("url real change");
        lastUrl = newUrl;
        browserApi.storage.local.set({ newUrl: true });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0].id;
            chrome.tabs.sendMessage(tabId, { action: "refresh" }, (response) => {
                console.log("Réponse du content script :", response);
            });
        });
    }
});