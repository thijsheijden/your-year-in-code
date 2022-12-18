import type Stats from "./stats";

type DayStats = {
  commits: number;
  additions: number;
  deletions: number;
  perLanguage: Record<string, Stats>;
  reposWorkedIn?: Set<string>;
};

export default DayStats;
