type AmidakujiData = {
  connections: boolean[][];
  bottomLabels: string[];
  mapping: number[];
};

type OrderAmidaPanelProps = {
  items: string[];
  isOrderTab: boolean;
  orderResult: string[] | null;
  amidakujiData: AmidakujiData | null;
  actionLabel: string;
  resolvedPrizeNames: string[];
  onDecideOrder: () => void;
  onDecideAmidakuji: () => void;
  onReset: () => void;
};

export default function OrderAmidaPanel({
  items,
  isOrderTab,
  orderResult,
  amidakujiData,
  actionLabel,
  resolvedPrizeNames,
  onDecideOrder,
  onDecideAmidakuji,
  onReset,
}: OrderAmidaPanelProps) {
  const helperText = isOrderTab
    ? "シャッフルで順番を決めます。"
    : "下の入力欄に候補を貼り付けてください。";
  const needsMoreItems = items.length < 2;
  const orderPrompt = needsMoreItems
    ? "候補は2件以上必要です。"
    : "「決める」を押すと順番が表示されます。";
  const canAct = items.length >= 2;
  const labelWidth = 56;
  const ladderTop = 20;
  const ladderBottom = 156;
  const displayItems = items;
  const ladderDisplayWidth = Math.max(1, labelWidth * displayItems.length);
  const shortLabel = (value: string) =>
    value.length > 6 ? `${value.slice(0, 5)}…` : value;
  const pathRows = amidakujiData?.connections.length ?? 0;
  const xForIndex = (index: number) => labelWidth * index + labelWidth / 2;
  const buildPathPoints = (startIndex: number) => {
    if (!amidakujiData) return "";
    let position = startIndex;
    const points: string[] = [];
    const startX = xForIndex(position);
    points.push(`${startX},${ladderTop}`);
    for (let row = 0; row < pathRows; row += 1) {
      const y =
        ladderTop + ((row + 1) * (ladderBottom - ladderTop)) / (pathRows + 1);
      points.push(`${xForIndex(position)},${y}`);
      if (position > 0 && amidakujiData.connections[row][position - 1]) {
        position -= 1;
        points.push(`${xForIndex(position)},${y}`);
      } else if (
        position < displayItems.length - 1 &&
        amidakujiData.connections[row][position]
      ) {
        position += 1;
        points.push(`${xForIndex(position)},${y}`);
      }
    }
    points.push(`${xForIndex(position)},${ladderBottom}`);
    return points.join(" ");
  };
  const winningStartIndexes = amidakujiData
    ? items.reduce<number[]>((acc, _, index) => {
        const mapped = amidakujiData.mapping[index];
        const label = amidakujiData.bottomLabels[mapped];
        if (resolvedPrizeNames.includes(label)) {
          acc.push(index);
        }
        return acc;
      }, [])
    : [];

  return (
    <div
      className={`flex flex-col items-center gap-6 ${
        isOrderTab ? "md:flex-row md:items-start md:justify-center" : ""
      }`}
    >
      {!isOrderTab && (
        <div className="relative flex w-full items-center justify-center">
          <div className="flex w-full max-w-3xl flex-col items-center justify-center gap-4 rounded-3xl bg-white/80 px-6 py-6 text-center sm:min-h-[22rem]">
            <div className="mt-6" />
            {displayItems.length > 0 && !needsMoreItems ? (
              <div className="w-full">
                <div
                  className="w-full overflow-x-auto pb-10"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  <div className="inline-block" style={{ width: ladderDisplayWidth }}>
                    <svg
                      className="mt-3 h-40 w-full"
                      viewBox={`0 0 ${ladderDisplayWidth} 180`}
                    >
                      {displayItems.map((item, index) => (
                        <text
                          key={`label-top-${item}-${index}`}
                          x={xForIndex(index)}
                          y={8}
                          textAnchor="middle"
                          dominantBaseline="hanging"
                          fontSize="10"
                          fontWeight="600"
                          fill="#52525b"
                        >
                          {shortLabel(item)}
                        </text>
                      ))}
                      {(amidakujiData?.connections ?? []).map(
                        (row, rowIndex) => {
                          const rows = amidakujiData
                            ? amidakujiData.connections.length
                            : 0;
                          const y =
                            ladderTop +
                            ((rowIndex + 1) * (ladderBottom - ladderTop)) /
                              (rows + 1);
                          return row.map((hasLine, colIndex) => {
                            if (!hasLine) return null;
                            if (colIndex >= displayItems.length - 1) return null;
                            const x1 = xForIndex(colIndex);
                            const x2 = xForIndex(colIndex + 1);
                            return (
                              <line
                                key={`h-${rowIndex}-${colIndex}`}
                                x1={x1}
                                x2={x2}
                                y1={y}
                                y2={y}
                                stroke="#18181b"
                                strokeWidth={2.5}
                                strokeLinecap="round"
                                opacity={0.7}
                              />
                            );
                          });
                        }
                      )}
                      {displayItems.map((_, index) => {
                        const x = xForIndex(index);
                        return (
                          <line
                            key={`v-${index}`}
                            x1={x}
                            x2={x}
                            y1={ladderTop}
                            y2={ladderBottom}
                            stroke="#18181b"
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            opacity={0.7}
                          />
                        );
                      })}
                      {amidakujiData &&
                        winningStartIndexes
                          .filter((index) => index < displayItems.length)
                          .map((index) => (
                            <polyline
                              key={`path-${index}`}
                              points={buildPathPoints(index)}
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth={3.5}
                              strokeLinejoin="round"
                              strokeLinecap="round"
                            />
                          ))}
                      {(amidakujiData?.bottomLabels ?? items.map(() => "?"))
                        .slice(0, displayItems.length)
                        .map((label, index) => (
                          <text
                            key={`label-bottom-${label}-${index}`}
                            x={xForIndex(index)}
                            y={172}
                            textAnchor="middle"
                            dominantBaseline="alphabetic"
                            fontSize="11"
                            fontWeight="600"
                            fill={
                              resolvedPrizeNames.includes(label)
                                ? "#d97706"
                                : "#52525b"
                            }
                          >
                            {shortLabel(label)}
                          </text>
                        ))}
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">
                {needsMoreItems
                  ? "候補は2件以上必要です。"
                  : "候補を入力してください。"}
              </p>
            )}
          </div>
        </div>
      )}

      <div
        className={`flex w-full flex-col gap-4 text-center ${
          isOrderTab ? "md:max-w-sm md:mx-auto" : "max-w-sm"
        }`}
      >
        {isOrderTab && (
          <div className="rounded-2xl bg-zinc-900 px-4 py-3 text-white">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-white">
              結果
            </p>
            {orderResult ? (
              <div className="mt-3 flex flex-col gap-2 text-sm">
                {orderResult.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="mx-auto flex w-full max-w-xs items-center justify-between rounded-full bg-white/10 px-3 py-2"
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-semibold tabular-nums">
                      {index + 1}
                    </span>
                    <span className="flex-1 px-3 text-left font-semibold">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-sm text-white/80" aria-live="polite">
                {orderPrompt}
              </p>
            )}
          </div>
        )}

        <div className="mt-4 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={isOrderTab ? onDecideOrder : onDecideAmidakuji}
            disabled={!canAct}
            className="h-12 w-full max-w-xs rounded-full bg-zinc-900 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400 sm:h-12 sm:w-40 sm:max-w-none sm:flex-none sm:text-sm sm:uppercase sm:tracking-[0.3em]"
          >
            {actionLabel}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="h-12 w-full max-w-xs rounded-full border border-zinc-300 bg-white text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 sm:h-12 sm:w-40 sm:max-w-none sm:flex-none sm:text-sm sm:uppercase sm:tracking-[0.3em]"
          >
            リセット
          </button>
        </div>

        {isOrderTab ? (
          <p className="text-sm text-zinc-500">{helperText}</p>
        ) : null}
      </div>
    </div>
  );
}
