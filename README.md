# Your Year In Code
<img src="img/banner.png"/>
Your year in code is a web app that shows you fun and interesting analytics based on your Github contributions over the past year.

## Running Locally
If you want to run the application locally, follow these steps:
1. Make sure you have [yarn](https://classic.yarnpkg.com/en/) installed
2. Clone or fork this repository
3. Add the following line to the `/etc/hosts` file: `::1 local.youryearincode.com` (this makes `local.youryearincode.com` point to localhost)
4. Create a new Github OAuth app by going to your Settings > Developer settings > OAuth Apps > New OAuth App
   1. Set the redirect URL to `local.youryearincode.com:5173/auth`, this will make Github redirect to that URL after the user has logged in
5. Copy the client ID and secret to some place safe
6. Replace the `githubClientID` value at `src/routes/+page.svelte:78` with your new client ID value
7. Comment out the `url` variable at `src/lib/github/exchange_github_oauth_token_for_access_token.ts:8` and uncomment lines 10 to 12
8. Set your `githubClientID` and `githubClientSecret` values
9. Start the app by running `yarn dev`, and navigate to `local.youryearincode.com:5173`
10. Use the app as normal, and enjoy!
