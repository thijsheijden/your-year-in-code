<script lang="ts">
  import { goto } from "$app/navigation";
  import { statsStore } from "$lib/data_store/stats_store";
  import calculateTotals from "$lib/github/calculate_totals";
  import getActiveRepos from "$lib/github/get_active_repos";
  import getAllRepoComments from "$lib/github/get_all_repo_comments";
  import getCommitDetailsForRepo from "$lib/github/get_commit_details_for_repo";
  import getCommitSHAsForAllActiveRepos from "$lib/github/get_commit_SHAs_for_all_active_repos";
  import getCurrentUser from "$lib/github/get_current_user";
  import getPRsForAllActiveRepos from "$lib/github/get_prs_for_all_active_repos";
  import getPRsForRepo from "$lib/github/get_prs_for_all_active_repos";
  import getReviewsOnAllRepoPRs from "$lib/github/get_reviews_on_pr";
  import type FullStats from "$lib/github/models/full_stats";
  import type PR from "$lib/github/models/pr";
  import type Repository from "$lib/github/models/repository";
  import type User from "$lib/github/models/user";
  import { Octokit } from "octokit";
  import Sentiment from "sentiment";
  import { onMount } from "svelte";
  import { Circle } from "svelte-loading-spinners";

  // Octokit client
  let ghClient: Octokit;

  // The authenticated user
  let authenticatedUser: User;

  type loadingStep = {
    label: string;
    completed: boolean;
    currentlyLoading: boolean;
  };
  let loadingSteps: loadingStep[] = [
    {
      label: "Loading the repositories you've been active in",
      completed: false,
      currentlyLoading: true,
    },
    {
      label: "Loading the commits you've made",
      completed: false,
      currentlyLoading: false,
    },
    {
      label: "Loading PR's you created or reviewed",
      completed: false,
      currentlyLoading: false,
    },
    {
      label: "Loading the comments you left",
      completed: false,
      currentlyLoading: false,
    },
    {
      label: "Extracting fun statistics from all the data gathered",
      completed: false,
      currentlyLoading: false,
    },
  ];

  // Keep track of the step we are currently on
  let currentStepIndex: number = 0;
  let allStepsComplete: boolean = false;
  let foundCachedData: boolean = false;

  // nextStep marks the current step as completed and moves to the next step
  const nextStep = () => {
    // Mark the current step as complete
    loadingSteps[currentStepIndex] = {
      ...loadingSteps[currentStepIndex],
      completed: true,
      currentlyLoading: false,
    };

    if (currentStepIndex + 1 < loadingSteps.length) {
      // Mark the next step as active
      currentStepIndex++;
      loadingSteps[currentStepIndex] = {
        ...loadingSteps[currentStepIndex],
        currentlyLoading: true,
      };
    } else {
      allStepsComplete = true;
    }
  };

  // loadAllData performs all requests and combines the resulting data into the
  // fullStats model
  const loadAllData = async () => {
    // Get all repo's the user was active in during the last year
    getActiveRepos(ghClient)
      .then((activeRepos: Array<Repository>) => {
        nextStep();

        // Load the commit SHA's for all commits the user made in the last year for every repo
        return getCommitSHAsForAllActiveRepos(
          ghClient,
          authenticatedUser.username,
          activeRepos.splice(1, activeRepos.length - 1)
        );
      })
      .then((activeRepos: Array<Repository>) => {
        // Load the commit details for every commit SHA
        return Promise.all(
          activeRepos.map((r) => {
            return getCommitDetailsForRepo(ghClient, r);
          })
        );
      })
      .then((activeRepos: Array<Repository>) => {
        nextStep();

        // Load all PR's that have been created in those repo's during the last year
        return getPRsForAllActiveRepos(
          ghClient,
          authenticatedUser.username,
          activeRepos
        );
      })
      .then((activeRepos: Array<Repository>) => {
        nextStep();

        // TODO: Load all comments the user made
        return activeRepos;
      })
      .then((activeRepos: Repository[]) => {
        nextStep();

        // Compute the full stats object
        const fullStats = calculateTotals(activeRepos);

        // Add the resulting object to the local storage
        statsStore.set(fullStats);

        nextStep();
      });
  };

  const clearCache = () => {
    statsStore.set(null);
  }

  let accessToken: string | null;
  onMount(async () => {
    // Grab the access token from the query parameters
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    accessToken = params.get("access_token");

    // If no code is present, the user should authenticate first
    if (accessToken == null) {
      goto("/");
    }

    // Create new Github API client
    ghClient = new Octokit({ auth: accessToken });

    // Grab the authenticated user
    authenticatedUser = await getCurrentUser(ghClient);

    // Check if the store contains stats already
    let fullStats: FullStats;
    if ($statsStore == null) {
      // Load all data (store is empty)
      console.log("FullStats not in store");
      await loadAllData();
      fullStats = $statsStore!;
    } else {
      console.log("FullStats being loaded from store");

      foundCachedData = true;

      // Complete all steps
      loadingSteps.map((s) => {
        (s.completed = true), (s.currentlyLoading = false);
      });
      loadingSteps = loadingSteps;
      allStepsComplete = true;

      fullStats = $statsStore!;
    }

    console.log(fullStats);
  });
</script>

<main>
  <div id="main_content_container">
    <div id="main_content">
      <div id="main_content_header">
        {#if authenticatedUser != null}
          <h1>
            Hi {authenticatedUser.username}!
          </h1>
        {/if}
        <h3>Grab a cup of ☕️ and hang tight as we crunch your data...</h3>
      </div>

      <div id="loading-steps_container">
        <div id="loading-steps_container_content">
          {#each loadingSteps as loadingStep}
            <div
              class="loading_step {loadingStep.currentlyLoading
                ? 'loading_step_active'
                : ''}"
            >
              <h1>{loadingStep.label}</h1>
              {#if loadingStep.currentlyLoading}
                <Circle size="20" color="white" unit="px" duration="1s" />
              {:else if loadingStep.completed}
                <h1>✅</h1>
              {/if}
            </div>
          {/each}

          {#if foundCachedData}
            <h5 id="cached_data_info_label">
              We found cached data, if you want to re-fetch your stats <button on:click={clearCache}
                >click here</button
              > and refresh the page.
            </h5>
          {/if}
          {#if allStepsComplete}
            <a id="start_button" href="/rewind/global">View your rewind</a>
          {/if}
        </div>
      </div>
    </div>
  </div>
</main>

<style lang="scss">
  main {
    width: 100vw;
    height: 100vh;
  }

  #main_content_container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
  }

  #main_content {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  #main_content_header {
    margin-bottom: 32px;
  }

  #loading-steps_container {
    background-color: rgb(32, 32, 34);
    border-radius: 8px;
  }

  #loading-steps_container_content {
    padding: 32px;
  }

  .loading_step {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    opacity: 0.5;
    padding: 4px 0;

    h1 {
      font-size: 16px;
    }
  }

  .loading_step_active {
    opacity: 1;
  }

  #cached_data_info_label {
    margin-top: 1.5em;
    
    text-align: center;
    color: rgb(247, 136, 100);

    button {
      color: inherit;
      background-color: rgba(217, 63, 11, 0.18);
      border: 1px rgba(247, 136, 100, 0.3) solid;
      border-radius: 1em;
      padding: 0.5em;

      transition: all 0.25s ease-in-out;
    }

    button:hover {
      cursor: pointer;
      transform: scale(1.1);
    }
  }

  #start_button {
    display: block;
    padding: 0.5em 1em;
    width: max-content;
    margin: 0 auto;
    margin-top: 1em;

    border-radius: 1em;
    border: 1px solid rgba(46, 204, 113, 1);
    background-color: rgba(46, 204, 113, 0.2);

    color: rgb(46, 204, 113);
    font-weight: bold;
    text-decoration: none;

    transition: all 0.25s ease-in-out;
  }

  #start_button:hover {
    cursor: pointer;
    transform: scale(1.08);
  }
</style>
