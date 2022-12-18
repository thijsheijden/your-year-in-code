// exchangeGithubOAuthTokenForAccessToken exchanges the token received through the OAuth process for an 
// actual Github access token
export default function exchangeGithubOAuthTokenForAccessToken(
  oauthToken: string
): Promise<string> {
  // Make a POST request to Github with the Oauth code to get an acccess token
  return new Promise((resolve, reject) => {
    fetch(
      "https://github.com/login/oauth/access_token?client_id=961ecc55299958adb91f&client_secret=db0b66afe189712f5cd53875cba93e1890a980b5&code=" +
      oauthToken,
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
