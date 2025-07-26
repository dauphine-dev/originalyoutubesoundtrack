(function injectFetchHook() {

  function fetchInterceptor() {
    const originalFetch = window.fetch;

    window.fetch = (...args) => {
      try {
        const url = (typeof args[0] === "string" ? args[0] : args[0]?.url);
        if (url.includes("/youtubei/v1/player")) {
          return originalFetch(...args).then(async (response) => {
            try {
              const clone = response.clone();
              const ytipr = await clone.json();
              const defaultSoundTrackName = ytipr?.streamingData?.adaptiveFormats?.find(entry => entry?.audioTrack?.id === ytipr?.captions?.playerCaptionsTracklistRenderer?.audioTracks[ytipr.captions.playerCaptionsTracklistRenderer.defaultAudioTrackIndex].audioTrackId)?.audioTrack?.displayName;
              if (defaultSoundTrackName) {
                window.dispatchEvent(new CustomEvent("DefaultSoundTrackNameEvent", { detail: defaultSoundTrackName }));
              }
            }
            catch { }
            return response;
          });
        }
      }
      catch { }
      return originalFetch(...args);
    };
  }
  const script = document.createElement("script");
  script.textContent = `(${fetchInterceptor.toString()})();`;
  document.documentElement.appendChild(script);
  script.remove();
})();
