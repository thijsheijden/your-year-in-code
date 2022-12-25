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
  let repositories: string[];
  let currentRepository = "";
  let additionsAndDeletionsPerLanguage: Record<string, Stats>;

  // Load stats from store
  onMount(async () => {
    // Check if the store contains stats already
    if ($statsStore == null) {
      goto("/");
    } else {
      fullStats = $statsStore!;
      console.log(fullStats);
      loadAllLanguages();
      repositories = Object.keys(fullStats.languageStatsPerRepo);
    }
  });

  const repositoryClicked = (repository: string) => {
    // If the repository clicked is the one already selected, unselect it
    if (repository == currentRepository) {
      currentRepository = "";
      loadAllLanguages();
    } else {
      currentRepository = repository;
      loadSelectedRepositoryLanguages();
    }
  };

  const loadAllLanguages = () => {
    additionsAndDeletionsPerLanguage =
      fullStats.totalAdditionsAndDeletionsPerLanguage;
    languages = Object.keys(additionsAndDeletionsPerLanguage);
    languages.sort((a, b): number => {
      let langA = additionsAndDeletionsPerLanguage[a];
      let changesA = langA.additions + langA.deletions;
      let langB = additionsAndDeletionsPerLanguage[b];
      let changesB = langB.additions + langB.deletions;
      if (changesA > changesB) {
        return -1;
      } else if (changesA < changesB) {
        return 1;
      }

      return 0;
    });
  };

  const loadSelectedRepositoryLanguages = () => {
    additionsAndDeletionsPerLanguage =
      fullStats.languageStatsPerRepo[currentRepository];
    languages = Object.keys(fullStats.languageStatsPerRepo[currentRepository]);
    languages.sort((a, b): number => {
      let langA = additionsAndDeletionsPerLanguage[a];
      let changesA = langA.additions + langA.deletions;
      let langB = additionsAndDeletionsPerLanguage[b];
      let changesB = langB.additions + langB.deletions;
      if (changesA > changesB) {
        return -1;
      } else if (changesA < changesB) {
        return 1;
      }

      return 0;
    });
  };

  const moveToNextPage = (e: KeyboardEvent) => {
    if (e.key == "ArrowRight") {
      goto("/rewind/commits");
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
        <div id="previous_page">
          <div class="kbd">&#8592;</div>
          <h2 class="card_subtitle">Previous page: Global</h2>
        </div>
        <div id="heading">
          <h1 id="card_title">Languages</h1>
          <h2 class="card_subtitle">How many lines did you write?</h2>
        </div>
        <div id="next_page">
          <h2 class="card_subtitle">Next page: Commits</h2>
          <div class="kbd">&#8594;</div>
        </div>
      </div>

      {#if fullStats}
        <div id="repository_selector">
          {#if currentRepository == ""}
            {#each repositories as repository}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <div on:click={() => repositoryClicked(repository)} class="pill">
                <h1>{repository}</h1>
              </div>
            {/each}
          {:else}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
              on:click={() => repositoryClicked(currentRepository)}
              class="pill active"
            >
              <h1>{currentRepository}</h1>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Wait for fullStats to be loaded from local storage -->
      {#if fullStats}
        <div id="card_grid">
          {#each languages as language}
            <div class="stat_card">
              <div class="stat_card_content">
                <h2 class="stat_card_content_title">{language}</h2>
                <div class="stat_card_horizontal_flex">
                  <div>
                    <h3>Commits</h3>
                    <h4 style="color: var(--commit-color);">
                      {fullStats.totalAdditionsAndDeletionsPerLanguage[language]
                        .commits ?? 0}
                    </h4>
                  </div>

                  <div>
                    <h3>Additions</h3>
                    <h4 style="color: var(--additions-color);">
                      +{fullStats.totalAdditionsAndDeletionsPerLanguage[
                        language
                      ].additions}
                    </h4>
                  </div>

                  <div>
                    <h3>Deletions</h3>
                    <h4 style="color: var(--deletions-color);">
                      -{fullStats.totalAdditionsAndDeletionsPerLanguage[
                        language
                      ].deletions}
                    </h4>
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
  #repository_selector {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    overflow: scroll;
    padding: 3rem;

    .pill {
      flex: 0 0 auto;
    }
  }

  #repository_selector::-webkit-scrollbar {
    display: none;
  }

  .pill {
    border: 1px solid rgba(223, 142, 228, 1);
    background-color: rgba(223, 142, 228, 0.2);
    border-radius: 2rem;
    padding: 0.25rem 1.5rem;
    transition: all 0.25s ease-in-out;

    h1 {
      color: rgba(223, 142, 228, 1);
      font-size: 1rem;
    }

    &:hover {
      cursor: pointer;
      transform: scale(1.05);
    }
  }

  .active {
    border-width: 3px;
  }

  #card_grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
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
    text-align: center;
  }

  .stat_card_horizontal_flex {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    gap: 1rem;
  }
</style>
