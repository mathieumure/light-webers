import { createServer } from "https";
import fs from "fs";
import { Server } from 'socket.io'

const httpServer = createServer({
    key: fs.readFileSync('./server/cert/key.pem'),
    cert: fs.readFileSync('./server/cert/cert.pem')
});
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

let host;
let client;
io.on('connection', (socket => {
  console.log('🌐 New connection detected');

  socket.on('host::register', () => {
    console.log('🏠 Host registered')
    host = socket;
  });
  socket.on('host::ice-candidate', (candidate) => {
    console.log('🏠 Host add Ice candidate')
    client?.emit('ice-candidate', candidate)
  })

  socket.on('client::register', (config) => {
    console.log('🎭 Client registered')
    client = socket;
    host.emit('client-connect', config);
  });

  socket.on('client::ice-candidate', (candidate) => {
    console.log('🎭 Client add Ice candidate')
    host?.emit('ice-candidate', candidate)
  })

}));

console.log('Server started at https://localhost:4000')

httpServer.listen(4000, '0.0.0.0')
