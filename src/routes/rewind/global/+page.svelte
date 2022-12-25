<script lang="ts">
  import { goto } from "$app/navigation";
  import { statsStore } from "$lib/data_store/stats_store";
  import calculateTotals from "$lib/github/calculate_totals";
  import type FullStats from "$lib/github/models/full_stats";
  import { onMount } from "svelte";
  import "../styles.css";

  let fullStats: FullStats;

  // Load stats from store
  onMount(async () => {
    // Check if the store contains stats already
    if ($statsStore == null) {
      goto("/");
    } else {
      fullStats = $statsStore!;
    }
  });

  const moveToNextPage = (e: KeyboardEvent) => {
    if (e.key == "ArrowRight") {
      goto("/rewind/languages")
    }
  }
</script>

<svelte:window on:keydown={moveToNextPage}/>
<main>
  <div id="card">
    <div id="card_content">
      <div id="card_content_heading">
        <div id="previous_page"></div>
        <div id="heading">
          <h1 id="card_title">Global</h1>
          <h2 class="card_subtitle">All the big numbers</h2>
        </div>
        <div id="next_page">
          <h2 class="card_subtitle">Next page: Languages</h2>
          <div class="kbd">&#8594;</div>
        </div>
      </div>

      <!-- Wait for fullStats to be loaded from local storage -->
      {#if fullStats}
        <div id="grid">
          <!-- Commit stats -->
          <h1>Commits</h1>
          <div class="stat_card">
            <div class="stat_card_content">
              <h3>Total commits</h3>
              <h4 style="color: #5FC9F8;">{fullStats.totalCommits}</h4>
            </div>
          </div>
          <div class="stat_card">
            <div class="stat_card_content">
              <h3>Total additions</h3>
              <h4 style="color: #39d353;">+{fullStats.totalAdditions}</h4>
            </div>
          </div>
          <div class="stat_card">
            <div class="stat_card_content">
              <h3>Total deletions</h3>
              <h4 style="color: #ff6961;">-{fullStats.totalDeletions}</h4>
            </div>
          </div>

          <!-- Language stats -->
          <h1>Languages</h1>
          <div class="stat_card">
            <div class="stat_card_content">
              <h3>Number of languages used</h3>
              <h4 style="color: #5FC9F8;">{fullStats.numberOfLanguagesUsed}</h4>
            </div>
          </div>
          <div class="stat_card">
            <div class="stat_card_content">
              <h3>Most loved: {fullStats.mostLovedLanguage}</h3>
              <h4>
                (<span style="color: #5FC9F8;"
                  >{fullStats.mostLovedLanguageStats.commits}</span
                >
                commits,
                <span style="color: #39d353;"
                  >+{fullStats.mostLovedLanguageStats.additions}</span
                >,
                <span style="color: #ff6961;"
                  >-{fullStats.mostLovedLanguageStats.deletions}</span
                >)
              </h4>
            </div>
          </div>
          <div class="stat_card">
            <div class="stat_card_content">
              <h3>Least loved: {fullStats.leastLovedLanguage}</h3>
              <h4>
                (<span style="color: #5FC9F8;"
                  >{fullStats.leastLovedLanguageStats.commits}</span
                >
                commits,
                <span style="color: #39d353;"
                  >+{fullStats.leastLovedLanguageStats.additions}</span
                >,
                <span style="color: #ff6961;"
                  >-{fullStats.leastLovedLanguageStats.deletions}</span
                >)
              </h4>
            </div>
          </div>

          <!-- PR stats -->
          <h1>Pull requests</h1>
          <div class="stat_card">
            <div class="stat_card_content">
              <h3>Opened</h3>
              <h4 style="color: #5FC9F8;">{fullStats.totalPRsOpened}</h4>
            </div>
          </div>
          <div class="stat_card">
            <div class="stat_card_content">
              <h3>Merged</h3>
              <h4 style="color: rgb(137, 87, 229);">{fullStats.totalPRsMerged} ({fullStats.totalPRChanges} changes)</h4>
            </div>
          </div>
          <div class="stat_card">
            <div class="stat_card_content">
              <h3>Reviewed</h3>
              <h4 style="color: #5FC9F8;">{fullStats.totalPRsReviewed} ({fullStats.totalPRChangesReviewed} changes)</h4>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</main>

<style lang="scss">
  #grid {
    margin-top: 2rem;
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(3, 1fr);

    h1 {
      font-size: 1.5rem;
      grid-column: span 3;
    }
  }

  .stat_card {
    border-radius: 0.5rem;
    background-color: rgb(32, 32, 34);
    margin-bottom: 3rem;
    transition: all 0.25s ease-in-out;

    &:hover {
      transform: scale(1.05);
    }
  }

  .stat_card_content {
    padding: 1rem;
  }
</style>
