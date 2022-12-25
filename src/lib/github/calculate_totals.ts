import type Commit from "./models/commits";
import type FullStats from "./models/full_stats";
import type Repository from "./models/repository";
import type Stats from "./models/stats";

// calculateTotals calculates statistics over the total commits
export default function calculateTotals(repos: Array<Repository>): FullStats {
  let fullStats: FullStats = {
    allReposWorkedIn: [],
    totalCommits: 0,
    totalAdditions: 0,
    totalDeletions: 0,
    totalAdditionsAndDeletionsPerLanguage: {},
    numberOfLanguagesUsed: 0,
    mostLovedLanguage: "",
    mostLovedLanguageStats: {
      additions: 0,
      deletions: 0,
    },
    leastLovedLanguage: "",
    leastLovedLanguageStats: {
      additions: 0,
      deletions: 0,
    },
    mostAdditionsInDay: 0,
    mostDeletionsInDay: 0,
    mostCommitsInDay: 0,
    dateWithMostAdditions: "",
    dateWithMostDeletions: "",
    dateWithMostCommits: "",
    perDay: {},
    datesRepoWasActive: {},
    languageStatsPerRepo: {},
    totalPRsOpened: 0,
    totalPRsMerged: 0,
    totalPRChanges: 0,
    totalPRsReviewed: 0,
    totalPRChangesReviewed: 0,
  };

  // Populate the perDay data with every date in the past year
  let yearAgo = new Date();
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);

  for (
    let i = new Date();
    i >= yearAgo;
    i.setTime(i.getTime() - 24 * 3600 * 1000)
  ) {
    const d = i.toISOString().split("T")[0];
    fullStats.perDay[d] = {
      additions: 0,
      deletions: 0,
      commits: 0,
      perLanguage: {},
      reposWorkedIn: new Set<string>(),
      PRsCreated: 0,
      PRsMerged: 0,
      PRsReviewed: 0,
      commentsWritten: 0,
    };
  }

  const reposWorkedIn: Set<string> = new Set<string>();

  let [PRsOpened, PRsMerged, PRsApproved] = [0, 0, 0];

  // Go over all repos and calculate totals
  repos.forEach((r) => {
    fullStats.totalCommits += r.totalCommits ?? 0;
    fullStats.totalAdditions += r.totalAdditions ?? 0;
    fullStats.totalDeletions += r.totalDeletions ?? 0;
    fullStats.totalPRsOpened += r.totalPRsOpened;
    fullStats.totalPRsMerged += r.totalPRsMerged;
    fullStats.totalPRChanges += r.totalMergedPRChanges;
    fullStats.totalPRsReviewed += r.totalPRsReviewed;
    fullStats.totalPRChangesReviewed += r.totalReviewedPRChanges;

    // Set dates this repo was active
    fullStats.datesRepoWasActive[r.name] = r.activeDates ?? [];

    // Set the language stats for this repo
    fullStats.languageStatsPerRepo[r.name] =
      r.totalAdditionsAndDeletionsPerLanguage!;

    // Check if this repository has the longest or shortest commit messages
    if (r.commitWithLongestMessage) {
      if (
        r.commitWithLongestMessage.message.length >
        (fullStats.commitWithLongestMessage?.message.length ?? 0)
      ) {
        fullStats.commitWithLongestMessage = r.commitWithLongestMessage;
      }
    }
    if (r.commitWithShortestMessage) {
      if (
        r.commitWithShortestMessage.message.length <
          (fullStats.commitWithShortestMessage?.message.length ?? 0) ||
        fullStats.commitWithShortestMessage == undefined
      ) {
        fullStats.commitWithShortestMessage = r.commitWithShortestMessage;
      }
    }

    // Check if this repository contains a highlight PR
    // Opened PRs
    if (
      r.largestPROpened &&
      r.largestPROpened.total_changes >
        (fullStats.largestPROpened?.total_changes ?? Number.MIN_SAFE_INTEGER)
    ) {
      fullStats.largestPROpened = r.largestPROpened;
    }
    if (
      r.smallestPROpened &&
      r.smallestPROpened.total_changes <
        (fullStats.smallestPROpened?.total_changes ?? Number.MAX_SAFE_INTEGER)
    ) {
      fullStats.smallestPROpened = r.smallestPROpened;
    }

    // Merged PRs
    if (
      r.largestPRMerged &&
      r.largestPRMerged.total_changes >
        (fullStats.largestPRMerged?.total_changes ?? Number.MIN_SAFE_INTEGER)
    ) {
      fullStats.largestPRMerged = r.largestPRMerged;
    }
    if (
      r.smallestPRMerged &&
      r.smallestPRMerged.total_changes <
        (fullStats.smallestPRMerged?.total_changes ?? Number.MAX_SAFE_INTEGER)
    ) {
      fullStats.smallestPRMerged = r.smallestPRMerged;
    }

    // Reviewed PRs
    if (
      r.largestPRReviewed &&
      r.largestPRReviewed.total_changes >
        (fullStats.largestPRReviewed?.total_changes ?? Number.MIN_SAFE_INTEGER)
    ) {
      fullStats.largestPRReviewed = r.largestPRReviewed;
    }
    if (
      r.smallestPRReviewed &&
      r.smallestPRReviewed.total_changes <
        (fullStats.smallestPRReviewed?.total_changes ?? Number.MAX_SAFE_INTEGER)
    ) {
      fullStats.smallestPRReviewed = r.smallestPRReviewed;
    }

    // PR reviews
    if (
      r.longestReviewLeft &&
      r.longestReviewLeft.body.length >
        (fullStats.longestReviewLeft?.body.length ?? Number.MIN_SAFE_INTEGER)
    ) {
      fullStats.longestReviewLeft = r.longestReviewLeft;
      fullStats.PRWithLongestReview = r.PRWithLongestReview;
    }
    if (
      r.shortestReviewLeft &&
      r.shortestReviewLeft.body.length <
        (fullStats.shortestReviewLeft?.body.length ?? Number.MAX_SAFE_INTEGER)
    ) {
      fullStats.shortestReviewLeft = r.shortestReviewLeft;
      fullStats.PRWithShortestReview = r.PRWithShortestReview;
    }

    PRsOpened += r.totalPRsOpened;
    PRsMerged += r.totalPRsMerged;
    PRsApproved += r.PRsApproved;

    // Check if this repository contains the largest, smallest and most files changed commits
    // Largest commit
    if (
      r.largestCommit &&
      r.largestCommit.totalChanges >
        (fullStats.largestCommit?.totalChanges ?? Number.MIN_SAFE_INTEGER)
    ) {
      fullStats.largestCommit = r.largestCommit;
    }
    // Smallest commit
    if (
      r.smallestCommit &&
      r.smallestCommit.totalChanges <
        (fullStats.smallestCommit?.totalChanges ?? Number.MAX_SAFE_INTEGER)
    ) {
      fullStats.smallestCommit = r.smallestCommit;
    }
    // Most files changed commit
    if (
      r.commitWithMostFilesChanged &&
      r.commitWithMostFilesChanged.filesChanged >
        (fullStats.commitWithMostFilesChanged?.filesChanged ??
          Number.MIN_SAFE_INTEGER)
    ) {
      fullStats.commitWithMostFilesChanged = r.commitWithMostFilesChanged;
    }

    // Update all language stats
    for (let lang in r.totalAdditionsAndDeletionsPerLanguage) {
      if (fullStats.totalAdditionsAndDeletionsPerLanguage[lang]) {
        fullStats.totalAdditionsAndDeletionsPerLanguage[lang].additions +=
          r.totalAdditionsAndDeletionsPerLanguage[lang].additions;
        fullStats.totalAdditionsAndDeletionsPerLanguage[lang].deletions +=
          r.totalAdditionsAndDeletionsPerLanguage[lang].deletions;
        fullStats.totalAdditionsAndDeletionsPerLanguage[lang].commits! +=
          r.totalAdditionsAndDeletionsPerLanguage[lang].commits!;
      } else {
        fullStats.totalAdditionsAndDeletionsPerLanguage[lang] = {
          additions: r.totalAdditionsAndDeletionsPerLanguage[lang].additions,
          deletions: r.totalAdditionsAndDeletionsPerLanguage[lang].deletions,
          commits: r.totalAdditionsAndDeletionsPerLanguage[lang].commits,
        };
      }
    }

    // Update the day-by-day stats
    for (let date in r.statsPerDate) {
      const repoDayStats = r.statsPerDate[date];
      const fullDayStats = fullStats.perDay[date];
      fullDayStats.commits! += repoDayStats.commits ?? 0;
      fullDayStats.additions! += repoDayStats.additions ?? 0;
      fullDayStats.deletions! += repoDayStats.deletions ?? 0;
      fullDayStats.PRsCreated! += repoDayStats.PRsCreated ?? 0;
      fullDayStats.PRsMerged! += repoDayStats.PRsMerged ?? 0;
      fullDayStats.PRsReviewed! += repoDayStats.PRsReviewed ?? 0;
      fullDayStats.reposWorkedIn!.add(r.name);
      reposWorkedIn.add(r.name);

      for (let lang in repoDayStats.perLanguage) {
        if (fullDayStats.perLanguage) {
          fullDayStats.perLanguage[lang] = repoDayStats.perLanguage[lang];
        }
      }
    }
  });

  // Calculate true global maximum additions, deletions, commits etc based on the day-by-day info
  for (let date in fullStats.perDay) {
    const d = fullStats.perDay[date];
    if (d.additions && d.additions > fullStats.mostAdditionsInDay) {
      fullStats.mostAdditionsInDay = d.additions;
      fullStats.dateWithMostAdditions = date;
    }

    if (d.deletions && d.deletions > fullStats.mostDeletionsInDay) {
      fullStats.mostDeletionsInDay = d.deletions;
      fullStats.dateWithMostDeletions = date;
    }

    if (d.commits && d.commits > fullStats.mostCommitsInDay) {
      fullStats.mostCommitsInDay = d.commits;
      fullStats.dateWithMostCommits = date;
    }
  }

  // PR ratios
  fullStats.PRApprovalRatio =
    Math.round((PRsApproved / PRsOpened) * 10000) / 100;
  fullStats.PRMergeRatio = Math.round((PRsMerged / PRsOpened) * 10000) / 100;

  // Calculate number of languages used
  fullStats.numberOfLanguagesUsed = Object.keys(
    fullStats.totalAdditionsAndDeletionsPerLanguage
  ).length;

  // Get most loved, and least loved languages
  let mostLovedLang: string, leastLovedLang: string;
  let mostLangChanges: number = 0,
    leastLangChanges: number = Number.MAX_SAFE_INTEGER;
  for (let lang in fullStats.totalAdditionsAndDeletionsPerLanguage) {
    let langStats = fullStats.totalAdditionsAndDeletionsPerLanguage[lang];

    if (langStats.additions + langStats.deletions > mostLangChanges) {
      mostLovedLang = lang;
      mostLangChanges = langStats.additions + langStats.deletions;
    }

    if (langStats.additions + langStats.deletions < leastLangChanges) {
      leastLovedLang = lang;
      leastLangChanges = langStats.additions + langStats.deletions;
    }
  }
  fullStats.mostLovedLanguage = mostLovedLang!;
  fullStats.mostLovedLanguageStats =
    fullStats.totalAdditionsAndDeletionsPerLanguage[mostLovedLang!];
  fullStats.leastLovedLanguage = leastLovedLang!;
  fullStats.leastLovedLanguageStats =
    fullStats.totalAdditionsAndDeletionsPerLanguage[leastLovedLang!];

  fullStats.allReposWorkedIn = Array.from(reposWorkedIn);

  return fullStats;
}
