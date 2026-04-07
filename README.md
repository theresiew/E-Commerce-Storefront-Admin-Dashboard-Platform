# NovaCart Commerce Platform

NovaCart is a production-style TypeScript + React frontend for an e-commerce storefront and admin dashboard. It combines a customer shopping experience with a protected admin workspace for products, categories, and orders while connecting to the provided Railway backend API.

This frontend is configured to use the Railway API at `https://e-commas-apis-production.up.railway.app/api`.

## Features

- Public storefront with product catalog, category filtering, search, and product details
- Client-side authentication with React Context and role-based protected routes
- Static admin bypass using the assignment credentials
- Shopper registration and login flow with API-first requests and local fallback persistence
- Persistent shopping cart with local storage support and remote cart sync hooks
- Multi-step checkout with React Hook Form and Zod validation
- Admin dashboard for product CRUD, category management, and order status updates
- TanStack Query caching and invalidation for products, categories, and orders
- Responsive Tailwind UI built for mobile, tablet, and desktop
- TypeScript-driven page and component layer for safer frontend development

## Role Access Summary

- Guests can browse products and product details
- Shoppers can register, log in, manage cart state, complete checkout, and view personal orders
- Admins can access the dashboard, manage products, manage categories, and update order statuses

## Admin Mock Login

- Email: `admin@admin.com`
- Password: `admin123`

## Tech Stack

- React + Vite
- TypeScript
- Tailwind CSS
- React Router
- Axios `1.14.0`
- TanStack Query
- React Hook Form
- Zod
- React Hot Toast

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env
```

3. Set your backend base URL in `.env`:

```env
VITE_API_BASE_URL=https://e-commas-apis-production.up.railway.app/api
```

4. Start the development server:

```bash
npm run dev
```

5. Run type-checking:

```bash
npm run typecheck
```

6. Build for production:

```bash
npm run build
```

## Routing for Deployment

- `public/_redirects` is included for Netlify SPA routing
- `vercel.json` is included for Vercel SPA rewrites

## Suggested Deployment Flow

1. Push the project to GitHub
2. Import the repository into Vercel, Netlify, or Render
3. Add `VITE_API_BASE_URL` in the hosting platform environment variables
4. Trigger a production deployment and verify direct route refreshes on `/admin`, `/profile`, and `/products/:id`

## Notes

- The app is aligned to the Railway Swagger route families: `/public`, `/auth`, `/admin`, and `/categories`.
- The provided assignment admin mock login can still open the admin UI, but real admin API actions require a backend-issued admin JWT from the Railway API.
- The frontend uses assignment-aligned statuses: `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, and `CANCELLED`.
