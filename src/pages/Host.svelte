<script lang="ts">
    import { serializeOffer } from "../network/serialize.service";
    import {connectHost} from "../network/web-rtc.service";

    let connected: boolean = false;
    let qrCodeURL: string = null;
    let alpha: number = null;
    let beta: number = null;
    let gamma: number = null;
    $: qrCodeImgSrc = `https://chart.googleapis.com/chart?cht=qr&chl=${encodeURI(qrCodeURL)}&chs=177x177`;

    const { offerPromise, signalingPromise, dataChannel } = connectHost();

    offerPromise.then(offer => {
        qrCodeURL = window.location.origin + '/client?q=' + serializeOffer(offer);
    })

    signalingPromise.then(() => {
        connected = true;
    })

    dataChannel.onMessage(message => {
        const data = JSON.parse(message);
        alpha = data.alpha;
        beta = data.beta;
        gamma = data.gamma;
    });
</script>

<h1>Host</h1>

{#if (qrCodeImgSrc && !connected)}
<img src="{qrCodeImgSrc}" alt="" width="50%" height="auto">
  <a href="{qrCodeURL}">Link</a>
{/if}

<p>alpha (rotation de face): {alpha}</p>
<p>beta (avant/arrière): {beta}</p>
<p>gamma (gauche/droite): {gamma}</p>
