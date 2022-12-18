import type Commit from "./commits";
import type DayStats from "./day_stats";
import type Stats from "./stats";

type Repository = {
  name: string;
  id: number;
  node_id: string;
  pushed_at: string;
  owner: string;
  commits?: Array<Commit>;
  commitSHAs?: Array<string>;

  // Global repo stats
  totalAdditions?: number;
  totalDeletions?: number;
  totalCommits?: number;
  totalAdditionsAndDeletionsPerLanguage?: Record<string, Stats>;
  statsPerDate?: Record<string, DayStats>; // Date string as key

  // Dates the user was active in this repo
  activeDates?: Array<string>;
};

export default Repository;
