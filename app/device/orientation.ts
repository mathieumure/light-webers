export type Orientation = {
  alpha: number;
  beta: number;
  gamma: number;
};

export const detectOrientation = (onOrientation: (orientation: Orientation) => void) => {
  window.addEventListener('deviceorientation', (event) => {
    onOrientation({
      alpha: event.alpha || 0,
      beta: event.beta || 0,
      gamma: event.gamma || 0,
    });
  });
};
