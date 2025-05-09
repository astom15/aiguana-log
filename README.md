# aiguana changelogs

I built this application to be triggered with Github Actions. The action takes a pull request (if the base is either master or develop) title (formatted as: &lt;type&gt;(&lt;tag(s)&gt;(! for possible breaking change: &lt;title&gt;) and description as input and generates tags, a more user-friendly description and title, checks if its a breaking change, which then gets published to the website. The format is sort of brittle but I think its useful having a standardized PR title format.

Publishing a changelog for every single PR isn't really necessary though and I had originally wanted to use the AI to generate the logs, save them, and then upon a release process of some sort, review all of them and create one final changelog to publish. Additionally, I wanted to and should have had the AI use the git diff as context... and as I write this I realize i could've because it still would've been super cheap..I'll update it later. On the plus side, without using git diff as context, I can write an incredibly long PR description for the demo video with essentially a blank commit.

Heroku was used for the backend and the frontend was hosted on Firebase. Mainly because I'd used them both before and was going to be trying other new things (github actions, docker deployments, etc) in building this app and didn't want to think about it too much. I deployed prod and dev environments for fun and practice.

Backend deployment is handled with Docker, with the image being built in the CI/CD pipeline to bypass build context issues related to the monorepo. The monorepo was originally chosen to share TS types but due to persistent build failures, I abandoned that in the essence of time and types were duplicated. I went with Fastify over Express because I'd never used it and wanted to try it.

Also, I used Gemini and sometimes Cursor if it was something minor I had a quick question about. Gemini was used a lot to learn about setting up Github Actions and Docker although it did gaslight me a few times. Guess thats on me though for not always asking explicitly enough.

# What I would do if I had more time:

- as mentioned above, use Git diff as context and release one changelog after multiple PRs
- add eval and tracing via Weave
- filter on tags or breaking changes in the UI
- home page has cards with short summaries, clicking on a card takes you to the full description. would've been better with more context.
- made it model agnostic, currently only works with OpenAI

