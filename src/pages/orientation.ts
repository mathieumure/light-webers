export const detectOrientation = (sendFunction) => {
  window.addEventListener('deviceorientation', (event) => {
    sendFunction(JSON.stringify(event));
  })
}
