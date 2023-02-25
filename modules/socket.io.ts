import { Server } from 'socket.io';
import { defineNuxtModule } from '@nuxt/kit';
import onSocketServer from '../server/web-socket';

export default defineNuxtModule({
  async setup(_, nuxt) {
    nuxt.hook('listen', (server: any) => {
      const io = new Server(server);

      nuxt.hook('close', () => io.close());

      onSocketServer(io);
    });
  },
});
