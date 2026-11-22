# LinkedIn Growth OS

Next.js 15 + Supabase + OpenAI + n8n: a private, approval-first LinkedIn content studio.

## Features
- Magic-link authentication for existing invited users only
- Save topics, generate original AI drafts grounded in approved experience facts
- Edit, approve exact versions, schedule and cancel posts
- Atomic Supabase publishing claims and mock publishing by default
- Manual performance-metrics API and analytics page
- Two importable n8n workflows (daily drafting, five-minute publishing)

## Setup

1. Create an existing authorized user in Supabase Auth and disable open public signup.
2. Clone the repository and install Node.js 22+ and dependencies: \`npm install\`.
3. Copy \`.env.example\` to \`.env.local\`. Fill in the Supabase publishable key and **server-only** credentials. Never commit secrets.
4. Database is already provisioned in project \`xpgskbmjfeuygzcigcxh\`. For another project, apply both migrations in \`supabase/migrations\` in order.
5. In Supabase Auth, enable email magic links and allow \`http://localhost:3000/auth/callback\` as a redirect URL. Add your deployed callback URL later.
6. Run \`npm run dev\` and open \`http://localhost:3000/login\`.
7. Save an idea, generate a draft, edit, approve it, schedule it, and run a **mock** worker check.

## Worker

Set \`OWNER_USER_ID\` to your authorized Supabase Auth user UUID and \`WORKER_SECRET\` to a long random secret.

\`\`\`bash
curl -X POST http://localhost:3000/api/worker/research -H "Authorization: Bearer YOUR_WORKER_SECRET"
curl -X POST http://localhost:3000/api/worker -H "Authorization: Bearer YOUR_WORKER_SECRET"
\`\`\`

The publisher processes only posts with approved current versions and due scheduling timestamps. It does not retry unknown deliveries automatically.

## n8n

Import \`n8n/daily-draft.json\` and \`n8n/scheduled-publisher.json\`. Set \`GROWTH_OS_URL\` and \`GROWTH_OS_WORKER_SECRET\` securely in your n8n environment (or supported credential mechanism). Set timezone to Asia/Kolkata; manually test before enabling workflows.

## Deployment

Deploy to Vercel using Next.js. Add environment variables as server-only except \`NEXT_PUBLIC_SUPABASE_URL\` and \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`. Add the HTTPS callback URL to Supabase Auth. Deploy a secured n8n instance and import the two workflows.

Live LinkedIn publishing is **opt-in** by changing PUBLISH_MODE to live after legitimate API access and OAuth configuration. This MVP does not include token refresh UI or member analytics API integration; do not use scraping or browser-cookie automation.

## Known limitations

RSS research, automated fact verification, LinkedIn OAuth management, and automatic member analytics are phase-two items. Daily drafting uses the **user's idea backlog**, not invented news. The UI is a working MVP, not a finished growth dashboard. Review the auth, publishing and monitoring configuration before going live.
