const Tracker = require('./tracker').Tracker;

class TrackerManager {
    constructor(torrent) {
        this.trackers = [];
        this.torrent = torrent;
        this.isTrackerLoaded = false;
        this.loadedTrackerCount = 0;
        this._init();
    }

    _init() {
        for (const link of this.torrent.announceListArray) {
            if (link.toString().startsWith('udp'))
                this.trackers.push(new Tracker(this.torrent, link.toString()));
            if (link.toString().startsWith('http'))
                console.log(link.toString());
        }
    }

    loadedEvent(tracker) {
        console.log("Tracker at url ", tracker.url, "has loaded");
        this.loadedTrackerCount++;
        if (this.loadedTrackerCount == this.trackers.length){
            console.log("All trackers are loaded!");
            this.isTrackerLoaded = true;
        }
    }
}

module.exports = {
    TrackerManager
}