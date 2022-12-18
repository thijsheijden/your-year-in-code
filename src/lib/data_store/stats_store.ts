import type FullStats from "$lib/github/models/full_stats";
import { writable } from "svelte/store";

export const statsStore = writable<FullStats | null>(null);

let fullStatsStringLoadedFromLocalStorage = localStorage.getItem("full_stats");

if (fullStatsStringLoadedFromLocalStorage != null) {
  try {
    let fullStatsJSON: FullStats = JSON.parse(
      fullStatsStringLoadedFromLocalStorage
    );

    // Write to store
    statsStore.set(fullStatsJSON);
  } catch (error) {
    console.error(error);
  }
}

statsStore.subscribe((newValue) =>
  localStorage.setItem("full_stats", JSON.stringify(newValue))
);
