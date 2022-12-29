export const serializeOffer = (offer: RTCSessionDescriptionInit): string => {
    return btoa(JSON.stringify(offer));
}

export const deserializeOffer = (serializedOffer: string): RTCSessionDescriptionInit => {
    return JSON.parse(atob(serializedOffer));
}
