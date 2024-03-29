<script lang="ts">
  import { goto } from "$app/navigation";
  import { statsStore } from "$lib/data_store/stats_store";
  import calculateTotals from "$lib/github/calculate_totals";
  import type FullStats from "$lib/github/models/full_stats";
  import type Stats from "$lib/github/models/stats";
  import { onMount } from "svelte";
  import "../styles.css";

  let fullStats: FullStats;
  let dates: string[];
  let mostCommits: number;
  let currentlySelectedDate: {
    date?: string;
    languages: string[];
  } = {
    date: undefined,
    languages: [],
  };

  // Load stats from store
  onMount(async () => {
    // Check if the store contains stats already
    if ($statsStore == null) {
      goto("/");
    } else {
      fullStats = $statsStore!;
      console.log(fullStats);
      dates = Object.keys(fullStats.perDay);
      mostCommits = fullStats.mostCommitsInDay;

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

  let squareColors = ["#C6E48B", "#7BC96F", "#196127"];
  const getColorForSquare = (date: string): string => {
    if (date == currentlySelectedDate.date) {
      return "var(--commit-color)";
    }

    let commits = fullStats.perDay[date].commits;
    if (commits == 0) {
      return "var(--accent-color)";
    }

    return squareColors[Math.min(Math.floor((commits! * 3) / mostCommits), 2)];
  };

  const openDayDetailView = (e: MouseEvent, date: string) => {
    if (date == currentlySelectedDate.date) {
      currentlySelectedDate.date = undefined;
    } else {
      currentlySelectedDate.date = date;
      currentlySelectedDate.languages = Object.keys(
        fullStats.perDay[date].perLanguage ?? {}
      );
    }

    dates = dates;
  };

  const handleKeyboardInput = (e: KeyboardEvent) => {
    if (e.key == "ArrowRight") {
      goto("/rewind/prs");
    } else if (e.key == "ArrowLeft") {
      goto("/rewind/languages");
    }
  };

  const moveToNextPage = () => {
    goto("/rewind/prs");
  }

  const moveToPreviousPage = () => {
    goto("/rewind/languages");
  }
</script>

<svelte:window on:keydown={handleKeyboardInput} />
<main>
  <div id="card">
    <div id="card_content">
      <div id="card_content_heading">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div id="previous_page" on:click={moveToPreviousPage}>
          <div class="kbd">&#8592;</div>
          <h2 class="card_subtitle">Previous page: Languages</h2>
        </div>
        <div id="heading">
          <h1 id="card_title">Commits</h1>
          <h2 class="card_subtitle">git commit -m "Update"</h2>
        </div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div id="next_page" on:click={moveToNextPage}>
          <h2 class="card_subtitle">Next page: PR's</h2>
          <div class="kbd">&#8594;</div>
        </div>
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

        {#if currentlySelectedDate.date}
          <div id="day_details">
            <h1>{currentlySelectedDate.date}</h1>
            <div id="stat_cards">
              <!-- Global day stats -->
              <h3 style="grid-column: 1/-1;">Overview</h3>
              <div class="stat_card">
                <div class="stat_card_content">
                  <h3>Commits</h3>
                  <h4 style="color: var(--commit-color);">
                    {fullStats.perDay[
                      currentlySelectedDate.date
                    ].commits.toLocaleString()}
                  </h4>
                </div>
              </div>
              <div class="stat_card">
                <div class="stat_card_content">
                  <h3>Additions</h3>
                  <h4 style="color: var(--additions-color);">
                    +{fullStats.perDay[
                      currentlySelectedDate.date
                    ].additions.toLocaleString()}
                  </h4>
                </div>
              </div>
              <div class="stat_card">
                <div class="stat_card_content">
                  <h3>Deletions</h3>
                  <h4 style="color: var(--deletions-color);">
                    -{fullStats.perDay[
                      currentlySelectedDate.date
                    ].deletions.toLocaleString()}
                  </h4>
                </div>
              </div>

              <!-- Day languages used -->
              <h3 style="grid-column: 1/-1;">Languages used</h3>
              {#each currentlySelectedDate.languages as language}
                <div class="stat_card">
                  <div class="stat_card_content">
                    <h3>{language}</h3>
                    <h4>
                      (<span style="color: var(--additions-color);"
                        >+{fullStats.perDay[
                          currentlySelectedDate.date
                        ].perLanguage[
                          language
                        ].additions.toLocaleString()}</span
                      >,
                      <span style="color: var(--deletions-color);"
                        >-{fullStats.perDay[
                          currentlySelectedDate.date
                        ].perLanguage[
                          language
                        ].deletions.toLocaleString()}</span
                      >)
                    </h4>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {:else}
          <!-- Global commit stats -->
          <div id="global_commit_stats" class="grid col3">
            <!-- Largest, smallest and most files changed commits -->
            <div class="stat_card">
              <h3>Largest commit</h3>
              <div class="stat_card_content">
                <h4 style="color: var(--commit-color);">
                  {fullStats.largestCommit?.totalChanges.toLocaleString()} changes
                </h4>
                <h5>
                  <a href={fullStats.largestCommit?.htmlURL}
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

            <div class="stat_card">
              <h3>Smallest commit</h3>
              <div class="stat_card_content">
                <h4 style="color: var(--commit-color);">
                  {fullStats.smallestCommit?.totalChanges.toLocaleString()} changes
                </h4>
                <h5>
                  <a href={fullStats.smallestCommit?.htmlURL}
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

            <div class="stat_card">
              <h3>Most file changes</h3>
              <div class="stat_card_content">
                <h4 style="color: var(--commit-color);">
                  {fullStats.commitWithMostFilesChanged?.filesChanged.toLocaleString()}
                  files changed
                </h4>
                <h5>
                  <a href={fullStats.commitWithMostFilesChanged?.htmlURL}
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

            <!-- Longest commit message -->
            <div class="stat_card full-width">
              <h3>Longest commit message</h3>
              <div class="stat_card_content">
                <p>
                  "{fullStats.commitWithLongestMessage?.message}"
                </p>
                <h5>
                  <a href={fullStats.largestCommit?.htmlURL}
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

            <!-- Shortest commit message -->
            <div class="stat_card full-width">
              <h3>Shortest commit message</h3>
              <div class="stat_card_content">
                <p>
                  "{fullStats.commitWithShortestMessage?.message}"
                </p>
                <h5>
                  <a href={fullStats.largestCommit?.htmlURL}
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
          </div>
        {/if}
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
    display: grid;
    grid-template-areas:
      "empty months"
      "days squares";
    grid-template-columns: auto 1fr;
    grid-gap: 0.5rem;
    padding: 2rem 0 1rem 2rem;
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
