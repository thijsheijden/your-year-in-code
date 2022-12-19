<script lang="ts">
  import { goto } from "$app/navigation";
  import { statsStore } from "$lib/data_store/stats_store";
  import calculateTotals from "$lib/github/calculate_totals";
  import getActiveRepos from "$lib/github/get_active_repos";
  import getCommitDetailsForRepo from "$lib/github/get_commit_details_for_repo";
  import getCommitSHAsForAllActiveRepos from "$lib/github/get_commit_SHAs_for_all_active_repos";
  import getCurrentUser from "$lib/github/get_current_user";
  import getPRsForRepo from "$lib/github/get_prs_for_all_active_repos";
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
      label: "Loading your PR's",
      completed: false,
      currentlyLoading: false,
    },
    {
      label: "Loading the comments you have made",
      completed: false,
      currentlyLoading: false,
    },
    {
      label: "Loading the reactions you left",
      completed: false,
      currentlyLoading: false,
    },
  ];

  // Keep track of the step we are currently on
  let currentStepIndex: number = 0;
  let allStepsComplete: boolean = false;

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
    getActiveRepos(ghClient)
      .then((activeRepos: Array<Repository>) => {
        nextStep();
        return getCommitSHAsForAllActiveRepos(
          ghClient,
          authenticatedUser.username,
          activeRepos.splice(1, activeRepos.length - 1)
        );
      })
      .then((activeReposWithCommitSHAs: Array<Repository>) => {
        return Promise.all(
          activeReposWithCommitSHAs.map((r) => {
            return getCommitDetailsForRepo(ghClient, r);
          })
        );
      })
      .then((activeReposWithCommits: Array<Repository>) => {
        nextStep();
        const fullStats = calculateTotals(activeReposWithCommits);

        // Add the resulting object to the local storage
        statsStore.set(fullStats);
      });
  };

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
      fullStats = $statsStore!;
    }

    // console.log(fullStats);
    getActiveRepos(ghClient)
      .then((repos: Repository[]) =>
        getPRsForRepo(ghClient, "thijsheijden", repos)
      )
      .then((repos: Repository[]) => console.log(repos));
    // getPRsForRepo(ghClient, "thijsheijden", {
    //   name: "website",
    //   owner: "Swift-Software-LLC",
    //   id: 1,
    //   node_id: "",
    //   pushed_at: ""
    // }).then((result: PR[]) => {
    // })
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
</style>
