<script>
  import { onMount } from "svelte";
  import exchangeGithubOAuthTokenForAccessToken from "$lib/github/exchange_github_oauth_token_for_access_token";

  let codePresent = true;

  // When this page is mounted, grab the token from the query parameters and exchange this
  // token for a Github access token. Then send the access token to the page that opened this window
  onMount(() => {
    // Get the Oauth code from the URL query params
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    const code = params.get("code");

    if (code == null) {
      codePresent = false;
    }

    const getAccessToken = async () => {
      const accessToken = await exchangeGithubOAuthTokenForAccessToken(code ?? "");

      console.log(accessToken);
      if (window.opener) {
        // Send the params to the parent window
        window.opener.postMessage(accessToken, "*");
        
        // Close this window
        window.close();
      }
    };
    
    getAccessToken();
  });
</script>

<div>
  <h1>
    {#if codePresent}
      Loading...
    {:else}
      Something went wrong. No OAuth token present.
    {/if}
  </h1>
</div>
