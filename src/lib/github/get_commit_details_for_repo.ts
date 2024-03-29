import type { Octokit } from "octokit";
import type Sentiment from "sentiment";
import getCommitDetails from "./get_commit_details";
import type Commit from "./models/commits";
import type DayStats from "./models/day_stats";
import type Repository from "./models/repository";
import type Stats from "./models/stats";

// getCommitDetailsForRepo goes over all commit SHAs in a repository and gathers the commit details
// it adds the commits to the commits property of the repository
export default function getCommitDetailsForRepo(
  client: Octokit,
  repo: Repository
): Promise<Repository> {
  return new Promise<Repository>((resolve, reject) => {
    // Go over all commit SHAs and fetch the details
    console.log(`Getting commit details for repo '${repo.name}'`)
    Promise.all(
      repo.commitSHAs!.map((sha: string) => getCommitDetails(client, repo, sha))
    ).then((commits: Array<Commit>) => {
      // Add the commits to the repo object
      repo.commits = commits;

      // Init values
      let totalAdditions = 0;
      let totalDeletions = 0;
      let totalCommits = 0;
      let totalAdditionsAndDeletionsPerLanguage: Record<string, Stats> = {};
      let statsPerDate: Record<string, DayStats> = {};
      let datesRepoWasActive: Set<string> = new Set<string>();

      // Calculate repo totals
      repo.commits.forEach((c) => {
        totalAdditions! += c.additions;
        totalDeletions! += c.deletions;
        totalCommits! += 1;

        const commitDate = c.date.split("T")[0];

        // Add the date to the dates this repo was active
        datesRepoWasActive.add(commitDate);

        // Add the commit stats to the day on which the commit occurred
        // Init the value if key is not known yet
        if (!statsPerDate[commitDate]) {
          statsPerDate[commitDate] = {
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

        // Add the stats for this commit to the date it occurred
        statsPerDate[commitDate].additions! += c.additions;
        statsPerDate[commitDate].deletions! += c.deletions;
        statsPerDate[commitDate].commits! += 1;

        // Check if this commit has the longest or shortest commit message
        if (
          c.message.length >
          (repo.commitWithLongestMessage?.message ?? "").length
        ) {
          // Make sure it is not a squashed commit message
          if (!c.message.includes("Squashed commit")) {
            repo.commitWithLongestMessage = c;
          }
        }
        if (
          c.message.length <
            (repo.commitWithShortestMessage?.message ?? "").length ||
          repo.commitWithShortestMessage == undefined
        ) {
          repo.commitWithShortestMessage = c;
        }

        // Check if this commit has the most/least changes
        if (
          c.totalChanges >
          (repo.largestCommit?.totalChanges ?? Number.MIN_SAFE_INTEGER)
        ) {
          repo.largestCommit = c;
        }
        if (
          c.totalChanges <
          (repo.smallestCommit?.totalChanges ?? Number.MAX_SAFE_INTEGER)
        ) {
          repo.smallestCommit = c;
        }

        // Check if this commit changed the most files
        if (c.filesChanged > (repo.commitWithMostFilesChanged?.filesChanged ?? Number.MIN_SAFE_INTEGER)) {
          repo.commitWithMostFilesChanged = c;
        }

        // Go over all languages in the commit and update the total stats for that language
        for (let lang in c.statsPerLanguage) {
          // Init value if key is not present yet
          if (!totalAdditionsAndDeletionsPerLanguage[lang]) {
            totalAdditionsAndDeletionsPerLanguage[lang] = {
              additions: 0,
              deletions: 0,
              commits: 0,
            };
          }

          // Init value if language is not present for this date yet
          if (!statsPerDate[commitDate].perLanguage![lang]) {
            statsPerDate[commitDate].perLanguage![lang] = {
              additions: 0,
              deletions: 0,
              commits: 0,
            };
          }

          // Update the repo stats
          totalAdditionsAndDeletionsPerLanguage[lang].additions +=
            c.statsPerLanguage[lang].additions;
          totalAdditionsAndDeletionsPerLanguage[lang].deletions +=
            c.statsPerLanguage[lang].deletions;
          totalAdditionsAndDeletionsPerLanguage[lang].commits! += 1;

          // Add these stats to the day the commit occurred
          statsPerDate[commitDate].perLanguage![lang].additions +=
            c.statsPerLanguage[lang].additions;
          statsPerDate[commitDate].perLanguage![lang].deletions +=
            c.statsPerLanguage[lang].deletions;
        }
      });

      // Set fields on repo object
      repo.totalCommits = totalCommits;
      repo.totalAdditions = totalAdditions;
      repo.totalDeletions = totalDeletions;
      repo.totalAdditionsAndDeletionsPerLanguage =
        totalAdditionsAndDeletionsPerLanguage;
      repo.statsPerDate = statsPerDate;
      repo.activeDates = Array.from(datesRepoWasActive.values());

      resolve(repo);
    });
  });
}
