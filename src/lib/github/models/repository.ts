import type Commit from "./commits";
import type DayStats from "./day_stats";
import type PR from "./pr";
import type Stats from "./stats";

type Repository = {
  name: string;
  id: number;
  node_id: string;
  pushed_at: string;
  owner: string;
  commits?: Array<Commit>;
  commitSHAs?: Array<string>;
  commitWithLongestMessage?: Commit;
  commitWithShortestMessage?: Commit;
  largestCommit?: Commit; // The commit with the most additions + deletions
  smallestCommit?: Commit; // The commit with the least additions + deletions
  commitWithMostFilesChanged?: Commit // The commit that changed the most files

  // Global repo stats
  totalAdditions?: number;
  totalDeletions?: number;
  totalCommits?: number;
  totalAdditionsAndDeletionsPerLanguage?: Record<string, Stats>;
  statsPerDate?: Record<string, DayStats>; // Date string as key

  // Dates the user was active in this repo
  activeDates?: Array<string>;

  // PR info
  PRs: PR[];
  totalPRsOpened: number;
  totalPRsMerged: number;
  totalPRsReviewed: number;
  totalMergedPRChanges: number;
  totalReviewedPRChanges: number;
  largestPROpened?: PR;
  smallestPROpened?: PR;
  largestPRMerged?: PR;
  smallestPRMerged?: PR;
  largestPRReviewed?: PR;
  smallestPRReviewed?: PR;
};

export default Repository;
