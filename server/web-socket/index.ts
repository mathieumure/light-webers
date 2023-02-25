import crypto from 'node:crypto';
import { Server, Socket } from 'socket.io';

type Session = {
  id: string;
  host: Socket;
  client?: Socket;
  hostOffer: RTCSessionDescriptionInit;
};

const inMemoryData = new Map<string, Session>();

export default (io: Server) => {
  io.on('connection', (socket) => {
    socket.on('host::register', (offer) => {
      const uuid = crypto.randomUUID();
      inMemoryData.set(uuid, { id: uuid, host: socket, hostOffer: offer });
      console.log('🏠 Host registered');
      socket.emit('host::id', uuid);
    });

    socket.on('client::connection', (id) => {
      console.log('🎭 Client connected');
      const connection = inMemoryData.get(id);

      if (connection) {
        connection.client = socket;
        socket.emit('client::host-offer', connection.hostOffer);
      }
    });

    socket.on('client::register', ({ id, offer }) => {
      console.log('🎭 Client registered');
      const connection = inMemoryData.get(id);

      if (connection) {
        connection.host.emit('host::client-offer', offer);
      }
    });

    socket.on('host::ice-candidate', ({ id, candidate }) => {
      console.log('🏠 Host add Ice candidate');

      const connection = inMemoryData.get(id);

      connection?.client?.emit('ice-candidate', candidate);
    });

    socket.on('client::ice-candidate', ({ id, candidate }) => {
      console.log('🎭 Client add Ice candidate');
      const connection = inMemoryData.get(id);
      connection?.host?.emit('ice-candidate', candidate);
    });
  });
};
