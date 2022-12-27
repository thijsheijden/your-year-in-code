<script lang="ts">
  import { goto } from "$app/navigation";
  import { statsStore } from "$lib/data_store/stats_store";
  import type FullStats from "$lib/github/models/full_stats";
  import { onMount } from "svelte";
  import "../styles.css";

  let fullStats: FullStats;
  let dates: string[];
  let currentlySelectedDate: {
    date: string;
  } = {
    date: "",
  };

  // Load stats from store
  onMount(async () => {
    // Check if the store contains stats already
    if ($statsStore == null) {
      goto("/");
    } else {
      fullStats = $statsStore!;
      dates = Object.keys(fullStats.perDay);

      // Make sure the first day is a sunday
      let firstDaySunday = false;
      while (!firstDaySunday) {
        let firstDate = dates.pop()!;
        if (new Date(firstDate).getDay() == 0) {
          dates.push(firstDate);
          firstDaySunday = true;
        }
      }

      dates = dates.reverse();
    }
  });

  const getColorForSquare = (date: string): string => {
    if (date == currentlySelectedDate.date) {
      return "var(--commit-color)";
    }

    let dayStats = fullStats.perDay[date];
    let prInteractions =
      (dayStats.PRsCreated ?? 0) +
      (dayStats.PRsMerged ?? 0) +
      (dayStats.PRsReviewed ?? 0);
    if (prInteractions == 0) {
      return "var(--accent-color)";
    }

    return "var(--merged-color)";
  };

  const openDayDetailView = (e: MouseEvent, date: string) => {};

  const moveToNextPage = (e: KeyboardEvent) => {
    if (e.key == "ArrowLeft") {
      goto("/rewind/commits");
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
          <h2 class="card_subtitle">Previous page: Commits</h2>
        </div>
        <div id="heading">
          <h1 id="card_title">Pull requests</h1>
          <h2 class="card_subtitle">open, review, merge</h2>
        </div>
        <div id="next_page" />
      </div>

      <!-- Wait for fullStats to be loaded from local storage -->
      {#if fullStats}
        <div id="graph_container">
          <div class="graph">
            <ul class="months">
              <li>Jan</li>
              <li>Feb</li>
              <li>Mar</li>
              <li>Apr</li>
              <li>May</li>
              <li>Jun</li>
              <li>Jul</li>
              <li>Aug</li>
              <li>Sep</li>
              <li>Oct</li>
              <li>Nov</li>
              <li>Dec</li>
            </ul>
            <ul class="days">
              <li>Sun</li>
              <li>Mon</li>
              <li>Tue</li>
              <li>Wed</li>
              <li>Thu</li>
              <li>Fri</li>
              <li>Sat</li>
            </ul>
            <ul class="squares">
              {#each dates as date}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <li
                  style="background-color: {getColorForSquare(date)};"
                  on:click={(event) => openDayDetailView(event, date)}
                />
              {/each}
            </ul>
          </div>
        </div>

        <!-- Global PR stats -->
        <div class="grid col3">
          {#if fullStats.largestPROpened}
            <!-- Largest PR opened -->
            <div class="stat_card">
              <h3>Largest PR opened</h3>
              <div class="stat_card_content">
                <h4 style="color: var(--commit-color);">
                  {fullStats.largestPROpened?.total_changes.toLocaleString()} changes
                </h4>
                <h5>
                  <a href={fullStats.largestPROpened?.URL}
                    >view on <svg height="16px" width="16px">
                      <image
                        xlink:href="/img/github-logo.svg"
                        height="16px"
                        width="16px"
                      />
                    </svg></a
                  >
                </h5>
              </div>
            </div>

            <!-- Smallest PR opened -->
            <div class="stat_card">
              <h3>Smallest PR opened</h3>
              <div class="stat_card_content">
                <h4 style="color: var(--commit-color);">
                  {fullStats.smallestPROpened?.total_changes.toLocaleString()}
                  changes
                </h4>
                <h5>
                  <a href={fullStats.smallestPROpened?.URL}
                    >view on <svg height="16px" width="16px">
                      <image
                        xlink:href="/img/github-logo.svg"
                        height="16px"
                        width="16px"
                      />
                    </svg></a
                  >
                </h5>
              </div>
            </div>
          {/if}

          {#if fullStats.largestPRMerged}
            <!-- Largest PR merged -->
            <div class="stat_card">
              <h3>Largest PR merged</h3>
              <div class="stat_card_content">
                <h4 style="color: var(--commit-color);">
                  {fullStats.largestPRMerged?.total_changes.toLocaleString()} changes
                </h4>
                <h5>
                  <a href={fullStats.largestPRMerged?.URL}
                    >view on <svg height="16px" width="16px">
                      <image
                        xlink:href="/img/github-logo.svg"
                        height="16px"
                        width="16px"
                      />
                    </svg></a
                  >
                </h5>
              </div>
            </div>

            <!-- Smallest PR merged -->
            <div class="stat_card">
              <h3>Smallest PR merged</h3>
              <div class="stat_card_content">
                <h4 style="color: var(--commit-color);">
                  {fullStats.smallestPRMerged?.total_changes.toLocaleString()}
                  changes
                </h4>
                <h5>
                  <a href={fullStats.smallestPRMerged?.URL}
                    >view on <svg height="16px" width="16px">
                      <image
                        xlink:href="/img/github-logo.svg"
                        height="16px"
                        width="16px"
                      />
                    </svg></a
                  >
                </h5>
              </div>
            </div>
          {/if}

          {#if fullStats.largestPRReviewed}
            <!-- Largest PR reviewed -->
            <div class="stat_card">
              <h3>Largest PR reviewed</h3>
              <div class="stat_card_content">
                <h4 style="color: var(--commit-color);">
                  {fullStats.largestPRReviewed?.total_changes.toLocaleString()}
                  changes
                </h4>
                <h5>
                  <a href={fullStats.largestPRReviewed?.URL}
                    >view on <svg height="16px" width="16px">
                      <image
                        xlink:href="/img/github-logo.svg"
                        height="16px"
                        width="16px"
                      />
                    </svg></a
                  >
                </h5>
              </div>
            </div>

            <!-- Smallest PR reviewed -->
            <div class="stat_card">
              <h3>Smallest PR reviewed</h3>
              <div class="stat_card_content">
                <h4 style="color: var(--commit-color);">
                  {fullStats.smallestPRReviewed?.total_changes.toLocaleString()}
                  changes
                </h4>
                <h5>
                  <a href={fullStats.smallestPRReviewed?.URL}
                    >view on <svg height="16px" width="16px">
                      <image
                        xlink:href="/img/github-logo.svg"
                        height="16px"
                        width="16px"
                      />
                    </svg></a
                  >
                </h5>
              </div>
            </div>
          {/if}

          <!-- PR approval ratio -->
          <div class="stat_card">
            <h3>PR approval ratio</h3>
            <div class="stat_card_content">
              <h4 style="color: var(--additions-color);">
                {fullStats.PRApprovalRatio}% of your PR's were approved
              </h4>
            </div>
          </div>

          <!-- PR merge ratio -->
          <div class="stat_card">
            <h3>PR merge ratio</h3>
            <div class="stat_card_content">
              <h4 style="color: var(--merged-color);">
                {fullStats.PRMergeRatio}% of your PR's were merged
              </h4>
            </div>
          </div>

          {#if fullStats.longestReviewLeft}
            <!-- Longest review left -->
            <div class="stat_card full-width">
              <h3>Longest review left</h3>
              <div class="stat_card_content">
                <p>
                  {fullStats.longestReviewLeft.body}
                </p>
                <h5>
                  <a href={fullStats.longestReviewLeft.URL}
                    >view on <svg height="16px" width="16px">
                      <image
                        xlink:href="/img/github-logo.svg"
                        height="16px"
                        width="16px"
                      />
                    </svg></a
                  >
                </h5>
              </div>
            </div>
          {/if}

          {#if fullStats.shortestReviewLeft}
            <!-- Longest review left -->
            <div class="stat_card full-width">
              <h3>Shortest review left</h3>
              <div class="stat_card_content">
                <p>
                  {fullStats.shortestReviewLeft.body}
                </p>
                <h5>
                  <a href={fullStats.shortestReviewLeft.URL}
                    >view on <svg height="16px" width="16px">
                      <image
                        xlink:href="/img/github-logo.svg"
                        height="16px"
                        width="16px"
                      />
                    </svg></a
                  >
                </h5>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</main>

<style lang="scss">
  :root {
    --square-size: 1rem;
    --square-gap: 0.25rem;
    --week-width: calc(var(--square-size) + var(--square-gap));
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
