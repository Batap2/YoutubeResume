const browserApi = (typeof browser !== "undefined") ? browser : chrome;

function getYoutubeThumbnail(url) {
    const videoId = new URL(url).searchParams.get("v");
    return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}

function rerollList() {
    browserApi.storage.local.get("youtubeHistory", (data) => {
        const history = data.youtubeHistory || [];
        let list = document.getElementById("videoList");

        // Nettoyer la liste actuelle
        list.innerHTML = "";

        if (history.length === 0) {
            return;
        }

        list.style.maxHeight = "300px";
        list.style.overflowY = "auto";

        history.forEach((item, index) => {
            const videoUrl = `${item.url}&t=${Math.floor(item.time)}`+"s";

            const wrapper = document.createElement("div");
            wrapper.style.display = "flex";
            wrapper.style.alignItems = "center";
            wrapper.style.marginBottom = "10px";
            wrapper.style.gap = "10px";

            // Miniature cliquable
            const thumb = document.createElement("img");
            thumb.src = getYoutubeThumbnail(item.url);
            thumb.alt = "thumbnail";
            thumb.style.cursor = "pointer";
            thumb.style.width = "120px";
            thumb.onclick = () => {
                browserApi.storage.local.set({ resume: videoUrl });
                browserApi.tabs.create({ url: videoUrl });
            };

            // Bouton supprimer
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Del";
            removeBtn.onclick = () => {
                history.splice(index, 1);
                browserApi.storage.local.set({ youtubeHistory: history }, rerollList);
            };

            wrapper.appendChild(thumb);
            wrapper.appendChild(removeBtn);
            list.appendChild(wrapper);
        });
    });
}

document.getElementById("addButton").onclick = () => {

    console.log("test");
    browserApi.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        let url = tab.url.replace(/[?&]t=\d+s?/, "").replace(/([?&])$/, "");
        const title = tab.title;

        browserApi.scripting.executeScript(
            {
                target: { tabId: tab.id },
                func: () => document.querySelector("video")?.currentTime || 0
            },
            (results) => {
                const time = results?.[0]?.result || 0;

                browserApi.storage.local.get("youtubeHistory", (result) => {
                    const history = result.youtubeHistory || [];

                    // Supprimer doublon
                    const existingIndex = history.findIndex((item) => item.url === url);
                    if (existingIndex !== -1) {
                        history.splice(existingIndex, 1);
                    }

                    history.unshift({ url, title, time });
                    browserApi.storage.local.set({ youtubeHistory: history.slice(0, 20) }, rerollList);
                });

                const banner = document.createElement("div");
                banner.textContent = "Video added";
                banner.style.position = "fixed";
                banner.style.top = "0";
                banner.style.left = "0";
                banner.style.zIndex = "9999";
                banner.style.background = "limegreen";
                banner.style.color = "black";
                banner.style.padding = "5px 10px";
                banner.style.fontWeight = "bold";
                banner.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
                document.body.appendChild(banner);
                setTimeout(() => banner.remove(), 3000);
            }
        );
    });
};

// Lancer le chargement initial de la liste
rerollList();
