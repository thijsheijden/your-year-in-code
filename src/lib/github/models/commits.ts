import type Stats from "./stats";

type Commit = {
  sha: string;
  additions: number;
  deletions: number;
  totalChanges: number; // Commit additions + deletions
  filesChanged: number; // The number of files changed in this commit
  date: string; // Date commit was made
  message: string; // Commit message
  htmlURL: string; // URL to view the commit in Github
  statsPerLanguage: Record<string, Stats>; // Additions/deletions per language in this commit
};

export default Commit;
