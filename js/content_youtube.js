class ContentYoutube {
  static get instance() { if (!this._instance) { this._instance = new this(); } return this._instance; }

  constructor() {
    this._tries = 0;
    this._defaultSoundTrackName = null;
    this.listenForPlayerResponse();
    this.listenForBackgroundMessage();
  }

  listenForBackgroundMessage() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("### ListenForBackgroundMessage:", request);
      if (request.message.type === "SET_AUDIO_TRACK_FORCE") {
        this.setAudioTrackForce();
      }
    });
  }

  listenForPlayerResponse() {
    window.addEventListener("DefaultSoundTrackNameEvent", (event) => {
      console.log("### received defaultSoundTrackName(pr1):", event.detail);
      if (event.detail) {
        this._defaultSoundTrackName = event.detail;
        console.log("### received defaultSoundTrackName(pr2):", this._defaultSoundTrackName);
        this.setAudioTrack();
      }
    });
  }

  getYouTubeVideoId(urlString) {
    try {
      const url = new URL(urlString);
      const hostname = url.hostname.toLowerCase();
      const isYouTubeDomain = ["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com",
        "www.youtube-nocookie.com", "youtubeeducation.com", "www.youtubeeducation.com", "youtube.googleapis.com", "youtu.be"].includes(hostname);
      if (!isYouTubeDomain) return null;
      if (hostname === "youtu.be") { return url.pathname.slice(1, 12) || null; }
      const v = url.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) { return v; }
      const pathMatch = url.pathname.match(/\/(embed|v|shorts)\/([a-zA-Z0-9_-]{11})/);
      if (pathMatch) { return pathMatch[2]; }
      return null;
    } catch {
      return null;
    }
  }


  setAudioTrackForce() {
    console.log("### SetAudioTrackForce0");
    if (!this._defaultSoundTrackName) {
      const onResponse = (response) => {
        console.log("### received defaultSoundTrackName(f1):", response?.defaultSoundTrackName);
        if (response?.defaultSoundTrackName) {
          this._defaultSoundTrackName = response?.defaultSoundTrackName;
          console.log("### received defaultSoundTrackName(f2):", this._defaultSoundTrackName);
          this.setAudioTrack();
        }
      }
      const videoId = this.getYouTubeVideoId(window.location);
      chrome.runtime.sendMessage({ type: "FETCH_VIDEO_PAGE", videoId: videoId }, (response) => { onResponse(response) });
    }
  }

  setAudioTrack() {
    console.log("### SetAudioTrack0");
    if (!this._defaultSoundTrackName) { return; }
    console.log("### SetAudioTrack1");
    const settingsMenu = document.querySelector('.ytp-button.ytp-settings-button');
    const activeTrackMenuEntry = document.querySelector('div.ytp-menuitem.ytp-audio-menu-item[role="menuitem"] .ytp-menuitem-content');
    if (!activeTrackMenuEntry) { settingsMenu?.click(); settingsMenu?.click(); }
    console.log("### SetAudioTrack2");

    if (!activeTrackMenuEntry?.textContent) {
      if (this._tries > 20) { return; } //tries for 2 seconds, then abort.
      console.log("### SetAudioTrack(retry)");
      setTimeout(() => { this.setAudioTrack(); }, 100);
      this._tries++
      return;
    }

    if (activeTrackMenuEntry?.textContent === this._defaultSoundTrackName) { return; }
    console.log("### SetAudioTrack3");
    try {
      settingsMenu?.click(); // open settings
      if (activeTrackMenuEntry?.textContent === this._defaultSoundTrackName) { return; }
      console.log("### SetAudioTrack4");
      activeTrackMenuEntry?.click();
      // @ts-ignore
      const soundTracks = [...document.querySelectorAll('div.ytp-menuitem')];
      const targetTracMenuEntry = soundTracks.filter(x => x.textContent === this._defaultSoundTrackName)?.[0];
      targetTracMenuEntry?.click();
      if (activeTrackMenuEntry?.textContent === this._defaultSoundTrackName) { console.log("### SetAudioTrack(done"); }
      console.log("### SetAudioTrack5");
    }
    finally {
      settingsMenu?.click(); // close settings
      console.log("### SetAudioTrack6");
    }
    console.log("### SetAudioTrack7");
  }

}
ContentYoutube.instance
