<script lang="ts">
    import {deserializeOffer} from "../network/serialize.service";
    import {detectOrientation} from "./orientation";
    import {connectClient} from "../network/web-rtc.service";

    let connected: boolean = false;
    let inputMessage: string = null;
    let messages: string[] = [];
    let dataChannel = null;

    const remoteDescriptionEncoded = new URL(window.location.href).searchParams.get('q');
    const remoteDescription = deserializeOffer(remoteDescriptionEncoded);

    connectClient(remoteDescription).then(it => {
        connected = true;
        dataChannel = it;
        dataChannel.onMessage((message) => {
            console.log('meesage', message)
            messages = [...messages, message]
        })
    });

    let sendMessage = (e) => {
        e.preventDefault();
        console.log('🏠 Emitting message to client', inputMessage);
        dataChannel.sendMessage(inputMessage);
        inputMessage = '';
    }
</script>

<h1>Client</h1>
<p>Connected : {connected}</p>

{#each messages as message}
  <p>{message}</p>
{/each}

<form on:submit={sendMessage}>
  <input type="text" bind:value={inputMessage}>
  <button type="submit">Send</button>
</form>
