# Project management dashboard

Standalone `dashboard.html` is a browser-only demonstration. Jira usage classifications and linked responsibilities describe experience; synthetic task dates, owners and metrics are not historical results. No Jira API connection is made.

CSV: UTF-8, up to 1 MiB and 5,000 records. Required columns (any order): `id,project,group,title,owner,status,start,due`. All values required, at most 300 characters each. IDs must be unique within the uploaded dataset. Status: todo, doing, done, blocked. Dates: real YYYY-MM-DD dates; start must not exceed due. Project names must match the selected tab. The provided demo download supplies exact names.

Each successful upload replaces only the current tab's in-memory dataset. Any invalid record rejects the entire upload and preserves existing data. Files are never transmitted or persisted. Reload restores demo data.

Completion is done/total (task count, not effort weighting). Overdue means unfinished with due before the selected reference date. Risk candidates are unfinished blocked, overdue or due within 7 calendar days; overlapping reasons count as one task. These are review rules, not a professional risk rating. Schedule lists earliest 8 unfinished tasks; risk list shows at most 8, task table at most 200. Aggregates always include all filtered records.

Build: `node scripts/build-pages.cjs`; verify: `node scripts/verify-pages.cjs`, `node scripts/verify-bi.cjs`. Dashboard UI tests also exercised 4 viewport widths, CSV validation, tabs and retained data on errors.
