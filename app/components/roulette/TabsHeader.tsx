type TabKey = "roulette" | "order" | "amidakuji";

type TabsHeaderProps = {
  title: string;
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
};

const tabLabels: { key: TabKey; label: string }[] = [
  { key: "roulette", label: "ルーレット" },
  { key: "order", label: "順番決め" },
  { key: "amidakuji", label: "あみだくじ" },
];

export default function TabsHeader({
  title,
  activeTab,
  onChange,
}: TabsHeaderProps) {
  return (
    <div className="flex flex-col gap-2 text-center">
      <h2 className="font-display text-3xl text-zinc-900 sm:text-4xl">
        {title}
      </h2>
      <div className="flex flex-wrap justify-center gap-2">
        {tabLabels.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                isActive
                  ? "border border-zinc-900 bg-zinc-900 text-white"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
