import { useState } from "react";

type EditPanelProps = {
  activeTab: "roulette" | "order" | "amidakuji";
  prizeInputValue: string;
  onPrizeInputChange: (value: string) => void;
  onAddPrizes: () => void;
  prizeItems: string[];
  onRemovePrize: (index: number) => void;
  prizeLimitReached: boolean;
  prizeMessage: string | null;
  inputValue: string;
  onInputChange: (value: string) => void;
  onAddItems: () => void;
  itemMessage: string | null;
  items: string[];
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, value: string) => void;
};

export default function EditPanel({
  activeTab,
  prizeInputValue,
  onPrizeInputChange,
  onAddPrizes,
  prizeItems,
  onRemovePrize,
  prizeLimitReached,
  prizeMessage,
  inputValue,
  onInputChange,
  onAddItems,
  itemMessage,
  items,
  onRemoveItem,
  onUpdateItem,
}: EditPanelProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const startEdit = (index: number, value: string) => {
    setEditingIndex(index);
    setEditingValue(value);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  const commitEdit = () => {
    if (editingIndex === null) return;
    const value = editingValue.trim();
    if (!value) {
      cancelEdit();
      return;
    }
    const duplicate = items.some(
      (item, idx) =>
        idx !== editingIndex && item.toLowerCase() === value.toLowerCase()
    );
    if (duplicate) {
      setEditingValue(items[editingIndex] ?? "");
      cancelEdit();
      return;
    }
    onUpdateItem(editingIndex, value);
    cancelEdit();
  };
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-zinc-200/70 bg-white/70 p-5 sm:p-6">
      <div className="flex flex-col gap-3 items-center text-center">
        <div>
          <p className="font-display text-xl text-zinc-900">
            {activeTab === "amidakuji" ? "アミダ設定" : "リストを編集"}
          </p>
        </div>
          {activeTab === "amidakuji" && (
            <div className="w-full max-w-md text-left">
              <label className="mb-2 block text-sm font-semibold text-zinc-700">
                当たり名（複数可）
              </label>
              <div className="flex flex-col gap-2">
              <textarea
                value={prizeInputValue}
                onChange={(event) => onPrizeInputChange(event.target.value)}
                placeholder="例: 特賞, 1等, Amazonギフト"
                rows={2}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-zinc-400 focus:outline-none"
              />
                <button
                  type="button"
                  onClick={onAddPrizes}
                  className="h-11 w-full rounded-full border border-zinc-900 bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:w-auto"
                >
                  追加
                </button>
              </div>
            <p className="mt-2 text-xs text-zinc-500">
              カンマか改行で複数入力できます。
            </p>
            {prizeMessage && (
              <p className="mt-2 text-sm font-semibold text-amber-600">
                {prizeMessage}
              </p>
            )}
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {prizeItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500">
                    まだ当たりがありません。追加してください。
                  </div>
                ) : (
                  prizeItems.map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3"
                    >
                      <span className="text-sm font-medium text-zinc-800">
                        {item}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemovePrize(index)}
                        className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 transition hover:border-zinc-400 hover:text-zinc-700"
                      >
                        削除
                      </button>
                    </div>
                  ))
                )}
              </div>
              {prizeLimitReached && (
                <p className="mt-3 text-sm font-semibold text-amber-600">
                  当たりは対象項目の数まで追加できます。
                </p>
              )}
            </div>
          )}
          {activeTab === "amidakuji" && (
            <div className="w-full max-w-md border-t border-zinc-200/70 pt-4" />
          )}
          <form
            className="flex w-full max-w-md flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              onAddItems();
            }}
          >
          <label className="text-left text-sm font-semibold text-zinc-700">
            {"候補リスト"}
          </label>
          <textarea
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="候補を改行またはカンマ区切りで入力"
            rows={3}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-zinc-400 focus:outline-none"
          />
          {itemMessage && (
            <p className="text-sm font-semibold text-amber-600">
              {itemMessage}
            </p>
          )}
          <button
            type="submit"
            className="h-11 w-full rounded-full border border-zinc-900 bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:w-auto"
          >
            追加
          </button>
        </form>
      </div>

      <div className="w-full max-w-md mx-auto">
        <div className="grid gap-2 sm:grid-cols-2">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500">
              まだ候補がありません。追加してください。
            </div>
          ) : (
          items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                {editingIndex === index ? (
                  <input
                    value={editingValue}
                    onChange={(event) => setEditingValue(event.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        commitEdit();
                      }
                      if (event.key === "Escape") {
                        event.preventDefault();
                        cancelEdit();
                      }
                    }}
                    autoFocus
                    className="h-8 w-full rounded-md border border-zinc-200 px-2 text-sm focus:border-zinc-400 focus:outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit(index, item)}
                    className="block w-full truncate text-left text-sm font-medium text-zinc-800"
                  >
                    {item}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => onRemoveItem(index)}
                className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 transition hover:border-zinc-400 hover:text-zinc-700"
              >
                  削除
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
