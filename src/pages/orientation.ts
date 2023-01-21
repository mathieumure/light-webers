export const detectOrientation = (sendMessage) => {
  window.addEventListener('deviceorientation', (event) => {
    sendMessage(JSON.stringify({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
    }));
  })
}
