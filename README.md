# Community Hub
A mobile app for browsing communities, joining them, and creating posts inside them. Built with React Native (Expo) and TypeScript, with a feature-based structure and a focus on offline-first behavior and optimistic UI.

## Test Credentials
- **Email:** test@demo.com
- **Password:** password123

## Getting Started
### Requirements
- Node 18+
- npm
- Expo Go (on a physical device) or an iOS/Android simulator

### Run the app
```bash
npm install
npx expo start
```
**Note:** For testing offline scenarios (network loss, queued actions, syncing), it's recommended to use a physical device, as network changes are more reliable than on a simulator.

## Project Structure

The codebase is organized by feature rather than technical layers, so each domain owns everything it needs.

```text
src/
  api/            shared React Query setup
  features/
    auth/         login flow + session store + mocked auth
    communities/  list/detail screens + join/leave logic
    posts/        create post flow + draft handling
  navigation/     app routing (auth vs main flow)
  shared/         reusable UI, hooks, storage, utils, theme
  types/          shared TypeScript models
```

## State Management Approach
Two tools, each used where it makes the most sense.

### React Query
- Communities list and details
- Posts
- Caching, retries, background updates, and pagination

### Zustand + MMKV
- Authentication session
- Post drafts
State is persisted using MMKV (instead of AsyncStorage) for fast synchronous reads and writes, with Zustand's persist middleware handling hydration.

## Data Layer & Offline Approach
There’s no real backend in this project. Instead, a local mock API simulates persistence using MMKV, seeded from a JSON file on first launch.

### Offline Strategy
Since everything is local, offline support is split into two simple rules.

#### Reads
Once data is cached, it’s always available. Even without network connectivity, the app serves the last known state instead of failing. Pagination is only available when online since there’s no additional local dataset to page through.

#### Writes
Mutations are handled more carefully:
- **Online** → Execute immediately
- **Offline** → Queue the action and apply optimistic updates

Queued actions include:
- Join / Leave community
- Create post

When connectivity is restored, the queue is processed in order. If something fails mid-way, processing stops to avoid inconsistent state (for example, applying later joins before earlier ones succeed).
Network status is tracked centrally through a NetworkProvider, combining:
- NetInfo updates
- AppState transitions (foreground/background)

## Optimistic UI
The app is designed to feel instant, even when operations are technically asynchronous.

### Join / Leave
- Updates both list and detail caches immediately
- Keeps state consistent across screens
- Rolls back cleanly if something fails during sync

### Create Post
- Inserts a temporary post instantly into the feed
- Restores the previous state if the request fails
- If created offline, the post remains locally until it's successfully synced

## Drafts
Post drafts are persisted per community.
If the app is closed or crashes, reopening the create post screen restores the draft automatically. It’s intentionally simple but makes the writing experience much more reliable.

## Trade-offs & What I would improve
- The mock API simulates latency but not failures. Adding failure scenarios would make offline and retry logic more realistic.
- The offline queue is currently a simple array. For a larger application, I'd replace it with a proper pattern.
- There are no tests yet. The hooks and API layer would be the best place to begin.
- Pagination is currently in-memory and offset-based. A real API would likely use cursor-based pagination.

## What I would add next
- A proper offline outbox with typed actions, retries, and persistence
- Unit tests for the API layer and mutation hooks
- Better API simulation with failures and retry scenarios
- Cursor-based pagination instead of offset-based pagination
