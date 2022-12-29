export const detectOrientation = (sendFunction) => {
  sendFunction('Detect orientation')
  window.addEventListener('deviceorientation', (event) => {
    sendFunction(JSON.stringify({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
    }));
  })
}
