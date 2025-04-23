# aiguana changelogs

I built this application to be triggered with github actions. The action takes a pull request (if the base is either master or develop) title (formatted as: &lt;type&gt;(&lt;tag(s)&gt;(! for possible breaking change: &lt;title&gt;) and description as input and generates tags, a more user-friendly description and title, in addition to checking if its a breaking change, which then gets published to the website.

Publishing a changelog for every single PR isn't really necessary though and I had originally wanted to use the AI to generate the logs, save them, and then upon a release process of some sort, review all of them and create one final changelog to publish. Additionally, I wanted to and should have had the AI use the git diff as context... and as I write this I realize i could've because it still would've been super cheap.. but I said I'd get this in by Tuesday and its past midnight. On the plus side, without using git diff as context, I can write an incredibly long PR description for the demo video with essentially a blank commit.

Heroku was used for the backend and the frontend was hosted on Firebase. Mainly because I'd used them both before and was going to be trying other new things (github actions, docker deployments, etc) in building this app and didn't want to think about it too much. I deployed prod and dev environments (https://aiguana-log.web.app/ and https://aiguana-log-dev.web.app/) for fun and practice to have it model a real-world app.

Backend deployment is handled with Docker, with the image being built in the CI/CD pipeline to bypass build context issues related to the monorepo. The monorepo was originally chosen to share TS types but due to persistent build failures, I abandoned that in the essence of time and types were duplicated. I went with Fastify over Express because I'd never used it and wanted to try it.

# What I would do if I had more time:

- as mentioned above, use Git diff as context and release one changelog after multiple PRs
- add eval and tracing via Weave
- filter on tags or breaking changes in the UI
- made it model agnostic, currently only works with OpenAI

# How to run the app:

### Long way:

1. git clone git@github.com:astom15/aiguana-log.git
2. node v20.12.2
3. npm install -g pnpm
4. install mongodb and create a cluster on mongodb atlas
5. get an openai api key
6. pnpm install from the root
7. Set up backend:
   - navigate to apps/api/.env
   - cp .env.example .env
   - PORT=3001
   - CORS_ORIGIN=http://localhost:3000
   - MONGODB_URI: mongodb connection string
   - MONGODB_DB_NAME: local db name
   - OPENAI_API_KEY
8. Set up frontend:
   - cd apps/web
   - cp .env.example .env.local
   - NEXT_PUBLIC_API_URL: http://localhost:3001/api
9. pnpm dev from root

### Short way:

1. git clone git@github.com:astom15/aiguana-log.git
2. git checkout -b `<new-branch>`
3. make a non-breaking random git commit
4. create a pr to merge into develop or master.
   - write whatever you want in the description.
   - title formatted as : &lt;type&gt;(&lt;tag(s)&gt;)(! for possible breaking change): &lt;title&gt;
   - EX: feat(ui, api)!: updated changelog entry type
5. merge!
6. if you merged onto master, check https://aiguana-log.web.app/ for the new changelog
7. and if you merged onto develop, check https://aiguana-log-dev.web.app/ for the new changelog
