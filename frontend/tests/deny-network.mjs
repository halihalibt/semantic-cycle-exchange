// Test process only: deny actual outbound sockets, including non-fetch fallbacks.
import net from 'node:net';
net.Socket.prototype.connect = function () { throw new Error('B2A_OFFLINE_NETWORK_BLOCKED'); };
globalThis.fetch = async function () { throw new Error('B2A_UNMOCKED_FETCH_BLOCKED'); };
