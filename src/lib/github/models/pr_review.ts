

type PRReview = {
  by_authenticated_user: boolean, // Whether this review was made by the authenticated user
  state: string, // State of the review. One of: APPROVED, CHANGES_REQUESTED
  URL: string, // URL to this review on Github
  body: string
}

export default PRReview;