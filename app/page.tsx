import Roulette from "./components/Roulette";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f1e8] text-zinc-900">
      <main className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-12 px-5 py-12 sm:px-6 sm:py-16">
        <section className="flex w-full">
          <Roulette />
        </section>
      </main>
    </div>
  );
}
