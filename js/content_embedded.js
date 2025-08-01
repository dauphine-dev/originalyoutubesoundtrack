class ContentEmbedded {
    static get instance() { if (!this._instance) { this._instance = new this(); } return this._instance; }

    constructor() {

        this.setIframeAudioTrack();
        this.ObserveDOM();
    }

    setIframeAudioTrack() {
        const targetLang = 'cs';
        document.querySelectorAll('iframe')
            .forEach(iframe => {
                const src = iframe.src;
                if (!src.includes('www.youtube.com/embed/')) return;
                const url = new URL(src);
                if (url.searchParams.get('hl') === targetLang) return;
                url.searchParams.set('hl', targetLang);
                iframe.src = url.toString();
            });
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
