class ContentEmbedded {
    static get instance() { if (!this._instance) { this._instance = new this(); } return this._instance; }

    constructor() {

        this.setIframeAudioTrack();
        this.ObserveDOM();
    }

    setIframeAudioTrack() {
        const hl = 'hl=cs';
        const iframes = document.querySelectorAll('iframe');
        // @ts-ignore
        for (const iframe of iframes) {
            if (!iframe.src.includes('www.youtube.com/embed/')) { continue; }
            if (iframe.src.includes(`?${hl}`) || iframe.src.includes(`&${hl}`)) { continue; }
            const sep = (iframe.src.includes('?') ? '&' : '?');
            iframe.src = `${iframe.src}${sep}${hl}`
        }
    }

    ObserveDOM() {
        const observer = new MutationObserver(() => this.setIframeAudioTrack());
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}
ContentEmbedded.instance;
