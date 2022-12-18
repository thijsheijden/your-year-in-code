import type DayStats from "./day_stats";
import type Stats from "./stats";

type FullStats = {
  totalCommits: number;
  totalAdditions: number;
  totalDeletions: number;
  totalAdditionsAndDeletionsPerLanguage: Record<string, Stats>;
  allReposWorkedIn: Array<string>;
  languageStatsPerRepo: Record<string, Record<string, Stats>>; // Repo name -> language -> stats

  // Highest values
  mostAdditionsInDay: number;
  mostDeletionsInDay: number;
  mostCommitsInDay: number;

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
