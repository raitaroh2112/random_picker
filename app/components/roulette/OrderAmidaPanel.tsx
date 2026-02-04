import { useEffect, useMemo, useState } from "react";

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
  title: string;
  onTitleChange: (value: string) => void;
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
  title,
  onTitleChange,
  onDecideOrder,
  onDecideAmidakuji,
  onReset,
}: OrderAmidaPanelProps) {
  const [selectedStartIndex, setSelectedStartIndex] = useState<number | null>(
    null
  );
  const [traceSeed, setTraceSeed] = useState(0);
  const [traceProgress, setTraceProgress] = useState(0);
  const needsMoreItems = items.length < 2;
  const orderPrompt = needsMoreItems
    ? "候補は2件以上必要です。"
    : "「決める」を押すと順番が表示されます。";
  const showResultLabel = Boolean(orderResult);
  const canAct = items.length >= 2;
  const labelWidth = 56;
  const ladderTop = 24;
  const ladderBottom = 200;
  const displayItems = items;
  const ladderDisplayWidth = Math.max(1, labelWidth * displayItems.length);
  const shortLabel = (value: string) =>
    value.length > 6 ? `${value.slice(0, 5)}…` : value;
  const pathRows = amidakujiData?.connections.length ?? 0;
  const xForIndex = (index: number) => labelWidth * index + labelWidth / 2;
  const buildPathCoordinates = (startIndex: number) => {
    if (!amidakujiData) return [];
    let position = startIndex;
    const points: Array<{ x: number; y: number }> = [];
    const startX = xForIndex(position);
    points.push({ x: startX, y: ladderTop });
    for (let row = 0; row < pathRows; row += 1) {
      const y =
        ladderTop + ((row + 1) * (ladderBottom - ladderTop)) / (pathRows + 1);
      points.push({ x: xForIndex(position), y });
      if (position > 0 && amidakujiData.connections[row][position - 1]) {
        position -= 1;
        points.push({ x: xForIndex(position), y });
      } else if (
        position < displayItems.length - 1 &&
        amidakujiData.connections[row][position]
      ) {
        position += 1;
        points.push({ x: xForIndex(position), y });
      }
    }
    points.push({ x: xForIndex(position), y: ladderBottom });
    return points;
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
  const amidakujiAssignments = amidakujiData
    ? items.map((item, index) => {
        const mappedIndex = amidakujiData.mapping[index];
        const destination = amidakujiData.bottomLabels[mappedIndex] ?? "?";
        return {
          item,
          mappedIndex,
          destination,
          isPrize: resolvedPrizeNames.includes(destination),
        };
      })
    : [];
  const selectedPath = useMemo(() => {
    if (!amidakujiData || selectedStartIndex === null) return null;
    if (selectedStartIndex < 0 || selectedStartIndex >= displayItems.length) {
      return null;
    }
    const coordinates = buildPathCoordinates(selectedStartIndex);
    if (coordinates.length === 0) return null;
    const points = coordinates.map((point) => `${point.x},${point.y}`).join(" ");
    const pathLength = coordinates.reduce((sum, point, index) => {
      if (index === 0) return sum;
      const prev = coordinates[index - 1];
      const dx = point.x - prev.x;
      const dy = point.y - prev.y;
      return sum + Math.hypot(dx, dy);
    }, 0);
    const destinationIndex = amidakujiData.mapping[selectedStartIndex];
    const destinationLabel = amidakujiData.bottomLabels[destinationIndex] ?? "?";
    return {
      points,
      pathLength,
      destinationLabel,
      isPrize: resolvedPrizeNames.includes(destinationLabel),
    };
  }, [amidakujiData, selectedStartIndex, displayItems.length, resolvedPrizeNames]);

  useEffect(() => {
    setSelectedStartIndex(null);
    setTraceProgress(0);
  }, [amidakujiData, isOrderTab, items.length]);

  useEffect(() => {
    if (!selectedPath) {
      setTraceProgress(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTraceProgress(1);
      return;
    }

    setTraceProgress(0);
    let frameId: number | null = null;
    let startAt: number | null = null;
    const duration = 1100;
    const animate = (timestamp: number) => {
      if (startAt === null) {
        startAt = timestamp;
      }
      const elapsed = timestamp - startAt;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setTraceProgress(eased);
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };
    frameId = requestAnimationFrame(animate);
    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [selectedPath, traceSeed]);

  return (
    <div
      className={`flex flex-col items-center gap-6 ${
        isOrderTab ? "md:flex-row md:items-start md:justify-center" : ""
      }`}
    >
      {!isOrderTab && (
        <div className="relative flex w-full items-center justify-center">
          <div className="flex w-full max-w-3xl flex-col items-center justify-center gap-4 rounded-3xl bg-white/80 px-6 py-6 text-center sm:min-h-[26rem]">
            <div className="flex w-full flex-col items-center gap-3">
              <div className="mt-2 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={onDecideAmidakuji}
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
              <input
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                maxLength={20}
                placeholder="タイトルを入力（20文字まで）"
                aria-label="タイトル"
                className="h-10 w-full max-w-xs rounded-full border border-zinc-300 bg-white px-4 text-center text-sm font-semibold text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
              />
            </div>
            {displayItems.length > 0 && !needsMoreItems ? (
              <div className="w-full">
                <div
                  className="w-full overflow-x-auto pb-4"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  <div className="inline-block" style={{ width: ladderDisplayWidth }}>
                    {amidakujiAssignments.length > 0 && (
                      <p className="text-xs text-zinc-700">
                        上の名前をタップすると行き先をアニメーション表示します。
                      </p>
                    )}
                    <svg
                      className="mt-3 h-48 w-full"
                      viewBox={`0 0 ${ladderDisplayWidth} 230`}
                    >
                      {displayItems.map((item, index) => (
                        <g
                          key={`label-top-${item}-${index}`}
                          onClick={() => {
                            if (!amidakujiData) return;
                            setSelectedStartIndex(index);
                            setTraceSeed((prev) => prev + 1);
                          }}
                          style={{
                            cursor: amidakujiData ? "pointer" : "default",
                          }}
                        >
                          <circle
                            cx={xForIndex(index)}
                            cy={11}
                            r={14}
                            fill={
                              selectedStartIndex === index
                                ? "rgba(14,165,233,0.18)"
                                : "transparent"
                            }
                          />
                          <text
                            x={xForIndex(index)}
                            y={8}
                            textAnchor="middle"
                            dominantBaseline="hanging"
                            fontSize="10"
                            fontWeight="600"
                            fill={
                              selectedStartIndex === index ? "#0284c7" : "#52525b"
                            }
                          >
                            {shortLabel(item)}
                          </text>
                        </g>
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
                              points={buildPathCoordinates(index)
                                .map((point) => `${point.x},${point.y}`)
                                .join(" ")}
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth={3.5}
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              opacity={selectedPath ? 0.22 : 1}
                            />
                          ))}
                      {selectedPath && (
                        <>
                          <polyline
                            points={selectedPath.points}
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth={5}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            opacity={0.2}
                          />
                          <polyline
                            points={selectedPath.points}
                            fill="none"
                            stroke="#0284c7"
                            strokeWidth={5}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            strokeDasharray={selectedPath.pathLength}
                            strokeDashoffset={
                              selectedPath.pathLength * (1 - traceProgress)
                            }
                          />
                        </>
                      )}
                      {(amidakujiData?.bottomLabels ?? items.map(() => "?"))
                        .slice(0, displayItems.length)
                        .map((label, index) => (
                          <text
                            key={`label-bottom-${label}-${index}`}
                            x={xForIndex(index)}
                            y={ladderBottom + 18}
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
          <>
            <div className="mt-4 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={onDecideOrder}
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

            <div className="flex w-full flex-col items-center gap-2">
              <input
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                maxLength={20}
                placeholder="タイトルを入力（20文字まで）"
                aria-label="タイトル"
                className="h-10 w-full max-w-xs rounded-full border border-zinc-300 bg-white px-4 text-center text-sm font-semibold text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
              />
            </div>
          </>
        )}

         {isOrderTab ? (
          <div className="rounded-2xl bg-zinc-900 px-4 py-3 text-white">
            {showResultLabel && (
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-white">
                結果
              </p>
            )}
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
        ) : (
          <div className="rounded-2xl bg-zinc-900 px-4 py-3 text-white">
            {amidakujiAssignments.length > 0 ? (
              <div className="mt-1 flex flex-col gap-2 text-sm">
                <p className="text-sm font-bold uppercase tracking-[0.35em] text-white">
                  割り当て結果
                </p>

                {amidakujiAssignments.map((assignment, index) => (
                  <div
                    key={`${assignment.item}-${assignment.destination}-${index}`}
                    className="mx-auto flex w-full max-w-xs items-center justify-between rounded-full bg-white/10 px-3 py-2"
                  >
                    <span className="truncate pr-2 text-left font-semibold">
                      {assignment.item}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        assignment.isPrize
                          ? "bg-amber-300/30 text-amber-100"
                          : "bg-white/15 text-white"
                      }`}
                    >
                      {assignment.destination}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/80" aria-live="polite">
                決めるを押すと当たりのルートが表示されます。
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
