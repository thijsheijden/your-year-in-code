import type Commit from "./commits";
import type DayStats from "./day_stats";
import type PR from "./pr";
import type PRReview from "./pr_review";
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
  commitWithLongestMessage?: Commit; // The commit with the largest commit message
  commitWithShortestMessage?: Commit; // The commit with the shortest commit message
  largestCommit?: Commit; // The commit with the most additions + deletions
  smallestCommit?: Commit; // The commit with the least additions + deletions
  commitWithMostFilesChanged?: Commit // The commit that changed the most files
  mostAdditionsInDay: number;
  mostDeletionsInDay: number;
  mostCommitsInDay: number;
  largestPROpened?: PR;
  smallestPROpened?: PR;
  largestPRMerged?: PR;
  smallestPRMerged?: PR;
  largestPRReviewed?: PR;
  smallestPRReviewed?: PR;
  PRWithLongestReview?: PR;
  longestReviewLeft?: PRReview;
  PRWithShortestReview?: PR;
  shortestReviewLeft?: PRReview;
  PRApprovalRatio?: number; // The percentage of PRs the user opened that were approved
  PRMergeRatio?: number; // The percentage of PRs the user opened that were merged

  // Date strings;
  dateWithMostAdditions: string;
  dateWithMostDeletions: string;
  dateWithMostCommits: string;

  // All dates with their stats
  perDay: Record<string, DayStats>; // Date string YYYY-MM-DD is key

  // Dates every repo was active
  // Key is the repo name, value is an array of dates
  datesRepoWasActive: Record<string, Array<string>>;
};

export default FullStats;
