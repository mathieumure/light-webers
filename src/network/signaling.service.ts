import { io } from 'socket.io-client';

export const socket = io(`wss://${window.location.hostname}:4000`, { rejectUnauthorized: false });

export const registerHost = () => socket.emit('host::register');
export const registerClient = (answer) => socket.emit('client::register', answer);

export const emitHostIceCandidate = (candidate) => socket.emit('host::ice-candidate', candidate);
export const emitClientIceCandidate = (candidate) => socket.emit('client::ice-candidate', candidate);

export const onClientConnection = (cb) => socket.on('client-connect', cb);
export const onIceCandidate = (cb) => socket.on('ice-candidate', cb);

export const stopSignaling = () => socket.close();
