import type { Octokit } from "octokit";
import type Commit from "./models/commits";
import type Repository from "./models/repository";
import type Stats from "./models/stats";
import type Sentiment from "sentiment";
import { langMap } from "$lib/lang_map/lang_map";

// getCommitDetails gets the details for a commit using its SHA
export default function getCommitDetails(
  client: Octokit,
  repository: Repository,
  sha: string,
): Promise<Commit> {
  console.log(`Getting commit details for commit '${sha} in repository '${repository.name}''`)
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
          if (f.additions == 0 && f.deletions == 0) return;

          // Get file extensions
          let fileNameAndExtension: Array<string> = ["unknown"]
          if (f.filename != undefined) {
            fileNameAndExtension = f.filename.split(".");
            if (fileNameAndExtension.length == 1) return;
          }

          // Grab the extension from the filename + extension list
          const fileExtension = fileNameAndExtension.pop();
          if (fileExtension == undefined) return;

          // Ignore exe, bin and json files, because they are often massive and contain no real code
          if (
            fileExtension == "exe" ||
            fileExtension == "bin" ||
            fileExtension == "json" ||
            fileExtension == "sum" ||
            fileExtension == "mod"
          ) return;

          // Get programming language using extension
          if (langMap[fileExtension] == undefined) {
            console.log(fileExtension + " is not in the lang map");
            return;
          }
          const language = langMap[fileExtension!][0];

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

        resolve({
          sha: sha,
          additions: data.stats.additions,
          deletions: data.stats.deletions,
          date: data.commit.author.date,
          message: data.commit.message,
          statsPerLanguage: statsPerLanguage,
          htmlURL: data.html_url,
          totalChanges: data.stats.additions + data.stats.deletions,
          filesChanged: updatedFiles.length,
        });
      });
  });
}
