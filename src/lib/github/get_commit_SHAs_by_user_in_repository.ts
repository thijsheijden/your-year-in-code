import type { Octokit } from "octokit";
import type Commit from "./models/commits";
import type Repository from "./models/repository";

// getCommitSHAsByUserInRepository gets all commit SHAs for the user in the given repo
export default function getCommitSHAsByUserInRepository(
  client: Octokit,
  user: string,
  repository: Repository
): Promise<Repository> {
  // Get date of 1 year ago
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);

  // Fetch all commits the user has made in that repository in the past year
  return new Promise<Repository>((resolve, reject) => {
    client
      .paginate(client.rest.repos.listCommits, {
        owner: repository.owner,
        repo: repository.name,
        since: date.toISOString(),
        author: user,
      })
      .then((result: Array<any>) => {

        console.log(repository.name);
        console.log(result);

        repository.commitSHAs = result.map((c) => {
          return c.sha;
        });
        resolve(repository);
      });
  });
}
