import { io } from 'socket.io-client';

export const socket = process.server
  ? io()
  : io(`wss://${window.location.hostname}:3000`, { rejectUnauthorized: false });

export const registerHost = (offer: RTCSessionDescriptionInit): Promise<string> =>
  new Promise((resolve) => {
    socket.emit('host::register', offer);
    socket.on('host::id', resolve);
  });
export const connectClient = (id: string): Promise<RTCSessionDescriptionInit> =>
  new Promise((resolve) => {
    socket.emit('client::connection', id);
    socket.on('client::host-offer', resolve);
  });
export const registerClient = (id: string, offer: RTCSessionDescriptionInit) =>
  socket.emit('client::register', { id, offer });

export const emitHostIceCandidate = (id: string, candidate: RTCIceCandidateInit) =>
  socket.emit('host::ice-candidate', { id, candidate });
export const emitClientIceCandidate = (id: string, candidate: RTCIceCandidateInit) =>
  socket.emit('client::ice-candidate', { id, candidate });

export const onClientOffer = (cb: (config: RTCSessionDescriptionInit) => void) => socket.on('host::client-offer', cb);
export const onIceCandidate = (cb: (message: RTCIceCandidateInit) => Promise<void>) => socket.on('ice-candidate', cb);

export const stopSignaling = () => socket.close();
