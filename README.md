# Appractic - Social Media Post Scheduler

A modern social media post scheduler built with Next.js, Supabase, and Clerk.

## Features

- Schedule posts across multiple social media platforms
- Media upload and management
- User authentication and authorization
- Real-time analytics and insights
- Tag-based post organization

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **Media Storage**: Local storage (configurable for cloud storage)
- **Deployment**: Render

## Prerequisites

- Node.js 18 or later
- npm or yarn
- Supabase account
- Clerk account
- Social media platform developer accounts (for the platforms you want to support)

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Required environment variables:
- `NEXT_PUBLIC_APP_URL`: Your application URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- `CLERK_SECRET_KEY`: Clerk secret key
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Render

1. Fork or clone this repository to your GitHub account.

2. Create a new Web Service on Render:
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Choose the repository and branch

3. Configure the Web Service:
   - **Name**: Choose a name for your service
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Choose appropriate plan (Start with starter)

4. Add Environment Variables:
   - Click on "Environment" tab
   - Add all required environment variables from `.env.example`
   - Make sure to use production values

5. Deploy:
   - Click "Create Web Service"
   - Wait for the initial deployment to complete

6. Configure Domain (Optional):
   - Go to service settings
   - Under "Custom Domains", add your domain
   - Follow DNS configuration instructions

## Database Setup

The application uses Supabase for the database. The schema migrations are located in `supabase/migrations/`. To set up the database:

1. Create a new Supabase project

2. Run the migrations:
   - Install Supabase CLI
   - Link your project: `supabase link --project-ref your-project-ref`
   - Apply migrations: `supabase db push`

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature-name`
3. Make your changes
4. Push to your fork and submit a pull request

## License

MIT License - see LICENSE file for details
