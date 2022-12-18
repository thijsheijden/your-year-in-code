<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  // The users score
  let score = 0;

  // Window dimensions
  let innerWidth: number, innerHeight: number = 0;

  let possibleBlockColors: string[] = ['rgb(155, 233, 168)', 'rgb(64, 196, 99)', 'rgb(48, 161, 78)', 'rgb(33, 110, 57)'];
  type block = {
    color: string,
    x: number,
    y: number,
  }
  let blocks: block[] = [];
  let horizontalBlockCount: number, verticalBlockCount: number = 0;

  onMount(() => {
    // Calculate the block size to use
    // Blocks are 50x50px, at least 8px of spacing, meaning every block is 54x54px
    // if we take into account the neighbour blocks also having 4px of spacing
    horizontalBlockCount = Math.floor(innerWidth / 54);
    verticalBlockCount = Math.floor(innerHeight / 54);

    console.log(horizontalBlockCount)
    console.log(verticalBlockCount)

    // Place a random block on the screen every 500ms
    const newBlockInterval = setInterval(addNewBlock, 500);

    // Clear intervals on page close
    return () => {
			clearInterval(newBlockInterval);
		};
  })

  const addNewBlock = () => {
    let newBlock: block = {
      color: possibleBlockColors[Math.floor(Math.random() * possibleBlockColors.length)],
      x: Math.floor(Math.random() * horizontalBlockCount) * 54,
      y: Math.floor(Math.random() * verticalBlockCount) * 54
    }

    blocks = [...blocks, newBlock]
  }

  const removeClickedBlock = (index: number) => {
    blocks.splice(index, 1);
    blocks = blocks;
    score += 1;
  }

  // MARK: OAuth token listener code
  const openOAuthWindow = () => {
    // remove any existing event listeners
    window.removeEventListener("message", receiveMessage);

    // window features
    const strWindowFeatures =
      "toolbar=no, menubar=no, width=600, height=700, top=100, left=100";

    window.open(
      "https://github.com/login/oauth/authorize?client_id=961ecc55299958adb91f&scope=repo%20read:user",
      "Github Oauth",
      strWindowFeatures
    );

    // add the listener for receiving a message from the popup
    window.addEventListener("message", (e) => receiveMessage(e), false);
  };

  const receiveMessage = (e: MessageEvent<string>) => {
    // Do we trust the sender of this message? (might be
    // different from what we originally opened, for example).
    if (!e.isTrusted || e.origin !== "http://dev.youryearincode.com:5173") {
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
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <a id="login_button" on:click={openOAuthWindow}>Log in using Github</a>

        <h5 style="padding-top: 2em;">
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
    <div in:fade on:click={() => {removeClickedBlock(index)}} class="block" style="background-color: {block.color}; left: {block.x}px; top: {block.y}px;"></div>
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
  }

  h1 {
    font-size: 4em;
    padding-bottom: 0.5em;
  }

  h2 {
    font-weight: lighter;
    padding-bottom: 2em;
  }

  #login_button {
    display: block;
    padding: 0.5em 1em;
    width: max-content;
    margin: 0 auto;
    
    border-radius: 1em;
    border: 1px solid rgba(46, 204, 113, 1);
    color: rgb(46, 204, 113);
    background-color: rgba(46, 204, 113, 0.2);

    font-weight: bold;
    transition: all 0.25s ease-in-out;
  }

  #login_button:hover {
    cursor: pointer;
    transform: scale(1.08);
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
</style>
