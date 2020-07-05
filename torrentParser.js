const fs = require('fs');
const bencode = require('bencode');
const crypto = require('crypto');
const Buffer = require('buffer').Buffer;
const clientId = require('./clientId');
module.exports.open = (filepath) => {
    return bencode.decode(fs.readFileSync(filepath));
}

module.exports.infoHash = (torrent) => {
    const info = bencode.encode(torrent.info);
    return crypto.createHash('sha1').update(info).digest();
}

const size = (torrent) => {
    const size = torrent.info.files ?
                    torrent.info.files.map(file => file.length).reduce((a, b) => a + b) :
                    torrent.info.length;
    const buf = Buffer.alloc(8);
    buf.writeBigInt64BE(BigInt(size), 0);
    return buf;
};

module.exports.size = size;

class Torrent {
    constructor(path) {
        this.decodedFile = bencode.decode(fs.readFileSync(path));
        this.infoHash = crypto.createHash('sha1').update(bencode.encode(this.decodedFile.info)).digest();
        this.size = size(this.decodedFile);
        this.peerId = clientId.generateId();
        console.log("Info Hash :", this.infoHash);
    }

    get announce() { return this.decodedFile.announce; }
    get announceList() { return this.decodedFile['announce-list'];}
    get announceListArray() {
        const res = [];
        for (const announce of this.decodedFile['announce-list']) {
            res.push(announce.toString());
        }
        return res;
    }
    get comment() { return this.decodedFile.comment.toString(); }
    get createdBy() { return this.decodedFile['created by'].toString(); }
    get encoding() { return this.decodedFile.encoding.toString(); }
    get infoObject() { return this.decodedFile.info; }
    get urlList() { return this.decodedFile['url-list'].toString(); }

    isSingleFile() {
        if (this.decodedFile.info.files === undefined) {
            return true;
        }
        return false;
    }

    get fileInfo() {
        if (!this.isSingleFile()) {
            const info = this.infoObject;
            const files = [];
            for (const file of info.files) {
                files.push({
                    length : file.length,
                    path : file.path.toString()
                });
            }
            return {
                name : info.name.toString(), 
                "piece-length" : info['piece length'],
                pieces :  info.pieces,
                files : files
            }
        } else {
            return "singular file"
        }
    }

    printAnnounceList() {
        for (const announce of this.decodedFile['announce-list']) {
            console.log(announce.toString());
        }
    }
}

module.exports.Torrent = Torrent;