import type { Octokit } from "octokit";
import type Commit from "./models/commits";
import type Repository from "./models/repository";
import type Stats from "./models/stats";
import type Sentiment from "sentiment";
// import langMap from "lang-map";

// getCommitDetails gets the details for a commit using its SHA
export default function getCommitDetails(
  client: Octokit,
  repository: Repository,
  sha: string,
  sentiment: Sentiment,
  language: string
): Promise<Commit> {
  return new Promise<Commit>((resolve, reject) => {
    client.rest.repos
      .getCommit({
        owner: repository.owner,
        repo: repository.name,
        ref: sha,
        mediaType: {
          format: "application/vnd.github.VERSION.sha",
        },
      })
      .then((result: any) => {
        const { data } = result;
        const updatedFiles = data.files as Array<any>;

        const statsPerLanguage: Record<string, Stats> = {};

        // Go over the modified files and update the record with +/- per language
        updatedFiles.forEach((f) => {
          // If the update has 0 additions AND deletions, skip it
          if (f.additions == 0 && f.deletions == 0) {
            return;
          }

          // Get file extensions
          const fileNameAndExtension: Array<string> = f.filename.split(".");
          if (fileNameAndExtension.length == 1) {
            // File had no extension
            return;
          }

          // Grab the extension from the filename + extension list
          const fileExtension = fileNameAndExtension.pop();

          // Ignore exe, bin and json files, because they are often massive and contain no real code
          if (
            fileExtension == "exe" ||
            fileExtension == "bin" ||
            fileExtension == "json" ||
            fileExtension == "sum" ||
            fileExtension == "mod"
          ) {
            return;
          }

          // TODO: Copy lang map from Github and adjust (add TS, remove all non-programming languages)
          // Get programming language using extension
          // const language = langMap.languages(fileExtension)[0];

          // Init stats value if language is not present yet
          if (!statsPerLanguage[language]) {
            statsPerLanguage[language] = {
              additions: 0,
              deletions: 0,
            };
          }

          // Update per language additions and deletions
          statsPerLanguage[language].additions += f.additions;
          statsPerLanguage[language].deletions += f.deletions;
        });

        // Calculate sentiment
        const sentimentResult = sentiment.analyze(data.commit.message, {
          language: language,
        });

        resolve({
          sha: sha,
          additions: data.stats.additions,
          deletions: data.stats.deletions,
          date: data.commit.author.date,
          message: data.commit.message,
          statsPerLanguage: statsPerLanguage,
          sentiment: sentimentResult.comparative,
        });
      });
  });
}
