export type Coordinate = {
    x: number;
    y: number;
    z: number;
}

const FRICTION_COEF = 3;

const lowPassFilter = (newValue: number, oldValue: number, alpha = 0.2) => {
    return oldValue + alpha * (newValue - oldValue);
}

export const usePosition = () => {
    const acceleration = ref<Coordinate>({ x: 0, y: 0, z: 0 });
    const position = ref<Coordinate>({ x: 0, y: 0, z: 0 });
    const velocity = ref<Coordinate>({ x: 0, y: 0, z: 0 });

    const processPosition = (accelerationMesure: Coordinate, intervalInMs: number) => {
        const timeStep = intervalInMs / 1000;

        acceleration.value.x = lowPassFilter(accelerationMesure.x, acceleration.value.x)
        acceleration.value.y = lowPassFilter(accelerationMesure.y, acceleration.value.y)
        acceleration.value.z = lowPassFilter(accelerationMesure.z, acceleration.value.z)

        velocity.value.x += acceleration.value.x * timeStep;
        velocity.value.y += acceleration.value.y * timeStep;
        velocity.value.z += acceleration.value.z * timeStep;

        // FRICTION
        // velocity.value.x -= velocity.value.x * FRICTION_COEF * timeStep;
        // velocity.value.y -= velocity.value.y * FRICTION_COEF * timeStep;
        // velocity.value.z -= velocity.value.z * FRICTION_COEF * timeStep;

        position.value.x += velocity.value.x * timeStep
        position.value.y += velocity.value.y * timeStep
        position.value.z += velocity.value.z * timeStep
    }

    const resetPosition = () => {
        position.value = { x: 0, y: 0, z: 0 }
    }

    return {
        acceleration, velocity, position, resetPosition, processPosition
    }
}
