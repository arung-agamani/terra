const Buffer = require('buffer').Buffer;
const clientId = require('./clientId');

const Handshake = (infoHash) => {
    const buf = Buffer.alloc(68);
    buf.writeUInt8(19,0);
    buf.write('BitTorrent protocol', 1);
    buf.writeUInt32BE(0, 20);
    buf.writeUInt32BE(0, 24);
    infoHash.copy(buf,28);
    buf.write(clientId.generateId().toString(), 48);
    return buf;
}

const KeepAlive = () => { return Buffer.alloc(4); }

const Choke = () => {
    const buf = Buffer.alloc(5);
    buf.writeUInt32BE(1, 0);
    buf.writeUInt8(0, 4);
    return buf;
}

const Unchoke = () => {
    const buf = Buffer.alloc(5);
    buf.writeUInt32BE(1, 0);
    buf.writeUInt8(1, 4);
    return buf;
}

const Interested = () => {
    const buf = Buffer.alloc(5);
    buf.writeUInt32BE(1, 0);
    buf.writeUInt8(2, 4);
    return buf;
}

const Uninterested = () => {
    const buf = Buffer.alloc(5);
    buf.writeUInt32BE(1, 0);
    buf.writeUInt8(3, 4);
    return buf;
}

const Have = payload => {
    const buf = Buffer.alloc(9);
    buf.writeUInt32BE(5, 0);
    buf.writeUInt8(4, 4);
    buf.writeUInt32BE(payload, 5);
    return buf;
}

const Bitfield = bitfield => {
    const buf = Buffer.alloc(14);
    buf.writeUInt32BE(bitfield.length + 1, 0);
    buf.writeUInt8(5, 4);
    bitfield.copy(buf, 5);
    return buf;
}

const Request = payload => {
    const buf = Buffer.alloc(17);
    buf.writeUInt32BE(13, 0);
    buf.writeUInt8(6,4);
    buf.writeUInt32BE(payload.index, 5);
    buf.writeUInt32BE(payload.begin, 9);
    buf.writeUInt32BE(payload.length, 13);
    return buf;
}

const Piece = payload => {
    const buf = Buffer.alloc(payload.block.length + 13);
    buf.writeUInt32BE(payload.block.length + 9, 0);
    buf.writeUInt8(7, 4);
    buf.writeUInt32BE(payload.index, 5);
    buf.writeUInt32BE(payload.begin, 9);
    payload.block.copy(buf, 13);
    return buf;
}

const Cancel = payload => {
    const buf = Buffer.alloc(17);
    buf.writeUInt32BE(13, 0);
    buf.writeUInt8(8, 4);
    buf.writeUInt32BE(payload.index, 5);
    buf.writeUInt32BE(payload.begin, 9);
    buf.writeUInt32BE(payload.length, 13);
    return buf;
}

const Port = payload => {
    const buf = Buffer.alloc(7);
    buf.writeUInt32BE(3, 0);
    buf.writeUInt8(9, 4);
    buf.writeUInt16BE(payload, 5);
    return buf;
}

module.exports = {
    Handshake, KeepAlive, Choke, Unchoke, Interested, Uninterested, Have, Request, Piece, Cancel, Port, Bitfield
}