class ContentEmbedded {
    static get instance() { return (this._instance = this._instance || new this()); }

    constructor() {
        this._videoLists = [];
        this.GetVideosYtipr();
        this.ObserveDOM();
    }

    GetVideosYtipr() {
        const iframes = document.querySelectorAll('iframe');
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
        const observer = new MutationObserver(() => this.GetVideosYtipr());
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}
ContentEmbedded.instance;
