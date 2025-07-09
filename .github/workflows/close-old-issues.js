const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const owner = process.env.REPO_OWNER;
const repo = process.env.REPO_NAME.split('/').pop(); // Handles owner/repo format

const now = new Date();
// const sixMonthsAgo = new Date(now);
// sixMonthsAgo.setMonth(now.getMonth() - 6);
// const oneMonthAgo = new Date(now);
// oneMonthAgo.setMonth(now.getMonth() - 1);

// For debugging we do the smae with minutes.
const sixMinutesAgo = new Date(now);
sixMinutesAgo.setMinutes(now.getMinutes() - 6);
const oneMinuteAgo = new Date(now);
oneMinuteAgo.setMinutes(now.getMinutes() - 1);

async function closeOldIssues() {
  let page = 1;
  let closedCount = 0;

  while (true) {
    const { data: issues } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: "open",
      per_page: 100,
      page,
    });

    if (issues.length === 0) break;

    for (const issue of issues) {
      // Ignore PRs
      if (issue.pull_request) continue;

      const createdAt = new Date(issue.created_at);
      const updatedAt = new Date(issue.updated_at);

//      if (createdAt < sixMonthsAgo && updatedAt < oneMonthAgo) {
        if (createdAt < sixMinutesAgo && updatedAt < oneMinuteAgo) {

        await octokit.issues.update({
          owner,
          repo,
          issue_number: issue.number,
          state: "closed",
          comment: "Closing this issue as it has been inactive for a while.",
        });
        closedCount++;
        console.log(`Closed issue #${issue.number}`);
      }
    }
    page++;
  }
  console.log(`Total closed: ${closedCount}`);
}

closeOldIssues().catch(console.error);
