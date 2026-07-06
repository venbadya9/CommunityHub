export interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isJoined: boolean;
}

export interface Post {
  id: string;
  title: string;
  body: string;
}

export interface PaginatedResult<T> {
  data: T[];
  nextPage: number | null;
}
