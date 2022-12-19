import type Commit from "./commits";

type PR = {
  // Fields present on data returned from Github
  number: number, // The number of the PR, useful when fetching comments
  state: string, // State of the PR 
  created_at: string, // Date the PR was created
  merge_commit_sha: string, // The SHA hash of the merge commit
  
  // Computed properties
  created_by_user?: boolean,
  merge_commit?: Commit,
}

export default PR;