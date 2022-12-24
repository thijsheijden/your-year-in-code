import type DayStats from "./day_stats";
import type PR from "./pr";
import type Stats from "./stats";

type FullStats = {
  totalCommits: number;
  totalAdditions: number;
  totalDeletions: number;
  totalPRsOpened: number;
  totalPRsMerged: number;
  totalPRChanges: number;
  totalPRsReviewed: number;
  totalPRChangesReviewed: number;
  numberOfLanguagesUsed: number;
  mostLovedLanguage: string,
  mostLovedLanguageStats: Stats,
  leastLovedLanguage: string,
  leastLovedLanguageStats: Stats,
  totalAdditionsAndDeletionsPerLanguage: Record<string, Stats>;
  allReposWorkedIn: Array<string>;
  languageStatsPerRepo: Record<string, Record<string, Stats>>; // Repo name -> language -> stats

  // Highest values
  mostAdditionsInDay: number;
  mostDeletionsInDay: number;
  mostCommitsInDay: number;
  largestPROpened?: PR;
  smallestPROpened?: PR;
  largestPRMerged?: PR;
  smallestPRMerged?: PR;
  largestPRReviewed?: PR;
  smallestPRReviewed?: PR;

  // Date strings;
  dateWithMostAdditions: string;
  dateWithMostDeletions: string;
  dateWithMostCommits: string;
  dateWithMostPRsMerged?: string;
  dateWithMostPRsReviewed?: string;
  dateWithLargestPRMerged?: string;
  dateWithSmallestPRMerged?: string;
  dateWithLargestPRReviewed?: string;
  dateWithSmallestPRReviewed?: string;

  // All dates with their stats
  perDay: Record<string, DayStats>; // Date string YYYY-MM-DD is key

  // Dates every repo was active
  // Key is the repo name, value is an array of dates
  datesRepoWasActive: Record<string, Array<string>>;
};

export default FullStats;
