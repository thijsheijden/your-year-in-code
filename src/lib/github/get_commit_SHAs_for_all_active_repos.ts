import type { Octokit } from "octokit";
import getCommitSHAsByUserInRepository from "./get_commit_SHAs_by_user_in_repository";
import type Repository from "./models/repository";

// getCommitSHAsForAllActiveRepos gets all SHAs for commits done by the user in the last year.
// It goes over all repositories passed in, and gets the SHAs for commits the user has made in them
// in the past year
export default function getCommitSHAsForAllActiveRepos(
  client: Octokit,
  user: string,
  activeRepos: Array<Repository>
): Promise<Array<Repository>> {
  return new Promise<Array<Repository>>((resolve, reject) => {
    Promise.all(
      activeRepos.map((r) => getCommitSHAsByUserInRepository(client, user, r))
    ).then((commitsPerRepo: Array<Repository>) => {
      resolve(commitsPerRepo);
    });
  });
}
