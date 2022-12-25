import type { Octokit } from "octokit";
import type Repository from "./models/repository";

// getActiveRepos gets the repos the user has actively contributed to in the last year
const getActiveRepos = (client: Octokit): Promise<Array<Repository>> => {
  // List all repos
  return new Promise<Array<Repository>>((resolve, reject) => {
    // Get date of 1 year ago
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);

    // Get the repos the user contributed to
    client
      .paginate(client.rest.repos.listForAuthenticatedUser, {since: date.toISOString()})
      .then((result: Array<any>) => {
        resolve(
          result.map((r) => {
            return {
              name: r.name,
              id: r.id,
              node_id: r.node_id,
              pushed_at: r.pushed_at,
              owner: r.owner.login,
              PRs: [],
              totalPRsOpened: 0,
              totalPRsMerged: 0,
              totalPRsReviewed: 0,
              totalMergedPRChanges: 0,
              totalReviewedPRChanges: 0,
              longestCommitMessage: "",
            };
          })
        );
      });
  });
};

export default getActiveRepos;
