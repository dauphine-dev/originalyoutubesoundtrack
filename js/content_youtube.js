class ContentYoutube {
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this.listenForPlayerResponse();
  }

  listenForPlayerResponse() {
    window.addEventListener("DefaultSoundTrackNameEvent", (event) => {
      const defaultSoundTrackName = event.detail;
      this.setAudioTrack(defaultSoundTrackName);
    });
  }

  setAudioTrack(defaultSoundTrackName) {
    if (!defaultSoundTrackName) return;
    const settingsMenu = document.querySelector('.ytp-button.ytp-settings-button');
    const activeTrackMenuEntry = document.querySelector('div.ytp-menuitem.ytp-audio-menu-item[role="menuitem"] .ytp-menuitem-content');
    if (!activeTrackMenuEntry) { settingsMenu?.click(); settingsMenu?.click(); }
    
    if (!activeTrackMenuEntry?.textContent) {
      if (this._tries > 20) { return; } //tries for 2 seconds, then abort.
      setTimeout(() => { this.setAudioTrack(defaultSoundTrackName); }, 100);
      this._tries++
      return;
    }

    if (activeTrackMenuEntry?.textContent === defaultSoundTrackName) { return; }
    try {
      settingsMenu?.click(); // open settings
      if (activeTrackMenuEntry?.textContent === defaultSoundTrackName) { return; }
      activeTrackMenuEntry?.click();
      const soundTracks = [...document.querySelectorAll('div.ytp-menuitem')];
      const targetTracMenuEntry = soundTracks.filter(x => x.textContent === defaultSoundTrackName)?.[0];
      targetTracMenuEntry?.click();
    }
    finally {
      settingsMenu?.click(); // close settings
    }
  }

}
ContentYoutube.instance
