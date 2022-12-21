import type { Octokit } from "octokit";
import type Sentiment from "sentiment";
import getCommitDetails from "./get_commit_details";
import getCommitSHAsByUserInRepository from "./get_commit_SHAs_by_user_in_repository";
import type Commit from "./models/commits";
import type PR from "./models/pr";
import type Repository from "./models/repository";

// getPRsForAllActiveRepos gets the PRs opened in the last year in all active repos
export default function getPRsForAllActiveRepos(
  client: Octokit,
  user: string,
  activeRepos: Repository[]
): Promise<Repository[]> {
  return new Promise<Repository[]>((resolve, reject) => {
    Promise.all(
      activeRepos.map((r) => getPRsForRepo(client, user, r))
    ).then((repos: Repository[]) => {
      resolve(repos);
    });
  });
}

function getPRsForRepo(
  client: Octokit,
  user: string,
  repo: Repository,
): Promise<Repository> {
  // Get date of 1 year ago
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);

  return new Promise<Repository>((resolve, reject) => {
    client
      .paginate(client.rest.pulls.list, {
        owner: repo.owner,
        repo: repo.name,
      })
      .then((result: Array<any>) => {
        // Filter out PR's created more than 1 year ago
        let filteredResult = result.filter(
          (r) => new Date(r.created_at) > date
        );

        let finalPRObjects: PR[] = [];

        filteredResult.forEach((pr) => {
          // Create the PR object
          let prObject: PR = {
            number: pr.number,
            state: pr.state,
            created_at: pr.created_at,
            merge_commit_sha: pr.merge_commit_sha,
          };

          // Fetch the merge commit (if a SHA is present)
          if (pr.merge_commit_sha != null) {
            getCommitDetails(
              client,
              repo,
              pr.merge_commit_sha,
            ).then((commit: Commit) => {
              prObject.merge_commit = commit;
            });
          }

          // Determine if the PR was created by this user
          pr.user.login == user
            ? (prObject.created_by_user = true)
            : (prObject.created_by_user = false);

            // Add to list
            finalPRObjects.push(prObject);
        });

        resolve(repo);
      });
  });
}
