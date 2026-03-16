import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialDraft = {
  title: "",
  content: "",
  tag: "Todo",
};

interface NoteDraftState {
  draft: typeof initialDraft;
  setDraft: (partial: Partial<typeof initialDraft>) => void;
  clearDraft: () => void;
}

export const useNoteStore = create<NoteDraftState>()(
  persist(
    (set) => ({
      draft: initialDraft,

      setDraft: (partial) =>
        set((state) => ({
          draft: { ...state.draft, ...partial },
        })),

      clearDraft: () => set({ draft: initialDraft }),
    }),
    {
      name: "note-draft", 
    }
  )
);

export { initialDraft };
