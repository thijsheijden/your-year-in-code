import type { Octokit } from "octokit";
import type PR from "./models/pr";
import type PRReview from "./models/pr_review";
import type Repository from "./models/repository";

// getReviewsOnAllRepoPRs gets the reviews added on
export default function getReviewsOnAllRepoPRs(
  client: Octokit,
  user: string,
  repo: Repository
): Promise<Repository> {
  console.log(`Getting reviews for PR's created in repository '${repo.name}'`);
  return new Promise<Repository>((resolve, reject) => {
    if (repo.PRs!.length > 0) {
      Promise.all(
        repo.PRs!.map((pr: any) => getReviewsForPR(client, user, repo, pr))
      ).then((_: void[]) => {
        resolve(repo);
      });
    }

    console.log(`Repository ${repo.name} has no PR's`);
  });
}

function getReviewsForPR(
  client: Octokit,
  user: string,
  repo: Repository,
  PR: PR
): Promise<void> {
  console.log(
    `Getting reviews for PR '${PR.number}' in repository '${repo.name}'`
  );
  return new Promise<void>((resolve, reject) => {
    client.rest.pulls
      .listReviews({
        owner: repo.owner,
        repo: repo.name,
        pull_number: PR.number,
      })
      .then((result: any) => {
        // Create list of PR reviews
        let prReviewObjects: PRReview[] = [];

        result.data.forEach((elem: any) => {
          prReviewObjects.push({
            by_authenticated_user: elem.user.login == user,
            state: elem.state,
            URL: elem.html_url,
            body: elem.body,
            submittedAt: elem.submitted_at,
          });
        });

        PR.reviews = prReviewObjects;
        resolve();
      })
      .catch((rejectionReason) => {
        console.error(
          `Error while retrieving reviews for PR '${PR.number}' in repository '${repo.name}': `,
          rejectionReason,
        );
        resolve();
      });
  });
}
