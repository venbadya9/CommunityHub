interface NetworkStateLike {
  isConnected: boolean | null;
}

export const isOnline = (state: NetworkStateLike): boolean =>
  state.isConnected !== false;
