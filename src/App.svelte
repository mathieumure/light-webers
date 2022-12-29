<script lang="ts">
    import Host from "./pages/Host.svelte";
    import Client from "./pages/Client.svelte";
</script>

{#if window.location.pathname === '/client'}
  <Client />
{:else}
  <Host />
{/if}
