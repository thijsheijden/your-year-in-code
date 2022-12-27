// exchangeGithubOAuthTokenForAccessToken exchanges the token received through the OAuth process for an 
// actual Github access token
export default function exchangeGithubOAuthTokenForAccessToken(
  oauthToken: string
): Promise<string> {
  // Make a POST request to Github with the Oauth code to get an acccess token
  return new Promise((resolve, reject) => {
    let url = "https://api.youryearincode.com/oauth?code=" + oauthToken;

    // let githubClientID = "";
    // let githubClientSecret = "";
    // let url = `https://github.com/login/oauth/access_token?client_id=${githubClientID}&client_secret=${githubClientSecret}&code=${oauthToken}`
    fetch(
      url,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      }
    )
      .then((response: Response) => {
        if (!response.ok) {
          reject(response.statusText);
        }
        return response.json();
      })
      .then((json: any) => {
        resolve(json.access_token);
      });
  });
}
