<script lang="ts" setup>
import { connectClient, DataChannelInterface } from '~/app/network/web-rtc.service';

const route = useRoute();
type State = {
  connected: boolean;
  start: boolean;
  dataChannel: DataChannelInterface | null;
};
const state = reactive<State>({
  connected: false,
  dataChannel: null,
  start: false,
});

const sendOrientation = (event: DeviceOrientationEvent) => {
  if (state.start) {
    state.dataChannel?.sendMessage({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
    });
  }
};

const sendMotion = (event: DeviceMotionEvent) => {
  if (state.start) {
    state.dataChannel?.sendMessage({
      type: 'motion',
      accelerationX: event.acceleration?.x,
      accelerationY: event.acceleration?.y,
      accelerationZ: event.acceleration?.z,
      interval: event.interval,
    });
  }
}

onMounted(async () => {
  state.connected = false;
  state.dataChannel = await connectClient(route.query.id as string);

  state.connected = true;

  window.addEventListener('deviceorientation', sendOrientation);
  window.addEventListener('devicemotion', sendMotion);
});

onUnmounted(() => {
  window.removeEventListener('deviceorientation', sendOrientation);
});

const buttonLabel = computed(() => {
  return state.start ? 'STOP' : 'START';
})

const toggleStart = () => {
  state.start = !state.start
};

const resetPosition = () => {
  state.dataChannel?.sendMessage('[[INIT]]');
}
</script>

<template>
  <div>
    <p>{{ route.query }}</p>
    <p v-if="state.connected">Connected</p>
    <p v-else>Not connected for now</p>

    <div v-if="state.connected">
      <button @click="toggleStart">
        {{ buttonLabel }}
      </button>
      <button @click="resetPosition">
        RESET
      </button>
    </div>
  </div>
</template>
