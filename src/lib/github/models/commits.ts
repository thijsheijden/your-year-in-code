import type Stats from "./stats";

type Commit = {
  sha: string;
  additions: number;
  deletions: number;
  date: string;
  message: string;
  statsPerLanguage: Record<string, Stats>;
  sentiment: number;
};

export default Commit;
