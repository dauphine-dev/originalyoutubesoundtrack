class Background {
  static get instance() { if (!this._instance) { this._instance = new this(); } return this._instance; }

  constructor() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => { return this.onRuntimeMessage(message, sender, sendResponse); });
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => { this.onTabsUpdated(tabId, changeInfo, tab); });
    chrome.tabs.onActivated.addListener((activeInfo) => { chrome.tabs.get(activeInfo.tabId, (tab) => { this.onTabGetFocus(tab); }); });
    chrome.tabs.query({}, (tabs) => { this.onStartForAllOpenedTabs(tabs); });
    chrome.windows.onFocusChanged.addListener((windowId) => {
      if (windowId === chrome.windows.WINDOW_ID_NONE) return;
      chrome.tabs.query({ active: true, windowId }, (tabs) => { this.onWindowGetFocus(tabs); });
    });
  }

  sendSetAudioTrackForce(tab) {
    if (!tab.url.includes(".youtube") && !tab.url.includes("youtu.be")) { return; }
    chrome.tabs.sendMessage(tab.id, { message: { type: "SET_AUDIO_TRACK_FORCE", tabId: tab.id } })
  }

  onTabGetFocus(tab) {
    this.sendSetAudioTrackForce(tab);
  }

  onWindowGetFocus(tabs) {
    if (tabs.length > 0) { this.sendSetAudioTrackForce(tabs[0]) }
  }

  onStartForAllOpenedTabs(tabs) {
    tabs.forEach((tab) => { this.sendSetAudioTrackForce(tab); });
  }

  injectScript(tabId) {
    chrome.tabs.executeScript(tabId, { file: "js/inject_ytipr_getter.js" });
  }

  async onTabsUpdatedOld(tabId, changeInfo, tab) {
    if (changeInfo.status === "complete" && tab.url && tab.url.includes("youtube.com")) {
      //chrome.tabs.executeScript(tabId, { file: "js/inject_fetchhook.js" });
      //chrome.tabs.executeScript(tabId, { file: "js/inject_ytipr_reader.js" });
    }
  }

  async onTabsUpdated(tabId, changeInfo, tab) {
    if (changeInfo.status === "complete" && tab.url && tab.url.includes("youtu")) { this.injectScript(tabId); }
  }

  onRuntimeMessage(message, sender, sendResponse) {
    if (message.type === "FETCH_VIDEO_PAGE" && message.videoId) {
      (async () => {


        try {
          const url = `https://www.youtube.com/watch?v=${message.videoId}`;
          const response = await fetch(url, { "headers": { "Accept-Language": "cs", } });
          const html = await response.text();

          const jsonString = this.extractYtInitialPlayerResponseJson(html);
          if (jsonString) {
            try {
              const ytipr = JSON.parse(jsonString);
              const audioTrack = ytipr?.streamingData?.adaptiveFormats?.find(entry => entry?.audioTrack?.id === ytipr?.captions?.playerCaptionsTracklistRenderer?.audioTracks[ytipr.captions.playerCaptionsTracklistRenderer.defaultAudioTrackIndex].audioTrackId)?.audioTrack?.displayName;
              let defaultSoundTrackName = audioTrack?.displayName;
              console.log("defaultSoundTrackName1:", message.videoId, defaultSoundTrackName);

              if (!defaultSoundTrackName) {
                const defaultAudioTrackId = ytipr?.streamingData?.adaptiveFormats?.find(entry => entry?.audioTrack?.audioIsDefault === true)?.audioTrack?.id;
                console.log("defaultAudioTrackId:", message.videoId, defaultAudioTrackId);
                const response = await fetch(url);
                const html = await response.text();
                const jsonString = this.extractYtInitialPlayerResponseJson(html);
                if (jsonString) {
                  try {
                    const ytipr = JSON.parse(jsonString);
                    defaultSoundTrackName = ytipr?.streamingData?.adaptiveFormats?.find(entry => entry?.audioTrack?.id === defaultAudioTrackId)?.audioTrack?.displayName;
                    console.log("defaultSoundTrackName2:", message.videoId, defaultSoundTrackName);
                  } catch { sendResponse({ defaultSoundTrackName: null }); }
                }
              }
              console.log("### send defaultSoundTrackName(b):", message.videoId, defaultSoundTrackName);
              sendResponse({ defaultSoundTrackName });

            } catch { sendResponse({ defaultSoundTrackName: null }); }
          } else { sendResponse({ defaultSoundTrackName: null }); }
        } catch { sendResponse({ defaultSoundTrackName: null }); }
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
