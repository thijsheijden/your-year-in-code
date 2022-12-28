import type { Octokit } from "octokit";
import type User from "./models/user"

// getCurrentUser gets details about the currently authenticated user
export default async function getCurrentUser(client: Octokit): Promise<User> {
  return new Promise<User>((resolve, reject) => {
    console.log('Getting authenticated user')
    client.rest.users.getAuthenticated().then((response: any) => {
      const { data } = response;
      resolve({
        username: data.login,
        id: data.id,
        node_id: data.node_id,
        imgURL: data.avatar_url,
      });
    });
  });
}