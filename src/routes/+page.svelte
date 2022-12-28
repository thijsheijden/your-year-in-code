<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  // The users score
  let score = 0;

  // Whether to load private repos
  let loadPrivateRepos = false;

  // Window dimensions
  let innerWidth: number,
    innerHeight: number = 0;

  let possibleBlockColors: string[] = [
    "rgb(155, 233, 168)",
    "rgb(64, 196, 99)",
    "rgb(48, 161, 78)",
    "rgb(33, 110, 57)",
  ];
  type block = {
    color: string;
    x: number;
    y: number;
  };
  let blocks: block[] = [];
  let horizontalBlockCount: number,
    verticalBlockCount: number = 0;

  onMount(() => {
    // Calculate the block size to use
    // Blocks are 50x50px, at least 8px of spacing, meaning every block is 54x54px
    // if we take into account the neighbour blocks also having 4px of spacing
    horizontalBlockCount = Math.floor(innerWidth / 54);
    verticalBlockCount = Math.floor(innerHeight / 54);

    console.log(horizontalBlockCount);
    console.log(verticalBlockCount);

    // Place a random block on the screen every 500ms
    const newBlockInterval = setInterval(addNewBlock, 500);

    // Clear intervals on page close
    return () => {
      clearInterval(newBlockInterval);
    };
  });

  const addNewBlock = () => {
    let newBlock: block = {
      color:
        possibleBlockColors[
          Math.floor(Math.random() * possibleBlockColors.length)
        ],
      x: Math.floor(Math.random() * horizontalBlockCount) * 54,
      y: Math.floor(Math.random() * verticalBlockCount) * 54,
    };

    blocks = [...blocks, newBlock];
  };

  const removeClickedBlock = (index: number) => {
    blocks.splice(index, 1);
    blocks = blocks;
    score += 1;
  };

  // MARK: OAuth token listener code
  const openOAuthWindow = () => {
    // remove any existing event listeners
    window.removeEventListener("message", receiveMessage);

    // window features
    const strWindowFeatures =
      "toolbar=no, menubar=no, width=600, height=700, top=100, left=100";

    let githubClientID = "961ecc55299958adb91f"
    let url =
      `https://github.com/login/oauth/authorize?client_id=${githubClientID}&scope=repo:status%20read:user`;
    if (loadPrivateRepos) {
      url =
        `https://github.com/login/oauth/authorize?client_id=${githubClientID}&scope=repo%20read:user`;
    }
    window.open(url, "Github Oauth", strWindowFeatures);

    // add the listener for receiving a message from the popup
    window.addEventListener("message", (e) => receiveMessage(e), false);
  };

  const receiveMessage = (e: MessageEvent<string>) => {
    // Do we trust the sender of this message? (might be
    // different from what we originally opened, for example).
    if (!e.isTrusted || e.origin !== "https://www.youryearincode.com") {
      return;
    }

    // Redirect user to the stats page, add the access token as query parameter
    goto("/load?access_token=" + e.data);
  };
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<main>
  <div id="content_flex_container">
    <div id="content">
      <div id="content_padded">
        <h1>YOUR_YEAR_IN_CODE;</h1>
        <h2>Like Spotify wrapped, but for code.</h2>
        <div class="flex">
          <h4>Private repos</h4>
          <input
            bind:checked={loadPrivateRepos}
            type="checkbox"
            name="private_repos"
            id=""
          />
        </div>

        <!-- Private repo disclaimer -->
        {#if loadPrivateRepos}
          <h6>When loading private repo's read/write access is required due to the OAuth scopes Github offers.</h6>
          <h6>For more info check out 'How it works'.</h6>
        {/if}

        <div class="flex">
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <a class="button" id="login_button" on:click={openOAuthWindow}
            >Log in using Github</a
          >
          <a class="button" id="more_info_button" href="/how-it-works"
            >How it works</a
          >
        </div>

        <a href="https://github.com/thijsheijden/your-year-in-code" style="position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%);"
          >view on <svg height="16px" width="16px">
            <image
              xlink:href="/img/github-logo.svg"
              height="16px"
              width="16px"
            />
          </svg></a
        >

        <h5 style="padding: 2rem;">
          {#if score > 0}
            Boxes destroyed: {score}
          {/if}
        </h5>
      </div>
    </div>
  </div>

  <!-- Add blocks -->
  {#each blocks as block, index}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      in:fade
      on:click={() => {
        removeClickedBlock(index);
      }}
      class="block"
      style="background-color: {block.color}; left: {block.x}px; top: {block.y}px;"
    />
  {/each}
</main>

<style>
  main {
    overflow: hidden;
  }

  #content_flex_container {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #content {
    border-radius: 1em;
    background-color: rgb(32, 32, 34);
    border: 1px solid rgba(46, 204, 113, 0.5);
    z-index: 1;
  }

  #content_padded {
    padding: 2em;
    text-align: center;
    position: relative;
  }

  h1 {
    font-size: 4em;
    padding-bottom: 0.5rem;
  }

  h2 {
    font-weight: lighter;
    padding-bottom: 1rem;
  }

  .button {
    display: block;
    padding: 0.5em 1em;
    width: max-content;

    border-radius: 1em;
    border: 1px solid;

    font-weight: bold;
    transition: all 0.25s ease-in-out;
  }

  .button:hover {
    cursor: pointer;
    transform: scale(1.08);
  }

  #login_button {
    border-color: rgba(46, 204, 113, 1);
    color: rgb(46, 204, 113);
    background-color: rgba(46, 204, 113, 0.2);
  }

  #more_info_button {
    text-decoration: none;
    border-color: 1px rgba(247, 136, 100, 0.3) solid;
    color: rgb(247, 136, 100);
    background-color: rgba(217, 63, 11, 0.18);
  }

  /* MARK: Falling blocks */
  .block {
    width: 50px;
    height: 50px;
    transform: translate(50%, -50%);
    border-radius: 4px;

    position: absolute;
    z-index: 0;
    transition: transform 0.2s ease-in-out;
  }

  .block:hover {
    cursor: pointer;
    transform: translate(50%, -50%) scale(1.25);
  }

  .flex {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;

    margin: 1rem 0;
  }

  a {
    text-decoration: none;
    color: var(--commit-color);
  }
</style>
