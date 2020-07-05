const tracker = require('./tracker');
const Torrent = require('./torrentParser').Torrent;
const PeersManager = require('./peersManager').PeersManager;
const TrackerManager = require('./trackerManager').TrackerManager;
const torrent = new Torrent('sintel.torrent');

const trackerManager = new TrackerManager(torrent);
const peerManager = new PeersManager([], torrent);

for (const tracker of trackerManager.trackers) {
    tracker.getPeers(peers => {
        console.log("Got peers!");
        for (const peer of peers) {
            peerManager.addPeer(peer.ip, peer.port, torrent);
        }
        trackerManager.loadedEvent(tracker);
    });
}

