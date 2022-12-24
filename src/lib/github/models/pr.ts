import type Commit from "./commits";
import type PRReview from "./pr_review";

type PR = {
  // Fields present on data returned from Github
  number: number, // The number of the PR, useful when fetching comments
  state: string, // State of the PR, one of "open", "closed"
  created_at: string, // Date the PR was created
  merge_commit_sha: string, // The SHA hash of the merge commit
  
  // Computed properties
  created_by_user?: boolean,
  merge_commit?: Commit,
  reviews?: PRReview[] // Reviews of PR
  total_changes: number; // PR merge commit additions + deletions
}

export default PR;