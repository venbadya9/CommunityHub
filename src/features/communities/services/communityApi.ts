import NetInfo from "@react-native-community/netinfo";
import { isOnline } from "../../../shared/hooks/network";
import { appStorage } from "../../../shared/services/storage";
import { Community, PaginatedResult, Post } from "../../../types/models";
import communities from "./communitiesMock.json";

export class NotFoundError extends Error {
  name = "NotFoundError";
}

export class NetworkError extends Error {
  name = "NetworkError";
}

const checkOffline = async () => {
  const net = await NetInfo.fetch();
  return !isOnline(net);
};

const KEYS = {
  COMMUNITIES: "app.cached.communities",
  POSTS: "app.cached.posts",
  SYNC_QUEUE: "app.offline.sync.queue",
  POST_SYNC_QUEUE: "app.offline.post.queue",
} as const;

interface QueuedPost {
  id: string;
  communityId: string;
  title: string;
  body: string;
}

const storage = {
  getCommunities: (): Community[] => {
    const cached = appStorage.getString(KEYS.COMMUNITIES);
    if (!cached) {
      const bootstrap = communities.map((c) => ({
        ...c,
        isJoined: c.isJoined ?? false,
      }));
      appStorage.set(KEYS.COMMUNITIES, JSON.stringify(bootstrap));
      return bootstrap;
    }
    return JSON.parse(cached);
  },

  saveCommunities: (data: Community[]) =>
    appStorage.set(KEYS.COMMUNITIES, JSON.stringify(data)),

  getPosts: (): Record<string, Post[]> => {
    const cached = appStorage.getString(KEYS.POSTS);
    return cached ? JSON.parse(cached) : {};
  },

  savePosts: (data: Record<string, Post[]>) =>
    appStorage.set(KEYS.POSTS, JSON.stringify(data)),

  getSyncQueue: (): string[] => {
    const raw = appStorage.getString(KEYS.SYNC_QUEUE);
    return raw ? JSON.parse(raw) : [];
  },

  saveSyncQueue: (queue: string[]) =>
    appStorage.set(KEYS.SYNC_QUEUE, JSON.stringify(queue)),

  getPostSyncQueue: (): QueuedPost[] => {
    const raw = appStorage.getString(KEYS.POST_SYNC_QUEUE);
    return raw ? JSON.parse(raw) : [];
  },

  savePostSyncQueue: (queue: QueuedPost[]) =>
    appStorage.set(KEYS.POST_SYNC_QUEUE, JSON.stringify(queue)),
};

export const communityApi = {
  // TODO: limit is hardcoded for now - revisit if/when this needs to be
  // configurable per screen size or connection speed.
  getCommunitiesList: async (
    page: number,
    search: string,
    limit = 10,
  ): Promise<PaginatedResult<Community>> => {
    await new Promise((r) => setTimeout(r, 600));

    if (page > 1 && (await checkOffline())) {
      throw new NetworkError("Can't load more while offline");
    }

    const query = search.toLowerCase().trim();
    let all = storage.getCommunities();

    if (query) {
      all = all.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query),
      );
    }

    const offset = (page - 1) * limit;
    const data = all.slice(offset, offset + limit);

    return {
      data,
      nextPage: offset + limit < all.length ? page + 1 : null,
    };
  },

  getCommunityById: async (id: string): Promise<Community> => {
    await new Promise((r) => setTimeout(r, 300));
    const community = storage.getCommunities().find((c) => c.id === id);
    if (!community) throw new NotFoundError(`Community ${id} not found`);
    return { ...community };
  },

  getPostsByCommunityId: async (communityId: string): Promise<Post[]> => {
    await new Promise((r) => setTimeout(r, 400));

    const cached = storage.getPosts();
    if (!cached[communityId] && (await checkOffline())) {
      throw new NetworkError("Posts not available offline");
    }

    const posts = cached[communityId] ?? [];
    if (!cached[communityId]) {
      storage.savePosts({ ...cached, [communityId]: posts });
    }
    return posts;
  },

  toggleJoinState: async (id: string): Promise<Community> => {
    await new Promise((r) => setTimeout(r, 400));

    const list = storage.getCommunities();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) throw new NotFoundError(`Community ${id} not found`);

    const target = list[idx];
    const isNowJoined = !target.isJoined;

    list[idx] = {
      ...target,
      isJoined: isNowJoined,
      memberCount: target.memberCount + (isNowJoined ? 1 : -1),
    };

    storage.saveCommunities(list);
    return list[idx];
  },

  addPostToCommunity: async (
    communityId: string,
    title: string,
    body: string,
  ): Promise<Post | null> => {
    await new Promise((r) => setTimeout(r, 500));

    // id is generated here rather than by a "server" because there is no
    // server - this is the mock persistence layer. Real backend would return
    // its own id and we'd reconcile the temp one on success.
    const newPost: Post = {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      body,
    };

    if (await checkOffline()) {
      communityApi.queueOfflinePost(communityId, newPost);
      return null;
    }

    const allPosts = storage.getPosts();
    allPosts[communityId] = [newPost, ...(allPosts[communityId] ?? [])];
    storage.savePosts(allPosts);

    return newPost;
  },

  queueOfflinePost: (communityId: string, post: Post) => {
    const queue = storage.getPostSyncQueue();
    queue.push({ ...post, communityId });
    storage.savePostSyncQueue(queue);
  },

  queueOfflineAction: (communityId: string) => {
    const queue = storage.getSyncQueue();
    if (!queue.includes(communityId)) {
      queue.push(communityId);
      storage.saveSyncQueue(queue);
    }
  },

  processOfflineQueue: async () => {
    // Queue is processed in order and we bail on the first failure instead
    // of skipping past it - if community A fails to sync we don't want to
    // sync B and C first and end up with an inconsistent join order if the
    // user is looking at the list while this runs.
    const queue = storage.getSyncQueue();
    let success = 0;

    if (queue.length) {
      for (const id of queue) {
        try {
          await communityApi.toggleJoinState(id);
          success++;
        } catch (err) {
          console.warn(`Offline sync failed for ${id}`, err);
          break;
        }
      }
      storage.saveSyncQueue(queue.slice(success));
    }

    const postQueue = storage.getPostSyncQueue();
    if (postQueue.length) {
      const remaining: QueuedPost[] = [];
      for (const queued of postQueue) {
        try {
          const allPosts = storage.getPosts();
          allPosts[queued.communityId] = [
            { id: queued.id, title: queued.title, body: queued.body },
            ...(allPosts[queued.communityId] ?? []),
          ];
          storage.savePosts(allPosts);
          success++;
        } catch (err) {
          console.warn(`Offline post sync failed for ${queued.id}`, err);
          remaining.push(queued);
        }
      }
      storage.savePostSyncQueue(remaining);
    }

    return success;
  },
};
