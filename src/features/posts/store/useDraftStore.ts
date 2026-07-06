import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandMMKVStorage } from "../../../shared/services/storage";

interface Draft {
  readonly title: string;
  readonly body: string;
}

interface DraftState {
  drafts: Record<string, Draft>;
  actions: {
    saveDraft: (communityId: string, title: string, body: string) => void;
    clearDraft: (communityId: string) => void;
  };
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      drafts: {},
      actions: {
        saveDraft: (communityId, title, body) =>
          set((state) => ({
            drafts: { ...state.drafts, [communityId]: { title, body } },
          })),
        clearDraft: (communityId) =>
          set((state) => {
            const updated = { ...state.drafts };
            delete updated[communityId];
            return { drafts: updated };
          }),
      },
    }),
    {
      name: "posts-drafts",
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (state) => ({ drafts: state.drafts }),
    },
  ),
);

export const useDrafts = () => useDraftStore((state) => state.drafts);
export const useDraftActions = () => useDraftStore((state) => state.actions);
