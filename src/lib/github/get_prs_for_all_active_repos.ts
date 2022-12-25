import type { Octokit } from "octokit";
import type Sentiment from "sentiment";
import getCommitDetails from "./get_commit_details";
import getCommitSHAsByUserInRepository from "./get_commit_SHAs_by_user_in_repository";
import type Commit from "./models/commits";
import type PR from "./models/pr";
import type PRReview from "./models/pr_review";
import type Repository from "./models/repository";

// getPRsForAllActiveRepos gets the PRs opened in the last year in all active repos
export default function getPRsForAllActiveRepos(
  client: Octokit,
  user: string,
  activeRepos: Repository[]
): Promise<Repository[]> {
  return new Promise<Repository[]>((resolve, reject) => {
    Promise.all(activeRepos.map((r) => getPRsForRepo(client, user, r))).then(
      (repos: Repository[]) => {
        resolve(repos);
      }
    );
  });
}

async function getPRsForRepo(
  client: Octokit,
  user: string,
  repo: Repository
): Promise<Repository> {
  // Get date of 1 year ago
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);

  return new Promise<Repository>((resolve, reject) => {
    client
      .paginate(client.rest.pulls.list, {
        owner: repo.owner,
        repo: repo.name,
        state: "all",
      })
      .then(async (result: Array<any>) => {
        // Filter out PR's created more than 1 year ago
        let filteredResult = result.filter(
          (r) => new Date(r.created_at) > date
        );

        let finalPRObjects: PR[] = [];

        await Promise.all(
          filteredResult.map(async (pr) => {
            // Create the PR object
            let prObject: PR = {
              number: pr.number,
              state: pr.state,
              created_at: pr.created_at,
              closedAt: pr.closed_at ?? null,
              merge_commit_sha: pr.merge_commit_sha,
              total_changes: 0,
              URL: pr.html_url,
              approved: false,
            };

            // Fetch the merge commit (if a SHA is present)
            if (pr.merge_commit_sha != null) {
              let commit: Commit = await getCommitDetails(
                client,
                repo,
                pr.merge_commit_sha
              );
              prObject.merge_commit = commit;
              prObject.total_changes = commit.additions + commit.deletions;
            }

            // Fetch the PR reviews
            let prReviews: PRReview[] = [];
            let prReviewsResult: any = await client.rest.pulls.listReviews({
              owner: repo.owner,
              repo: repo.name,
              pull_number: prObject.number,
            });
            prReviewsResult.data.forEach((review: any) => {
              prReviews.push({
                by_authenticated_user: review.user.login == user,
                state: review.state,
                URL: review.html_url,
                body: review.body,
                submittedAt: review.submitted_at,
              });
            });

            // Add to the PR object
            prObject.reviews = prReviews;

            // Determine if the PR was created by this user
            pr.user.login == user
              ? (prObject.created_by_user = true)
              : (prObject.created_by_user = false);

            // Add to list
            finalPRObjects.push(prObject);
          })
        );

        repo.PRs = finalPRObjects;

        // Calculate repo PR totals
        repo.PRs.map((pr) => {
          // Init day stats fields
          const prCreatedDate = pr.created_at.split("T")[0];
          if (!repo.statsPerDate![prCreatedDate]) {
            repo.statsPerDate![prCreatedDate] = {
              commits: 0,
              additions: 0,
              deletions: 0,
              perLanguage: {},
              PRsCreated: 0,
              PRsMerged: 0,
              PRsReviewed: 0,
              commentsWritten: 0,
            };
          }

          let prMergedDate: string | null;
          if (pr.closedAt) {
            prMergedDate = pr.closedAt.split("T")[0];
            if (!repo.statsPerDate![prMergedDate]) {
              repo.statsPerDate![prMergedDate] = {
                commits: 0,
                additions: 0,
                deletions: 0,
                perLanguage: {},
                PRsCreated: 0,
                PRsMerged: 0,
                PRsReviewed: 0,
                commentsWritten: 0,
              };
            }
          }

          if (pr.created_by_user) {
            repo.totalPRsOpened++;
            repo.statsPerDate![prCreatedDate].PRsCreated!++;

            if (pr.total_changes > (repo.largestPROpened?.total_changes ?? 0)) {
              repo.largestPROpened = pr;
            }

            if (
              pr.total_changes <
              (repo.smallestPROpened?.total_changes ?? Number.MAX_SAFE_INTEGER)
            ) {
              repo.smallestPROpened = pr;
            }
          }

          if (pr.state == "closed" && pr.created_by_user) {
            repo.totalPRsMerged++;
            repo.totalMergedPRChanges += pr.total_changes;
            repo.statsPerDate![prMergedDate!].PRsMerged!++;

            if (pr.total_changes > (repo.largestPRMerged?.total_changes ?? 0)) {
              repo.largestPRMerged = pr;
            }

            if (
              pr.total_changes <
              (repo.smallestPRMerged?.total_changes ?? Number.MAX_SAFE_INTEGER)
            ) {
              repo.smallestPRMerged = pr;
            }
          }

          if (pr.reviews) {
            pr.reviews.map((review) => {
              if (review.by_authenticated_user) {
                repo.totalReviewedPRChanges += pr.total_changes;

                const prReviewedDate = review.submittedAt.split("T")[0];
                if (!repo.statsPerDate![prReviewedDate]) {
                  repo.statsPerDate![prReviewedDate] = {
                    commits: 0,
                    additions: 0,
                    deletions: 0,
                    perLanguage: {},
                    PRsCreated: 0,
                    PRsMerged: 0,
                    PRsReviewed: 0,
                    commentsWritten: 0,
                  };
                }
                repo.statsPerDate![prReviewedDate].PRsReviewed!++;
              }
            });
          }

          pr.reviews?.map((review) => {
            if (review.by_authenticated_user) {
              repo.totalPRsReviewed++;

              if (
                pr.total_changes > (repo.largestPRReviewed?.total_changes ?? 0)
              ) {
                repo.largestPRReviewed = pr;
              }

              if (
                pr.total_changes <
                (repo.smallestPRReviewed?.total_changes ??
                  Number.MAX_SAFE_INTEGER)
              ) {
                repo.smallestPRReviewed = pr;
              }

              // Check if this review has the longest or shortest comment
              if (review.body.length > (repo.longestReviewLeft?.body.length ?? Number.MIN_SAFE_INTEGER)) {
                repo.longestReviewLeft = review;
                repo.PRWithLongestReview = pr;
              }
              if (review.body.length < (repo.shortestReviewLeft?.body.length ?? Number.MAX_SAFE_INTEGER)) {
                repo.shortestReviewLeft = review;
                repo.PRWithShortestReview = pr;
              }
            } else {
              switch (review.state) {
                case "APPROVED":
                  pr.approved = true;
                  repo.PRsApproved++;
              }
            }
          });
        });

        resolve(repo);
      });
  });
}
