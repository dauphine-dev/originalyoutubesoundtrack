(function injectYytiprGetters() {
  class YytiprGetter {
    static get instance() { if (!this._instance) { this._instance = new this(); } return this._instance; }

    constructor() {
      this.injectFetchInterceptor();
      this.inejctYtiprReader();
    }

    injectFetchInterceptor() {
      function fetchInterceptor() {
        const originalFetch = window.fetch;
        window.fetch = (...args) => {
          try {
            // @ts-ignore
            const url = (typeof args[0] === "string" ? args[0] : args[0]?.url);
            if (url.includes("/youtubei/v1/player")) {
              return originalFetch(...args).then(async (response) => {
                try {
                  const clone = response.clone();
                  const ytipr = await clone.json();
                  let defaultSoundTrackName = ytipr?.streamingData?.adaptiveFormats?.find(entry => entry?.audioTrack?.id === ytipr?.captions?.playerCaptionsTracklistRenderer?.audioTracks[ytipr.captions.playerCaptionsTracklistRenderer.defaultAudioTrackIndex].audioTrackId)?.audioTrack?.displayName;
                  if (!defaultSoundTrackName) {
                    const adaptiveFormats = ytipr?.streamingData?.adaptiveFormats.filter(f => f.audioTrack?.displayName);
                    adaptiveFormats?.sort((a, b) => b.loudnessDb - a.loudnessDb);
                    defaultSoundTrackName = adaptiveFormats[0]?.audioTrack?.displayName;
                  }
                  if (defaultSoundTrackName) {
                    window.dispatchEvent(new CustomEvent("DefaultSoundTrackNameEvent", { detail: defaultSoundTrackName }));
                  }
                }
                catch { /**/ }
                return response;
              });
            }
          }
          catch { /**/ }
          return originalFetch(...args);
        };
      }
      const script = document.createElement("script");
      script.textContent = `(${fetchInterceptor.toString()})();`;
      document.documentElement.appendChild(script);
      script.remove();
    }

    inejctYtiprReader() {
      function ytiprReader() {
        let tries = 0;
        const sendDefaultSoundTrackName = () => {
          try {
            const ytipr = { ytipr: window?.ytInitialPlayerResponse }?.ytipr;
            let defaultSoundTrackName = ytipr?.streamingData?.adaptiveFormats?.find(entry => entry?.audioTrack?.id === ytipr?.captions?.playerCaptionsTracklistRenderer?.audioTracks[ytipr.captions.playerCaptionsTracklistRenderer.defaultAudioTrackIndex].audioTrackId)?.audioTrack?.displayName;
            if (!defaultSoundTrackName) {
              if (tries > 10) { return; } //tries for 100ms, then abort.
              setTimeout(() => { sendDefaultSoundTrackName(); }, 10);
              tries++;
            }

            if (defaultSoundTrackName) {
              window.dispatchEvent(new CustomEvent("DefaultSoundTrackNameEvent", { detail: defaultSoundTrackName }));
            }
          }
          catch { /**/ }
        }
        sendDefaultSoundTrackName();
      };
      const script = document.createElement("script");
      script.textContent = `(${ytiprReader.toString()})();`;
      document.documentElement.appendChild(script);
      script.remove();
    }
  }
  YytiprGetter.instance;
})();
