import { PlanetCanvas } from "./PlanetCanvas";

export function Centered({ title, sub, actions }: { title: string; sub: string; actions: React.ReactNode }) {
  return (
    <section className="relative grid min-h-[90svh] place-items-center overflow-hidden px-4 pt-24 text-center">
      <PlanetCanvas className="absolute inset-0 size-full opacity-60" />
      <div className="relative max-w-xl">
        <h1 className="text-4xl font-bold text-white sm:text-6xl">{title}</h1>
        <p className="mt-5 text-lg text-muted">{sub}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">{actions}</div>
      </div>
    </section>
  );
}
