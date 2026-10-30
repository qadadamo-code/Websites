
## Auto-deploy (no manual uploads)

`npm run dist` (inside `site/`) builds the site and copies it to `/dist`. Commit and push.
On the server, a cPanel cron job runs every 5 minutes:

    php /home/vbkug/web.theplanetco.com/api/deploy.php

It checks the latest commit on the branch, downloads it from GitHub and copies `dist/` over the subdomain folder
(it never touches `api/uploads/`). Log: `api/uploads/deploy.log` (blocked from the web).
