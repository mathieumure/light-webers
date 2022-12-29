import {
    emitClientIceCandidate,
    emitHostIceCandidate,
    onClientConnection,
    onIceCandidate, registerClient,
    registerHost,
    stopSignaling
} from "./signaling.service";

const generateOffer =  async (peerConnection) => {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log('🏠 Local offer generated');
    return offer
}

const createDataChannelInterface = (dataChannel) => {
    const onMessage = (cb) => dataChannel.addEventListener('message', event => {
        cb(event.data);
    });
    const sendMessage = (message) => dataChannel.send(message);
    return {
        onMessage, sendMessage
    }
}

export const connectHost = () => {
    // Create a webRTC peer Connection
    const peerConnection = new RTCPeerConnection();

    // Define a data channel
    const dataChannel = peerConnection.createDataChannel('message');

    // create host offer
    const offerPromise = generateOffer(peerConnection);

    // Connect for signaling
    const signalingPromise = new Promise<void>((resolve) => {
        registerHost();

        onClientConnection((config) => {
            console.log('🎭 Client connected', config);
            peerConnection.setRemoteDescription(config);
            console.log(peerConnection);
        });

        // Emit local ICE candidates to the client
        peerConnection.addEventListener('icecandidate', event => {
            if (event.candidate) {
                console.log('🏠 Emitting Ice candidate', event.candidate);
                emitHostIceCandidate(event.candidate);
            }
        });

        // Received client ICE Candidate
        onIceCandidate(async message => {
            try {
                console.log('🎭 Receiving ICE from client');
                await peerConnection.addIceCandidate(message);
            } catch (e) {
                console.error('Error adding received ice candidate', e);
            }
        });

        // Connected
        peerConnection.addEventListener('connectionstatechange', event => {
            if (peerConnection.connectionState === 'connected') {
                console.log('✅ Connection established')
                stopSignaling();
                resolve();
            }
        });
    });

    return {
        connection: peerConnection,
        dataChannel: createDataChannelInterface(dataChannel),
        signalingPromise,
        offerPromise,
    }
}

export const connectClient = async (remoteDescription) => {
    // Create a webRTC client based on server description
    const peerConnection = new RTCPeerConnection();
    await peerConnection.setRemoteDescription(remoteDescription);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    console.log(peerConnection)

    // dataChannel
    const dataChannelPromise = new Promise((resolve) => {
        peerConnection.addEventListener('datachannel', event => {
            resolve(createDataChannelInterface(event.channel));
        });
    });

    // Signaling phase
    const signalingPromise = new Promise<void>((resolve) => {
        registerClient(answer);
        // Listen for local ICE candidates on the local RTCPeerConnection
        peerConnection.addEventListener('icecandidate', event => {
            if (event.candidate) {
                console.log('🎭 Emitting Ice candidate', event.candidate);
                emitClientIceCandidate(event.candidate);
            }
        });
        // Listen for remote ICE candidates and add them to the local RTCPeerConnection
        onIceCandidate(async message => {
            try {
                await peerConnection.addIceCandidate(message);
            } catch (e) {
                console.error('Error adding received ice candidate', e);
            }
        });

        peerConnection.addEventListener('connectionstatechange', event => {
            if (peerConnection.connectionState === 'connected') {
                console.log('✅ Connection established')
                stopSignaling();
                resolve();
            }
        });
    })

    const [,dataChannelInterface] = await Promise.all([signalingPromise, dataChannelPromise])

    return dataChannelInterface;
}
