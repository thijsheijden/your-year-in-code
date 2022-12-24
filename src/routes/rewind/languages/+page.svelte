<script lang="ts">
  import { goto } from "$app/navigation";
  import { statsStore } from "$lib/data_store/stats_store";
  import calculateTotals from "$lib/github/calculate_totals";
  import type FullStats from "$lib/github/models/full_stats";
  import type Stats from "$lib/github/models/stats";
  import { onMount } from "svelte";
  import "../styles.css";

  let fullStats: FullStats;
  let languages: string[];

  // Load stats from store
  onMount(async () => {
    // Check if the store contains stats already
    if ($statsStore == null) {
      goto("/");
    } else {
      fullStats = $statsStore!;
      languages = Object.keys(fullStats.totalAdditionsAndDeletionsPerLanguage);
      languages.sort((a, b): number => {
        let langA = fullStats.totalAdditionsAndDeletionsPerLanguage[a]
        let changesA = langA.additions + langA.deletions
        let langB = fullStats.totalAdditionsAndDeletionsPerLanguage[b]
        let changesB = langB.additions + langB.deletions
        if (changesA > changesB) {
          return -1;
        } else if (changesA < changesB) {
          return 1;
        }

        return 0;
      })
    }
  });

  const moveToNextPage = (e: KeyboardEvent) => {
    if (e.key == "ArrowRight") {
      goto("/rewind/languages");
    } else if (e.key == "ArrowLeft") {
      goto("/rewind/global");
    }
  };
</script>

<svelte:window on:keydown={moveToNextPage} />
<main>
  <div id="card">
    <div id="card_content">
      <div id="card_content_heading">
        <h1 id="card_title">Languages</h1>
        <h2 id="card_subtitle">How many lines did you write?</h2>
      </div>

      <!-- Wait for fullStats to be loaded from local storage -->
      {#if fullStats}
        <div id="card_list">
          {#each languages as language}
            <div class="stat_card">
              <div class="stat_card_content">
                <h2 class="stat_card_content_title">{language}</h2>
                <div class="stat_card_horizontal_flex">
                  <div class="item">
                    <h3>Commits</h3>
                    <h4 style="color: var(--commit-color);">{fullStats.totalAdditionsAndDeletionsPerLanguage[language].commits ?? 0}</h4>
                  </div>

                  <div class="item">
                    <h3>Additions</h3>
                    <h4 style="color: var(--additions-color);">+{fullStats.totalAdditionsAndDeletionsPerLanguage[language].additions}</h4>
                  </div>

                  <div class="item">
                    <h3>Deletions</h3>
                    <h4 style="color: var(--deletions-color);">-{fullStats.totalAdditionsAndDeletionsPerLanguage[language].deletions}</h4>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</main>

<style lang="scss">
  #card_list {
    display: flex;
    flex-direction: column;
    margin-top: 2rem;
    gap: 2rem;
  }

  .stat_card {
    border-radius: 0.5rem;
    background-color: rgb(32, 32, 34);
    transition: all 0.25s ease-in-out;

    &:hover {
      transform: scale(1.05);
    }
  }

  .stat_card_content {
    padding: 1rem;
  }

  .stat_card_content_title {
    margin-bottom: 1rem;
  }

  .stat_card_horizontal_flex {
    display: flex;
    gap: 1rem;

    .item {

    }
  }
</style>
