<main>
  <div id="card">
    <div id="card_content">
      <div id="heading">
        <h1 id="card_title">How it works</h1>
      </div>
      <p>
        This website shows you some statistics about your Github contributions
        over the previous year.
      </p>
      <p>
        It requires you to log in using your Github account. If you want to view
        statistics about private repositories as well, tick the "Private
        repositories" checkbox.
      </p>
      <p>
        When loading statistics for private repositories as well, we require the
        'repo' Github OAuth scope. This scope grants read and write access,
        while we only require read access. The actual code in the repository is
        never accessed, and no data ever leaves your browser. All calculations
        take place in your browser.
      </p>
      <p>
        This project is fully open source, and the source code can be viewed <a
          href="https://github.com/thijsheijden/your-year-in-code">here</a
        >.
      </p>
      <p>
        The only time a request is made to a server other than Github is during
        the retrieval of the access token. This has to be done as that endpoint
        requires this via its CORS headers. Exchange of the received code for an
        access token is done via a reverse proxy, whose code can be found <a
          href="https://github.com/thijsheijden/your-year-in-code-reverse-proxy"
          >here</a
        >.
      </p>
      <p>
        If you have any questions, want more information or have fun suggestions, don't hesitate to contact me <a href="mailto:admin@youryearincode.com">via email</a>.
      </p>
    </div>
  </div>
</main>

<style lang="scss">
  main {
    width: 100vw;
    height: 100vh;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  #card {
    border-radius: 1em;
    border: 1px solid white;

    max-height: 80vh;
    max-width: 50vw;
    overflow: scroll;
  }

  #card::-webkit-scrollbar {
    display: none;
  }

  #card_content {
    padding: 2rem;
  }

  #card_content::-webkit-scrollbar {
    display: none;
  }

  #card_content_heading {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(3, 1fr);
  }

  #heading {
    text-align: center;
  }

  #card_title {
    font-size: 2rem;
  }

  p {
    padding-top: 1rem;
    text-align: center;
  }

  a {
    text-decoration: none;
    color: var(--commit-color);
  }
</style>
