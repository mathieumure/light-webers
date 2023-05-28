<script lang="ts" setup>
import { connectClient, DataChannelInterface } from '~/app/network/web-rtc.service';

const route = useRoute();
type State = {
  connected: boolean;
  orientationDetected: 'stop' | 'start' | 'setup';
  dataChannel: DataChannelInterface | null;
};
const state = reactive<State>({
  connected: false,
  dataChannel: null,
  orientationDetected: 'stop',
});

const sendOrientation = (event: DeviceOrientationEvent) => {
  if (state.orientationDetected !== 'stop') {
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

const buttonLabel = computed(() => {
  switch (state.orientationDetected) {
    case 'stop': return 'setup'
    case 'setup': return 'start'
    case 'start': return 'stop'
  }
})

const changeOrientationDetection = () => {
  switch (state.orientationDetected) {
    case 'stop': {
      state.orientationDetected = 'setup';

      break;
    }
    case 'setup': {
      state.orientationDetected = 'start';
      state.dataChannel?.sendMessage('[[INIT]]')
      break;
    }
    case 'start': {
      state.orientationDetected = 'stop';
      break;
    }
  }
};
</script>

<template>
  <div>
    <p>{{ route.query }}</p>
    <p v-if="state.connected">Connected</p>
    <p v-else>Not connected for now</p>

    <div v-if="state.connected">
      <button @click="changeOrientationDetection">
        {{ buttonLabel }}
      </button>
    </div>
  </div>
</template>
