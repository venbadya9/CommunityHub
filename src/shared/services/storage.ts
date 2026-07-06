import { createMMKV } from "react-native-mmkv";

export const appStorage = createMMKV({
  id: "app-local-storage",
});

export const zustandMMKVStorage = {
  setItem: (name: string, value: string) => appStorage.set(name, value),
  getItem: (name: string) => appStorage.getString(name) ?? null,
  removeItem: (name: string) => appStorage.remove(name),
};
