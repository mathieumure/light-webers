<script lang="ts">
    import { serializeOffer } from "../network/serialize.service";
    import {connectHost} from "../network/web-rtc.service";

    let qrCodeURL: string = null;
    let message: string = null;
    $: qrCodeImgSrc = `https://chart.googleapis.com/chart?cht=qr&chl=${encodeURI(qrCodeURL)}&chs=177x177`;

    const { offerPromise, dataChannel } = connectHost();

    offerPromise.then(offer => {
        qrCodeURL = window.location.origin + '/client?q=' + serializeOffer(offer);
    })

    dataChannel.onMessage(message => {
        console.log('✉️', message)
    });

    let sendMessage = (e) => {
        e.preventDefault();
        console.log('🏠 Emitting message to client', message);
        dataChannel.sendMessage(message);
        message = '';
    }
</script>

<h1>Host</h1>

{#if (qrCodeImgSrc)}
<img src="{qrCodeImgSrc}" alt="" width="50%" height="auto">
  <a href="{qrCodeURL}">Link</a>
{/if}

<form on:submit={sendMessage}>
  <input type="text" bind:value={message}>
  <button type="submit">Send</button>
</form>
