(function injectYtiprReader() {
    function ytiprReader() {
        let tries = 0;
        const sendDefaultSoundTrackName = () => {
            try {
                const ytipr = { ytipr: window?.ytInitialPlayerResponse }?.ytipr;
                const defaultSoundTrackName = ytipr?.streamingData?.adaptiveFormats?.find(entry => entry?.audioTrack?.id === ytipr?.captions?.playerCaptionsTracklistRenderer?.audioTracks[ytipr.captions.playerCaptionsTracklistRenderer.defaultAudioTrackIndex].audioTrackId)?.audioTrack?.displayName;
                if (!defaultSoundTrackName) {
                    if (tries > 20) { return; } //tries for 2 seconds, then abort.
                    setTimeout(() => { sendDefaultSoundTrackName(); }, 100);
                    tries++;
                }
                if (defaultSoundTrackName) {
                    window.dispatchEvent(new CustomEvent("DefaultSoundTrackNameEvent", { detail: defaultSoundTrackName }));
                }
            }
            catch { }
        }
        sendDefaultSoundTrackName();
    };
    const script = document.createElement("script");
    script.textContent = `(${ytiprReader.toString()})();`;
    document.documentElement.appendChild(script);
    script.remove();
})();