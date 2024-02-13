<script lang="ts" setup>
import { connectHost, DataChannelInterface } from '~/app/network/web-rtc.service';
import QRCode from 'qrcode';
import LightSaber from '~/app/light-saber/LightSaber.vue';
import {Coordinate, usePosition} from "~/app/device/position";
import {Orientation} from "~/app/device/orientation";

type AccelerationMessage = {
  type: 'motion',
  accelerationX: number,
  accelerationY: number,
  accelerationZ: number,
  interval: number,
}

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

const deviceOrientation = ref<Orientation>({
  alpha: 0,
  beta: 0,
  gamma: 0,
});
const initialDeviceOrientation = ref<Orientation>({
  alpha: 0,
  beta: 0,
  gamma: 0,
});

const { acceleration, velocity, position, processPosition, resetPosition } = usePosition();

onMounted(async () => {
  state.connected = false;
  const { connectionId, signaling } = await connectHost();
  state.connectionId = connectionId;

  QRCode.toCanvas(qrCodeRef.value, `https://${window.location.hostname}:3000/client?id=${connectionId}`);

  state.dataChannel = await signaling();

  state.dataChannel.onMessage((message) => {
    if (message === '[[INIT]]') {
      initialDeviceOrientation.value = deviceOrientation.value;
      resetPosition();
    } else if((message as AccelerationMessage).type === 'motion') {
      const accelerationMessage = message as AccelerationMessage;
      processPosition({ x: accelerationMessage.accelerationX, y: accelerationMessage.accelerationY, z: accelerationMessage.accelerationZ }, accelerationMessage.interval)
    } else {
      deviceOrientation.value = message as Orientation;
    }
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
    <label>
      Initial alpha:
      <input type="text" v-model="initialDeviceOrientation.alpha">
    </label>
    <label>
      Initial beta:
      <input type="text" v-model="initialDeviceOrientation.beta">
    </label>
    <label>
      Initial gamma:
      <input type="text" v-model="initialDeviceOrientation.gamma">
    </label>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr)">
      <p>Acc X: {{acceleration.x}}</p>
      <p>Acc Y: {{acceleration.y}}</p>
      <p>Acc Z: {{acceleration.z}}</p>
      <p>Vel X: {{velocity.x}}</p>
      <p>Vel Y: {{velocity.y}}</p>
      <p>Vel Z: {{velocity.z}}</p>
      <p>Pos X: {{position.x}}</p>
      <p>Pos Y: {{position.y}}</p>
      <p>Pos Z: {{position.z}}</p>
    </div>
    <LightSaber :orientation="deviceOrientation" :initial-orientation="initialDeviceOrientation" :position="position"/>
  </div>
</template>
