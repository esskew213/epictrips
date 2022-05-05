
# [EpicTrips](https://epictrips.vercel.app): Get inspiration for your next holiday with crowdsourced itineraries.

## User Problem
There are people who love planning their holidays to the finest detail — it’s such a shame that their meticulous itineraries are scarcely used more than once. Then there are people who love holidays but hate planning, or who simply need some inspiration to get going.

## Proposed Solution
EpicTrips bridges the gap between these two groups of individuals and consolidates holiday inspo in one place. It seeks to provide a free, crowdsourced alternative to paying tour agencies hefty amounts for more personalised, unique travel experiences. It's a platform made by holiday enthusiasts, for holiday enthusiasts. Users can create and share their itineraries with the online community, who can search for trips in their desired destination and category (e.g. hiking, solo, etc.). 

## Tech Stack
As this is my capstone project for General Assembly Singapore's Software Engineering Immersive, I wanted to try learning and applying a new suite of technologies (i.e. not MERN again!). I eventually chose:
- Next.js for my frontend and API routes,
- PostgreSQL, hosted on Supabase, for my database,
- Prisma for my ORM,
- Auth0 for authentication and login functionalities, and
- Tailwind CSS (in Just In Time mode) for styling.

The project is deployed on Vercel.

### Next.js
Next.js offers a lot of flexibility with content / page rendering, and I opted for a combination of server-side rendering (SSR) and client-side rendering (CSR). I decided against static generation (recommended by Next.js for performance reasons) as majority of the pages could __not__ be generated ahead of a user's request, given the expected frequency of data being updated (i.e. whenever new trips are added).

Aside from the fact that SSR is generally speedier than CSR and confers some benefits for SEO, I found Next.js's file-based routing and custom API routes quite intuitive. It was also (relatively) easy to integrate Auth0 with the `@auth0/nextjs-auth0` SDK.

### Prisma
Rather than using Supabase's automatically created API routes, I chose to use Prisma to create my schema and perform CRUD operations. Prisma was also a (relative) joy to use, given the ease of performing joins (via nested queries / writes) and defining relationships between tables. With more time, I would have tried to used their `$transaction` API to ensure the atomicity of operations.

### Tailwind CSS
In my experience, Tailwind is easier to customise than Material UI, although I would still pick the latter if I needed to style a website quickly with standard components (e.g. responsive navbars, modals, etc.). I liked Tailwind's mobile-first approach and found it more intuitive to pick up than Bootstrap.

## Database Schema
The most difficult aspect of the data model to implement proved to be the `DailyPlans`, as they had to be a linked list (users should be able to delete and insert a day at any point in their itinerary, with the dates generated accordingly). Hence the presence of the `predecessor_id` and `successor_id` self-referencing foreign keys.

![project4schema](https://user-images.githubusercontent.com/99468700/166869531-fe2098e3-e536-430d-84af-6366b4a32d00.png)

## API Routes
| Route  | HTTP Verb | Purpose |
| :--- | :--- | :--- |
| `/user` | PUT  | Upsert user |
| `/`  | POST | Search for trips |
| `/trip`  | POST | Create new trip |
| `/trip/[id]`  | GET | Find trip |
| `/trip/[id]`  | DELETE | Delete trip |
| `/trip/[id]`  | PUT | Update trip |
| `/trip/[id]/like`  | POST | Upsert a like |
| `/trip/[id]/publish`  | PUT | Publish (or unpublish) trip |
| `/trip/[id]/dailyplan`  | POST | Add a day to itinerary |
| `/trip/[id]/dailyplan`  | DELETE | Delete a day from itinerary |
| `/trip/[id]/dailyplan`  | GET | Get (and sort) all daily plans |
| `/trip/[id]/dailyplan/update`  | PUT | Save all daily plans |
| `/[uid]`  | PUT | Edit user bio |
| `/[uid]/name`  | PUT | Edit user name |
| `/auth/[...auth0]`  | - | Routes created by `handleAuth()` from the `@auth0/nextjs-auth0` SDK |

## Wireframes
These lo-fi wireframes were done in Excalidraw.

![project4wireframes](https://user-images.githubusercontent.com/99468700/166866763-a9c97160-dc54-44ec-9124-0ecafd0b7b5b.png)
