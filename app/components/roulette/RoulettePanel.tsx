type RoulettePanelProps = {
  items: string[];
  gradient: string;
  rotation: number;
  slice: number;
  isSpinning: boolean;
  selectedItem: string;
  title: string;
  onTitleChange: (value: string) => void;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  toShortLabel: (value: string) => string;
};

export default function RoulettePanel({
  items,
  gradient,
  rotation,
  slice,
  isSpinning,
  selectedItem,
  title,
  onTitleChange,
  onStart,
  onStop,
  onReset,
  toShortLabel,
}: RoulettePanelProps) {
  const showResultLabel = isSpinning || selectedItem.length > 0;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex items-center justify-center">
        <div className="absolute -top-4 z-10 h-0 w-0 border-l-[14px] border-r-[14px] border-t-[22px] border-l-transparent border-r-transparent border-t-zinc-900 drop-shadow" />
        <div
          className="relative h-64 w-64 rounded-full shadow-xl ring-1 ring-zinc-200/60 [--label-radius:78px] motion-reduce:transition-none sm:h-72 sm:w-72 sm:[--label-radius:92px]"
          style={{
            background: gradient,
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {items.map((item, index) => {
            const angle = index * slice + slice / 2;
            return (
              <div
                key={`${item}-${index}`}
                className="group absolute left-1/2 top-1/2"
                style={{
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(calc(-1 * var(--label-radius))) rotate(-${angle}deg)`,
                }}
              >
                <span
                  className="inline-block max-w-[86px] truncate rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-800 shadow-sm"
                  style={{ transform: `rotate(${angle + 90}deg)` }}
                >
                  {toShortLabel(item)}
                </span>
                <span className="pointer-events-none absolute left-1/2 top-full mt-2 w-max -translate-x-1/2 rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-4 text-center">
        <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {isSpinning ? (
            <button
              type="button"
              onClick={onStop}
              className="h-12 w-full max-w-xs rounded-full bg-zinc-900 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:h-12 sm:w-40 sm:max-w-none sm:flex-none sm:text-sm sm:uppercase sm:tracking-[0.3em]"
            >
              止める
            </button>
          ) : (
            <button
              type="button"
              onClick={onStart}
              disabled={items.length === 0}
              className="h-12 w-full max-w-xs rounded-full bg-zinc-900 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400 sm:h-12 sm:w-40 sm:max-w-none sm:flex-none sm:text-sm sm:uppercase sm:tracking-[0.3em]"
            >
              回す
            </button>
          )}
          <button
            type="button"
            onClick={onReset}
            disabled={isSpinning}
            className="h-12 w-full max-w-xs rounded-full border border-zinc-300 bg-white text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:w-40 sm:max-w-none sm:flex-none sm:text-sm sm:uppercase sm:tracking-[0.3em]"
          >
            リセット
          </button>
        </div>
        <div className="flex w-full flex-col items-center gap-2">
          <input
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            maxLength={20}
            placeholder="タイトルを入力（20文字まで）"
            aria-label="タイトル"
            className="h-10 w-full max-w-xs rounded-full border border-zinc-300 bg-white px-4 text-center text-sm font-semibold text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
          />
          <p className="text-xs text-zinc-400">{title.length}/20</p>
        </div>
        <div className="rounded-2xl bg-zinc-900 px-4 py-3 text-white">
          {showResultLabel && (
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-white">
              結果
            </p>
          )}
          {isSpinning ? (
            <p className="mt-1 text-sm text-white/80" aria-live="polite">
              回転中... 止めるを押してください
            </p>
          ) : selectedItem ? (
            <p className="mt-2 text-lg font-semibold" aria-live="polite">
              {selectedItem}
            </p>
          ) : (
            <p className="mt-1 text-sm text-white/80" aria-live="polite">
              回すを押すと結果が表示されます。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
