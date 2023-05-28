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
const initialDeviceOrientation = ref<Orientation>({
  alpha: 0,
  beta: 0,
  gamma: 0,
});
type Coordinate = {
  x: number;
  y: number;
  z: number;
}
type AccelerationMessage = {
  type: 'motion',
  accelerationX: number,
  accelerationY: number,
  accelerationZ: number,
  interval: number,
}
const filteredAcceleration = ref<Coordinate>({ x: 0, y: 0, z: 0 });
const position = ref<Coordinate>({ x: 0, y: 0, z: 0 });
const velocity = ref<Coordinate>({ x: 0, y: 0, z: 0 });

const processPosition = (message: AccelerationMessage) => {
  const timeStep = message.interval / 1000;
  const filterStrength = 0.8;

  filteredAcceleration.value = {
    x: (message.accelerationX * filterStrength) + (filteredAcceleration.value.x * (1 - filterStrength)),
    y: (message.accelerationY * filterStrength) + (filteredAcceleration.value.y * (1 - filterStrength)),
    z: (message.accelerationZ * filterStrength) + (filteredAcceleration.value.z * (1 - filterStrength)),
  }

  velocity.value = {
    x: velocity.value.x + filteredAcceleration.value.x * timeStep,
    y: velocity.value.y + filteredAcceleration.value.y * timeStep,
    z: velocity.value.z + filteredAcceleration.value.z * timeStep,
  }

  position.value = {
    x: position.value.x + velocity.value.x * timeStep,
    y: position.value.y + velocity.value.y * timeStep,
    z: position.value.z + velocity.value.z * timeStep,
  }
  console.log(position.value);
}

const resetPosition = () => {
  position.value = { x: 0, y: 0, z: 0 }
}

onMounted(async () => {
  state.connected = false;
  const { connectionId, signaling } = await connectHost();
  state.connectionId = connectionId;

  QRCode.toCanvas(qrCodeRef.value, `https://${window.location.hostname}:3000/client?id=${connectionId}`);

  state.dataChannel = await signaling();

  state.dataChannel.onMessage((message) => {
    if (message === '[[INIT]]') {
      console.log('deviceOrientation.value', deviceOrientation.value)
      initialDeviceOrientation.value = deviceOrientation.value;
    } else if (message === '[[RESET_POSITION]]') {
      resetPosition()
    } else if((message as AccelerationMessage).type === 'motion') {
      processPosition(message as AccelerationMessage)
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
    <LightSaber :orientation="deviceOrientation" :initial-orientation="initialDeviceOrientation" :position="position"/>
  </div>
</template>
