class Background {
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => { return this.OnRuntimeMessage(message, sender, sendResponse); });
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => { this.OnTabsUpdated(tabId, changeInfo, tab); });
  }

  async OnTabsUpdated(tabId, changeInfo, tab) {
    if (changeInfo.status === "complete" && tab.url && tab.url.includes("youtube.com")) {
      chrome.tabs.executeScript(tabId, { file: "js/inject_fetchhook.js" });
      chrome.tabs.executeScript(tabId, { file: "js/inject_ytipr_reader.js" });
    }
  }

  OnRuntimeMessage(message, sender, sendResponse) {
    if (message.type === "FETCH_VIDEO_PAGE" && message.videoId) {
      (async () => {
        const url = `https://www.youtube.com/watch?v=${message.videoId}`;
        try {
          const response = await fetch(url);
          const html = await response.text();
          const jsonString = this.extractYtInitialPlayerResponseJson(html);

          if (jsonString) {
            try {
              const ytipr = JSON.parse(jsonString);
              const defaultSoundTrackName = ytipr?.streamingData?.adaptiveFormats?.find(entry => entry?.audioTrack?.id === ytipr?.captions?.playerCaptionsTracklistRenderer?.audioTracks[ytipr.captions.playerCaptionsTracklistRenderer.defaultAudioTrackIndex].audioTrackId)?.audioTrack?.displayName;
              sendResponse({ defaultSoundTrackName });
            } catch (e) {
              sendResponse({ defaultSoundTrackName: null });
            }
          } else {
            sendResponse({ defaultSoundTrackName: null });
          }
        } catch (error) {
          sendResponse({ defaultSoundTrackName: null });
        }
      })();
      // important: inform the browser this is an async response
      return true;
    }
    // fallback for all non managed messages
    return false;
  }

  extractYtInitialPlayerResponseJson(html) {
    const marker = "var ytInitialPlayerResponse =";
    const startIndex = html.indexOf(marker);
    if (startIndex === -1) { return; }
    const jsonStart = html.indexOf("{", startIndex);
    let braceCount = 0;
    let jsonEnd = jsonStart;
    for (let i = jsonStart; i < html.length; i++) {
      if (html[i] === "{") braceCount++;
      else if (html[i] === "}") braceCount--;
      if (braceCount === 0) {
        jsonEnd = i + 1;
        break;
      }
    }
    const jsonString = html.slice(jsonStart, jsonEnd);
    return jsonString;
  }

}
Background.instance;
