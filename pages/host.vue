<script lang="ts" setup>
import { connectHost, DataChannelInterface } from '~/app/network/web-rtc.service';
import QRCode from 'qrcode';
import LightSaber from '~/app/light-saber/LightSaber.vue';

type State = {
  connectionId: string;
  connected: boolean;
  dataChannel: DataChannelInterface | null;
};
const state = reactive<State>({
  connectionId: '',
  connected: false,
  dataChannel: null,
});
const qrCodeRef = ref<HTMLCanvasElement | null>(null);

type Orientation = {
  alpha: number;
  beta: number;
  gamma: number;
};
const deviceOrientation = ref<Orientation>({
  alpha: 0,
  beta: 0,
  gamma: 0,
});

onMounted(async () => {
  state.connected = false;
  const { connectionId, signaling } = await connectHost();
  state.connectionId = connectionId;

  QRCode.toCanvas(qrCodeRef.value, `https://${window.location.hostname}:3000/client?id=${connectionId}`);

  state.dataChannel = await signaling();

  state.dataChannel.onMessage((message) => {
    deviceOrientation.value = message as Orientation;
  });

  state.connected = true;
});
</script>

<template>
  <div>
    <h1>Host is now here</h1>
    <a :href="`/client?id=${state.connectionId}`" target="_blank">{{ state.connectionId }}</a>

    <canvas ref="qrCodeRef" />

    <p v-if="state.connected">Connected</p>
    <p v-else>Waiting for client to be connected</p>
    <LightSaber v-bind="deviceOrientation" />
    <div v-if="state.connected" />
  </div>
</template>
