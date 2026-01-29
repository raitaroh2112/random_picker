"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import EditPanel from "./roulette/EditPanel";
import OrderAmidaPanel from "./roulette/OrderAmidaPanel";
import RoulettePanel from "./roulette/RoulettePanel";
import TabsHeader from "./roulette/TabsHeader";

const defaultItems = [
  "Sushi",
  "Ramen",
  "Burgers",
  "Tacos",
  "Salad",
  "Pizza",
];

const palette = [
  "#ff595e",
  "#ff924c",
  "#ffca3a",
  "#c5ca30",
  "#8ac926",
  "#52a675",
  "#1982c4",
  "#4267ac",
  "#6a4c93",
];

export default function Roulette() {
  const [items, setItems] = useState<string[]>(defaultItems);
  const [inputValue, setInputValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "roulette" | "order" | "amidakuji"
  >("roulette");
  const [orderResult, setOrderResult] = useState<string[] | null>(null);
  const [rouletteTitle, setRouletteTitle] = useState("");
  const [orderTitle, setOrderTitle] = useState("");
  const [amidakujiTitle, setAmidakujiTitle] = useState("");
  const [amidakujiData, setAmidakujiData] = useState<{
    connections: boolean[][];
    bottomLabels: string[];
    mapping: number[];
  } | null>(null);
  const [prizeItems, setPrizeItems] = useState<string[]>(["当たり"]);
  const [prizeInputValue, setPrizeInputValue] = useState("");
  const [prizeLimitReached, setPrizeLimitReached] = useState(false);
  const [itemMessage, setItemMessage] = useState<string | null>(null);
  const [prizeMessage, setPrizeMessage] = useState<string | null>(null);
  const rotationRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const spinPhaseRef = useRef<"idle" | "spinning" | "stopping">("idle");
  const pendingIndexRef = useRef<number | null>(null);
  const spinStartRef = useRef<number | null>(null);
  const stopStartRef = useRef<number | null>(null);
  const stopFromRef = useRef(0);
  const stopToRef = useRef(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updatePreference);
      return () => mediaQuery.removeEventListener("change", updatePreference);
    }
    mediaQuery.addListener(updatePreference);
    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  useEffect(() => {
    const shouldWarn =
      isSpinning || inputValue.trim().length > 0 || prizeInputValue.trim().length > 0;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!shouldWarn) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSpinning, inputValue, prizeInputValue]);

  const slice = 360 / Math.max(items.length, 1);
  const toShortLabel = (value: string) =>
    Array.from(value).slice(0, 5).join("");

  const easeInCubic = (value: number) => value * value * value;
  const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);
  const tabTitle =
    activeTab === "roulette"
      ? "ルーレット"
      : activeTab === "order"
      ? "順番決め"
      : "あみだくじ";
  const isOrderTab = activeTab === "order";
  const actionLabel = isOrderTab ? "決める" : "作る";
  const resolvedPrizeNames =
    prizeItems.length > 0 ? prizeItems : ["当たり"];

  const gradient = useMemo(() => {
    if (items.length === 0) {
      return "conic-gradient(#f3f4f6 0deg 360deg)";
    }

    return `conic-gradient(${items
      .map((_, index) => {
        const start = index * slice;
        const end = (index + 1) * slice;
        const color = palette[index % palette.length];
        return `${color} ${start}deg ${end}deg`;
      })
      .join(", ")})`;
  }, [items, slice]);

  const addItems = () => {
    const nextItems = inputValue
      .split(/[\n,]+/)
      .map((value) => value.trim())
      .filter(Boolean);
    if (nextItems.length === 0) {
      setItemMessage("追加する項目を入力してください。");
      return;
    }

    setItems((prev) => {
      const existing = new Set(prev.map((item) => item.toLowerCase()));
      const merged = [...prev];
      let added = 0;
      nextItems.forEach((value) => {
        const key = value.toLowerCase();
        if (!existing.has(key)) {
          merged.push(value);
          existing.add(key);
          added += 1;
        }
      });
      if (added === 0) {
        setItemMessage("既に追加済みの項目だけでした。");
      } else {
        setItemMessage(null);
      }
      return merged;
    });
    setInputValue("");
    setSelectedIndex(null);
    setOrderResult(null);
    setAmidakujiData(null);
    setPrizeLimitReached(false);
  };

  const addPrizes = () => {
    setPrizeLimitReached(false);
    const nextPrizes = prizeInputValue
      .split(/[\n,]+/)
      .map((value) => value.trim())
      .filter(Boolean);
    if (nextPrizes.length === 0) {
      setPrizeMessage("当たり名を入力してください。");
      return;
    }

    setPrizeItems((prev) => {
      const existing = new Set(prev.map((item) => item.toLowerCase()));
      const merged = [...prev];
      let added = 0;
      nextPrizes.forEach((value) => {
        const key = value.toLowerCase();
        if (!existing.has(key)) {
          if (merged.length < items.length) {
            merged.push(value);
            added += 1;
          } else {
            setPrizeLimitReached(true);
          }
          existing.add(key);
        }
      });
      if (added === 0) {
        setPrizeMessage(
          merged.length >= items.length
            ? "当たりは対象項目の数まで追加できます。"
            : "既に追加済みの当たりだけでした。"
        );
      } else {
        setPrizeMessage(null);
      }
      return merged;
    });
    setPrizeInputValue("");
    setAmidakujiData(null);
  };

  const removePrize = (index: number) => {
    setPrizeItems((prev) => prev.filter((_, i) => i !== index));
    setAmidakujiData(null);
    setPrizeLimitReached(false);
    setPrizeMessage(null);
  };

  const shuffleItems = <T,>(list: T[]) => {
    const result = [...list];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const swapIndex = Math.floor(Math.random() * (i + 1));
      [result[i], result[swapIndex]] = [result[swapIndex], result[i]];
    }
    return result;
  };

  const decideOrder = () => {
    if (items.length < 2) return;
    setOrderResult(shuffleItems(items));
  };

  const decideAmidakuji = () => {
    if (items.length < 2) return;
    const columns = items.length;
    const rows = Math.max(6, columns * 2);
    const connections = Array.from({ length: rows }, () =>
      Array.from({ length: Math.max(columns - 1, 0) }, () => false)
    );

    for (let row = 0; row < rows; row += 1) {
      let col = 0;
      while (col < columns - 1) {
        const canDraw = col === 0 || !connections[row][col - 1];
        if (canDraw && Math.random() < 0.35) {
          connections[row][col] = true;
          col += 2;
        } else {
          col += 1;
        }
      }
    }

    const minLinesPerColumn = 2;
    for (let col = 0; col < columns - 1; col += 1) {
      const lineCount = connections.reduce(
        (count, row) => count + (row[col] ? 1 : 0),
        0
      );
      if (lineCount < minLinesPerColumn) {
        const needed = minLinesPerColumn - lineCount;
        for (let added = 0; added < needed; added += 1) {
          for (let attempt = 0; attempt < rows; attempt += 1) {
            const rowIndex = Math.floor(Math.random() * rows);
            const leftBlocked = col > 0 && connections[rowIndex][col - 1];
            const rightBlocked =
              col < columns - 2 && connections[rowIndex][col + 1];
            if (!leftBlocked && !rightBlocked) {
              connections[rowIndex][col] = true;
              break;
            }
          }
        }
      }
    }

    const mapping = Array.from({ length: columns }, (_, start) => {
      let position = start;
      for (let row = 0; row < rows; row += 1) {
        if (position > 0 && connections[row][position - 1]) {
          position -= 1;
        } else if (position < columns - 1 && connections[row][position]) {
          position += 1;
        }
      }
      return position;
    });

    const winners = Math.min(resolvedPrizeNames.length, columns);
    const bottomLabels = Array.from({ length: columns }, () => "ハズレ");
    const winnerItemIndexes = shuffleItems(
      Array.from({ length: columns }, (_, index) => index)
    ).slice(0, winners);
    winnerItemIndexes.forEach((itemIndex, winnerIndex) => {
      const bottomIndex = mapping[itemIndex];
      bottomLabels[bottomIndex] =
        resolvedPrizeNames[winnerIndex % resolvedPrizeNames.length];
    });

    setAmidakujiData({ connections, bottomLabels, mapping });
  };

  const stopAnimation = () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    lastTimeRef.current = null;
    spinStartRef.current = null;
  };

  const handleTabChange = (tab: "roulette" | "order" | "amidakuji") => {
    if (tab !== "roulette") {
      stopAnimation();
      setIsSpinning(false);
      spinPhaseRef.current = "idle";
    }
    setActiveTab(tab);
  };

  useEffect(() => stopAnimation, []);

  const startSpin = () => {
    if (items.length === 0 || isSpinning) return;
    if (prefersReducedMotion) {
      const index = Math.floor(Math.random() * items.length);
      setSelectedIndex(index);
      setIsSpinning(false);
      spinPhaseRef.current = "idle";
      return;
    }

    setIsSpinning(true);
    spinPhaseRef.current = "spinning";
    spinStartRef.current = null;
    setSelectedIndex(null);
    pendingIndexRef.current = null;

    const maxSpeed = 1.4;
    const accelDuration = 800;

    const tick = (time: number) => {
      if (spinPhaseRef.current === "idle") {
        stopAnimation();
        return;
      }

      if (spinPhaseRef.current === "stopping") {
        if (stopStartRef.current === null) {
          stopStartRef.current = time;
        }
        const elapsed = time - stopStartRef.current;
        const decelDuration = 3000;
        const progress = Math.min(elapsed / decelDuration, 1);
        const eased = easeOutCubic(progress);
        const next =
          stopFromRef.current +
          (stopToRef.current - stopFromRef.current) * eased;
        rotationRef.current = next;
        setRotation(next);

        if (progress >= 1) {
          spinPhaseRef.current = "idle";
          setIsSpinning(false);
          if (pendingIndexRef.current !== null) {
            setSelectedIndex(pendingIndexRef.current);
            pendingIndexRef.current = null;
          }
          stopAnimation();
          return;
        }

        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      if (spinStartRef.current === null) {
        spinStartRef.current = time;
      }
      const elapsed = time - spinStartRef.current;
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;
      const accelProgress = Math.min(elapsed / accelDuration, 1);
      const speed = maxSpeed * easeInCubic(accelProgress);
      const next = rotationRef.current + delta * speed;
      rotationRef.current = next;
      setRotation(next);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
  };

  const stopSpin = () => {
    if (!isSpinning) return;
    const index = Math.floor(Math.random() * items.length);
    const center = index * slice + slice / 2;
    const desired = (360 - center) % 360;
    const current = ((rotationRef.current % 360) + 360) % 360;
    const delta = (desired - current + 360) % 360;
    const extraSpins = 3;
    const targetRotation = rotationRef.current + extraSpins * 360 + delta;

    pendingIndexRef.current = index;
    spinPhaseRef.current = "stopping";
    stopStartRef.current = null;
    stopFromRef.current = rotationRef.current;
    stopToRef.current = targetRotation;

    if (prefersReducedMotion) {
      rotationRef.current = targetRotation;
      setRotation(targetRotation);
      setSelectedIndex(index);
      pendingIndexRef.current = null;
      setIsSpinning(false);
      spinPhaseRef.current = "idle";
    }
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setPrizeItems((prev) =>
      prev.length > items.length - 1 ? prev.slice(0, items.length - 1) : prev
    );
    setSelectedIndex((prev) => {
      if (prev === null) return prev;
      if (prev === index) return null;
      return prev > index ? prev - 1 : prev;
    });
    setOrderResult(null);
    setAmidakujiData(null);
    setPrizeLimitReached(false);
    setItemMessage(null);
  };

  const updateItem = (index: number, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setItemMessage("空の項目にはできません。");
      return;
    }
    let updated = false;
    setItems((prev) => {
      const exists = prev.some(
        (item, idx) =>
          idx !== index && item.toLowerCase() === trimmed.toLowerCase()
      );
      if (exists) return prev;
      const next = [...prev];
      next[index] = trimmed;
      updated = true;
      return next;
    });
    if (!updated) {
      setItemMessage("同じ名前の項目が既にあります。");
      return;
    }
    setItemMessage(null);
    setOrderResult(null);
    setAmidakujiData(null);
  };

  const resetItems = () => {
    stopAnimation();
    setItems(defaultItems);
    setSelectedIndex(null);
    pendingIndexRef.current = null;
    setOrderResult(null);
    setAmidakujiData(null);
    setPrizeItems(["当たり"]);
    setPrizeInputValue("");
    setPrizeLimitReached(false);
    setItemMessage(null);
    setPrizeMessage(null);
    setRotation(0);
    rotationRef.current = 0;
    setIsSpinning(false);
    spinPhaseRef.current = "idle";
  };

  const selectedItem =
    selectedIndex === null ? "" : items[selectedIndex];

  return (
    <div className="flex w-full flex-col gap-8">
      <TabsHeader
        title={tabTitle}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      <EditPanel
        activeTab={activeTab}
        prizeInputValue={prizeInputValue}
        onPrizeInputChange={setPrizeInputValue}
        onAddPrizes={addPrizes}
        prizeItems={prizeItems}
        onRemovePrize={removePrize}
        prizeLimitReached={prizeLimitReached}
        prizeMessage={prizeMessage}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onAddItems={addItems}
        itemMessage={itemMessage}
        items={items}
        onRemoveItem={removeItem}
        onUpdateItem={updateItem}
      />

      <div className="flex flex-col gap-6 rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur sm:p-6">
        {activeTab === "roulette" ? (
          <RoulettePanel
            items={items}
            gradient={gradient}
            rotation={rotation}
            slice={slice}
            isSpinning={isSpinning}
            selectedItem={selectedItem}
            title={rouletteTitle}
            onTitleChange={setRouletteTitle}
            onStart={startSpin}
            onStop={stopSpin}
            onReset={resetItems}
            toShortLabel={toShortLabel}
          />
        ) : (
          <OrderAmidaPanel
            items={items}
            isOrderTab={isOrderTab}
            orderResult={orderResult}
            amidakujiData={amidakujiData}
            actionLabel={actionLabel}
            resolvedPrizeNames={resolvedPrizeNames}
            title={isOrderTab ? orderTitle : amidakujiTitle}
            onTitleChange={isOrderTab ? setOrderTitle : setAmidakujiTitle}
            onDecideOrder={decideOrder}
            onDecideAmidakuji={decideAmidakuji}
            onReset={resetItems}
          />
        )}
      </div>
    </div>
  );
}
