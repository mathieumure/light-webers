import {
  emitClientIceCandidate,
  onIceCandidate,
  connectClient as connectRTCClient,
  registerClient,
  registerHost,
  stopSignaling,
  onClientOffer,
  emitHostIceCandidate,
} from './signaling.service';

const generateOffer = async (peerConnection: RTCPeerConnection) => {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  console.log('🏠 Local offer generated');
  return offer;
};
type CallbackMessage = (message: unknown) => void;
export type DataChannelInterface = {
  onMessage: (cb: CallbackMessage) => void;
  sendMessage: (message: string | unknown) => void;
};

const createDataChannelInterface = (dataChannel: RTCDataChannel): DataChannelInterface => ({
  onMessage: (cb: CallbackMessage) =>
    dataChannel.addEventListener('message', (event) => {
      cb(JSON.parse(event.data));
    }),
  sendMessage: (message: string | unknown) => dataChannel.send(JSON.stringify(message)),
});

export const connectHost = async () => {
  // Create a webRTC peer Connection
  const peerConnection = new RTCPeerConnection();

  // Define a data channel
  const dataChannel = peerConnection.createDataChannel('message');

  // create host offer
  const offer = await generateOffer(peerConnection);

  const connectionId = await registerHost(offer);

  const signaling = () =>
    new Promise<DataChannelInterface>((resolve) => {
      // Connect for signaling
      onClientOffer((clientOffer: RTCSessionDescriptionInit) => {
        console.log('add client offer');
        peerConnection.setRemoteDescription(clientOffer);
      });

      // Emit local ICE candidates to the client
      peerConnection.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
          emitHostIceCandidate(connectionId, event.candidate);
        }
      });

      // Received client ICE Candidate
      onIceCandidate(async (message: RTCIceCandidateInit) => {
        console.log('add client ice candidate');
        try {
          await peerConnection.addIceCandidate(message);
        } catch (e) {
          console.error('Error adding received ice candidate', e);
        }
      });

      // Connected
      peerConnection.addEventListener('connectionstatechange', () => {
        if (peerConnection.connectionState === 'connected') {
          stopSignaling();
          resolve(createDataChannelInterface(dataChannel));
        }
        if (peerConnection.connectionState === 'disconnected') {
          // TODO proper reconnection for client
        }
      });
    });

  return { connectionId, signaling };
};

export const connectClient = async (connectionId: string): Promise<DataChannelInterface> => {
  // Create a webRTC client based on server description
  const peerConnection = new RTCPeerConnection();

  const remoteDescription = await connectRTCClient(connectionId);

  await peerConnection.setRemoteDescription(remoteDescription);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  await registerClient(connectionId, answer);

  // dataChannel
  const dataChannelPromise = new Promise<DataChannelInterface>((resolve) => {
    peerConnection.addEventListener('datachannel', (event) => {
      resolve(createDataChannelInterface(event.channel));
    });
  });

  // Signaling phase
  const signaling = new Promise<void>((resolve) => {
    // Listen for local ICE candidates on the local RTCPeerConnection
    peerConnection.addEventListener('icecandidate', (event) => {
      if (event.candidate) {
        console.log('🎭 Emitting Ice candidate', event.candidate);
        emitClientIceCandidate(connectionId, event.candidate);
      }
    });
    // Listen for remote ICE candidates and add them to the local RTCPeerConnection
    onIceCandidate(async (message: RTCIceCandidateInit) => {
      try {
        await peerConnection.addIceCandidate(message);
      } catch (e) {
        console.error('Error adding received ice candidate', e);
      }
    });

    peerConnection.addEventListener('connectionstatechange', () => {
      if (peerConnection.connectionState === 'connected') {
        console.log('✅ Connection established');
        stopSignaling();
        resolve();
      }
    });
  });

  const [, dataChannelInterface] = await Promise.all([signaling, dataChannelPromise]);

  return dataChannelInterface;
};
