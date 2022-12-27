<script lang="ts">
  import { goto } from "$app/navigation";

  const moveToNextPage = (e: KeyboardEvent) => {
    if (e.key == "ArrowLeft") {
      goto("/rewind/prs");
    }
  };
</script>

<svelte:window on:keydown={moveToNextPage} />
<main>
  <div id="card">
    <div id="card_content">
      <div id="card_content_heading">
        <div id="previous_page">
          <div class="kbd">&#8592;</div>
          <h2 class="card_subtitle">Previous page: PR's</h2>
        </div>
        <div id="heading">
          <h1 id="card_title">Thanks!</h1>
        </div>
        <div id="next_page" />
      </div>

      <img src="/img/heart.png" alt="" />
      <p>Thanks for checking out this fun side project of mine!</p>
      <p>
        I hope you enjoyed viewing all the statistics, and hope you continue to
        build awesome things next year!
      </p>
      <p>
        If you want, you can <a
          href="https://github.com/thijsheijden/your-year-in-code"
          >check out the code on Github</a
        >, star it if you like, and I'm always open to cool ideas of things to
        add or improve!
      </p>
    </div>
  </div>
</main>

<style lang="scss">
  :root {
    --square-size: 1rem;
    --square-gap: 0.25rem;
    --week-width: calc(var(--square-size) + var(--square-gap));
  }

  a {
    text-decoration: none;
    color: var(--commit-color);
  }

  img {
    display: block;
    max-width: 20%;
    margin: 0 auto;
  }

  p {
    padding: 1rem 0;
    text-align: center;
  }

  li {
    list-style: none;
  }

  .months {
    grid-area: months;
  }

  .days {
    grid-area: days;
  }

  .squares {
    grid-area: squares;
    grid-auto-flow: column;
    grid-auto-columns: var(--square-size);
    transition: all 0.25s ease-in-out;

    li:hover {
      cursor: pointer;
      transform: scale(1.1);
    }
  }

  #graph_container {
    display: flex;
    justify-content: start;
    overflow: scroll;
  }

  #graph_container::-webkit-scrollbar {
    height: 2rem;
  }

  #graph_container::-webkit-scrollbar-thumb {
    border: 12px solid rgba(0, 0, 0, 0);
    background-clip: padding-box;
    border-radius: 9999px;
    background-color: #aaaaaa;
  }

  @media screen and (min-width: 1500px) {
    #graph_container {
      justify-content: center;
    }

    #graph_container::-webkit-scrollbar {
      display: none;
    }
  }

  .graph {
    display: inline-grid;
    grid-template-areas:
      "empty months"
      "days squares";
    grid-template-columns: auto 1fr;
    grid-gap: 0.5rem;
    padding: 2rem;
  }

  .months {
    display: grid;
    grid-template-columns:
      calc(var(--week-width) * 4) /* Jan */
      calc(var(--week-width) * 4) /* Feb */
      calc(var(--week-width) * 4) /* Mar */
      calc(var(--week-width) * 5) /* Apr */
      calc(var(--week-width) * 4) /* May */
      calc(var(--week-width) * 4) /* Jun */
      calc(var(--week-width) * 5) /* Jul */
      calc(var(--week-width) * 4) /* Aug */
      calc(var(--week-width) * 4) /* Sep */
      calc(var(--week-width) * 5) /* Oct */
      calc(var(--week-width) * 4) /* Nov */
      calc(var(--week-width) * 5) /* Dec */;
  }

  .days,
  .squares {
    display: grid;
    grid-gap: var(--square-gap);
    grid-template-rows: repeat(7, var(--square-size));
  }

  /* Other styling */

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial,
      sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    font-size: 12px;
  }

  .days li:nth-child(odd) {
    visibility: hidden;
  }

  #day_details {
    h1 {
      text-align: center;
    }
  }

  #stat_cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-top: 2rem;
  }

  .stat_card {
    border-radius: 0.5rem;
    background-color: rgb(32, 32, 34);
    padding: 1rem;

    > * {
      margin: 0.5rem 0;
    }
  }

  .grid {
    display: grid;
    gap: 1rem;

    .full-width {
      grid-column: 1/-1;
    }
  }

  .col3 {
    grid-template-columns: repeat(3, 1fr);
  }

  h5 {
    margin-top: 1rem;

    a {
      display: inline;
      text-decoration: none;
      color: var(--commit-color);
    }
  }
</style>
