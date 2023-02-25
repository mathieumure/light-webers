<script lang="ts" setup>
import { connectClient, DataChannelInterface } from '~/app/network/web-rtc.service';

const route = useRoute();
type State = {
  connected: boolean;
  orientationDetected: boolean;
  dataChannel: DataChannelInterface | null;
};
const state = reactive<State>({
  connected: false,
  dataChannel: null,
  orientationDetected: false,
});

const sendOrientation = (event: DeviceOrientationEvent) => {
  if (state.orientationDetected) {
    state.dataChannel?.sendMessage({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
    });
  }
};

onMounted(async () => {
  state.connected = false;
  state.dataChannel = await connectClient(route.query.id as string);

  state.connected = true;

  window.addEventListener('deviceorientation', sendOrientation);
});

onUnmounted(() => {
  window.removeEventListener('deviceorientation', sendOrientation);
});

const changeOrientationDetection = () => {
  state.orientationDetected = !state.orientationDetected;
};
</script>

<template>
  <div>
    <p>{{ route.query }}</p>
    <p v-if="state.connected">Connected</p>
    <p v-else>Not connected for now</p>

    <div v-if="state.connected">
      <button @click="changeOrientationDetection">
        {{ state.orientationDetected ? 'Stop' : 'Start' }}
      </button>
    </div>
  </div>
</template>
