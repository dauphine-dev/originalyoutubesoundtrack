class content {
    static get instance() {
        return (this._instance = this._instance || new this());
    }

    constructor() {
        this._oldHref = document.location.href;
        window.addEventListener("defaultSoundTrackNameEvent", (event) => { this.receive_defaultSoundTrackName(event); });
        this.handlePageReady()
    }

    async waitForElement(selector, timeout = 10000) {
        const start = performance.now();
        return new Promise((resolve, reject) => {
            const check = () => {
                const el = document.querySelector(selector);
                if (el) return resolve(el);
                if (performance.now() - start > timeout) return reject("Timeout");
                requestAnimationFrame(check);
            };
            check();
        });
    }

    async handlePageReady() {
        await this.waitForElement(".ytp-settings-button");
        setTimeout(() => { this.inject_send_defaultSoundTrackName(); }, 10)
    }

    receive_defaultSoundTrackName(event) {
        this.setAudioTrack(event.detail);
    }


    inject_send_defaultSoundTrackName() {

        const func = () => {
            const ytipr = { ytipr: window.ytInitialPlayerResponse }.ytipr;
            const defaultSoundTrackName = (ytipr.streamingData.adaptiveFormats.find(entry => entry.audioTrack?.id === ytipr.captions.playerCaptionsTracklistRenderer.audioTracks[ytipr.captions.playerCaptionsTracklistRenderer.defaultAudioTrackIndex].audioTrackId)?.audioTrack?.displayName) || "";
            window.dispatchEvent(new CustomEvent("defaultSoundTrackNameEvent", { detail: defaultSoundTrackName }));
        };
        const script = document.createElement("script");
        script.textContent = `(${func})();`;
        (document.head || document.documentElement).appendChild(script);
        script.remove();
    }

    setAudioTrack(defaultSoundTrackName) {
        if (!document.querySelector("video")) return;
        const menu = document.querySelector('.ytp-button.ytp-settings-button');
        if (menu) { menu.click(); } // open menu
        try {
            document.querySelector('div.ytp-menuitem.ytp-audio-menu-item[role="menuitem"]')?.querySelector(".ytp-menuitem-content")?.click();
            const soundTracks = [...document.querySelectorAll('div.ytp-menuitem')];
            soundTracks.filter(x => x.textContent.includes(`${defaultSoundTrackName}`))[0]?.click();
        }
        catch { }
        if (menu) { menu.click(); } // close menu
    }
}
// run immediately instead of at document_idle and wait for ytp-settings-button, it allow to manange dynamic url changes
content.instance;
