import type { Octokit } from "octokit";
import type Repository from "./models/repository";

export default function getAllRepoComments(client: Octokit, user: string, repo: Repository) {
    client.rest.issues.listCommentsForRepo({
      owner: repo.owner,
      repo: repo.name,
    }).then((result: any) => {
      console.log(result)
    })
}