class ContentEmbedded {
    static get instance() { if (!this._instance) { this._instance = new this(); } return this._instance; }

    constructor() {
        this._videoLists = [];
        this.getVideosYtipr();
        this.ObserveDOM();
    }

    getVideosYtipr() {
        const iframes = document.querySelectorAll('iframe');
        // @ts-ignore
        for (const iframe of iframes) {
            const src = iframe.src;
            const match = src.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
            if (match) {
                const embeddedVideoId = match[1];
                if (this._videoLists.includes(embeddedVideoId)) { continue; }
                this._videoLists.push(embeddedVideoId);
                const onResponse = (response) => {
                    this.setIframeAudioTrack(iframe, embeddedVideoId, response?.defaultSoundTrackName);
                }
                chrome.runtime.sendMessage({ type: "FETCH_VIDEO_PAGE", videoId: embeddedVideoId }, (response) => { onResponse(response) });
            }
        }
    }

    setIframeAudioTrack(iframe, embeddedVideoId, defaultSoundTrackName) {
        console.log(`defaultSoundTrackName for video id:${embeddedVideoId} : "${defaultSoundTrackName}"`);
        // not implemented.
    }

    ObserveDOM() {
        const observer = new MutationObserver(() => this.getVideosYtipr());
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}
//Disabled :  setIframeAudioTrack is not implemented
//ContentEmbedded.instance;
