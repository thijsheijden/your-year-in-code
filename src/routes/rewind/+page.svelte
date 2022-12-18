<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  let accessToken: string | null;
  onMount(() => {
    // Grab the access token from the query parameters
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    accessToken = params.get("access_token");

    // If no code is present, the user should authenticate first
    if (accessToken == null) {
      goto("/");
    }
  });
</script>

<h1>
  {accessToken}
</h1>
