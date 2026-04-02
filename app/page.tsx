import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, Thermometer, Truck, Shield, Sparkles } from "lucide-react"
import GenerateBillButton from "@/components/generate-bill-button"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/75 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-17 md:px-6">
          <Link href="/" className="group flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
              <Thermometer className="h-4.5 w-4.5 text-primary" strokeWidth={2} />
            </span>
            <span className="text-base font-semibold tracking-tight text-foreground md:text-[1.05rem]">
              Medivax Pharma
            </span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {(
              [
                ["Services", "#"],
                ["About", "#"],
                ["Cold chain", "#"],
                ["Contact", "#"],
              ] as const
            ).map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
          </nav>
          <Link href="/dashboard" className="hidden md:block">
            <Button variant="outline" size="sm" className="h-9 rounded-lg border-border/80 bg-background/50 shadow-none">
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative isolate overflow-hidden pt-10 pb-16 md:pt-16 md:pb-28 lg:pt-20 lg:pb-32">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            aria-hidden
          >
            <div className="absolute -left-[10%] top-0 h-168 w-2xl rounded-full bg-primary/[0.07] blur-3xl" />
            <div className="absolute -right-[15%] top-[20%] h-144 w-xl rounded-full bg-chart-2/12 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,oklch(0.99_0.003_247.858)_55%,var(--background)_100%)] dark:bg-[linear-gradient(to_bottom,transparent_0%,oklch(0.16_0.04_265)_50%,var(--background)_100%)]" />
          </div>

          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                  <span className="tracking-wide">Vaccine distribution excellence</span>
                </div>
                <div className="space-y-4">
                  <h1 className="text-balance text-[2rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-[3.25rem]">
                    Preserving health through{" "}
                    <span className="bg-linear-to-r from-primary to-chart-2 bg-clip-text text-transparent dark:from-primary dark:to-chart-2">
                      perfect temperature control
                    </span>
                  </h1>
                  <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg md:leading-relaxed">
                    Medivax Pharma protects vaccine integrity with precision cold storage and distribution—from
                    ultra-cold through refrigerated—so every dose arrives as intended.
                  </p>
                </div>
                <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center">
                  <Button size="lg" className="h-11 rounded-xl px-7 shadow-md transition-shadow hover:shadow-lg">
                    Our services
                    <ChevronRight className="h-4 w-4 opacity-80" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-11 rounded-xl border-border/80 bg-background/50 shadow-none backdrop-blur-sm"
                  >
                    Learn more
                  </Button>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <div className="relative w-full max-w-lg">
                  <div
                    className="absolute -inset-4 rounded-4xl bg-linear-to-br from-primary/20 via-transparent to-chart-2/15 opacity-80 blur-2xl"
                    aria-hidden
                  />
                  <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/90 p-8 shadow-[0_24px_80px_-24px_oklch(0.2_0.05_265/0.35)] backdrop-blur-sm dark:shadow-[0_24px_80px_-24px_oklch(0_0_0/0.5)] md:p-10">
                    <div className="flex flex-col items-center text-center">
                      <div
                        className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-primary/15 to-chart-2/20 ring-1 ring-border/50"
                        aria-hidden
                      >
                        <Thermometer className="h-10 w-10 text-primary" strokeWidth={1.75} />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Cold chain
                      </p>
                      <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                        Temperature controlled
                      </h3>
                      <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-muted-foreground">
                        −70°C to 8°C precision monitoring across storage and transit.
                      </p>
                      <div className="mt-8 grid w-full grid-cols-3 gap-3 border-t border-border/60 pt-8">
                        {[
                          ["−70°C", "Ultra-cold"],
                          ["2–8°C", "Refrigerated"],
                          ["24/7", "Monitoring"],
                        ].map(([value, label]) => (
                          <div key={label} className="text-center">
                            <p className="text-sm font-semibold tabular-nums text-foreground">{value}</p>
                            <p className="mt-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
                              {label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border/60 bg-muted/25 py-16 md:py-24 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-[2.75rem]">
                Cold chain excellence
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
                Uninterrupted thermal control from warehouse to last mile—validated, traceable, and audit-ready.
              </p>
            </div>
            <div className="mx-auto mt-14 grid max-w-6xl gap-5 md:grid-cols-3 md:gap-6 lg:mt-16">
              {[
                {
                  icon: Thermometer,
                  title: "Precise temperature control",
                  desc: "Facilities tuned to each vaccine profile—from ultra-cold freezers to regulated cold rooms.",
                },
                {
                  icon: Truck,
                  title: "Seamless distribution",
                  desc: "Conditioned vehicles and passive containers keep the chain unbroken in transit.",
                },
                {
                  icon: Shield,
                  title: "Quality assurance",
                  desc: "Continuous telemetry, alarms, and protocols that protect potency at every handoff.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="group flex flex-col rounded-2xl border border-border/70 bg-card p-7 shadow-sm transition-all duration-300 hover:border-border hover:shadow-md md:p-8"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/8 text-primary ring-1 ring-primary/10 transition-colors group-hover:bg-primary/12">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-16 md:py-24 lg:py-28">
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-slate-950 via-slate-950 to-slate-900 dark:from-background dark:via-card dark:to-background"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.4] dark:opacity-20" aria-hidden>
            <div className="absolute left-1/2 top-0 h-px w-[min(100%,48rem)] -translate-x-1/2 bg-linear-to-r from-transparent via-white/25 to-transparent" />
          </div>
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-white dark:text-foreground sm:text-4xl">
                Generate your bill
              </h2>
              <p className="mt-4 text-pretty text-base leading-relaxed text-slate-400 dark:text-muted-foreground md:text-lg">
                Professional invoices for distribution services—fast, consistent, and ready to export.
              </p>
              <div className="mt-10 w-full max-w-md space-y-5">
                <GenerateBillButton />
                <Link href="/dashboard" className="block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-full rounded-lg border-white/20 bg-white/5 text-white shadow-none backdrop-blur-sm hover:bg-white/10 hover:text-white dark:border-border dark:bg-background/50 dark:text-foreground dark:hover:bg-accent"
                  >
                    Go to dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-12 md:flex-row md:items-start md:justify-between md:px-8 md:py-14">
          <div className="max-w-sm space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                <Thermometer className="h-4.5 w-4.5 text-primary" strokeWidth={2} />
              </span>
              <span className="text-base font-semibold tracking-tight text-foreground">Medivax Pharma</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Preserving health through perfect temperature control since 2010.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 sm:gap-14">
            {(
              [
                ["Company", ["About", "Careers"]],
                ["Services", ["Storage", "Distribution"]],
                ["Resources", ["Blog", "Documentation"]],
                ["Legal", ["Privacy", "Terms"]],
              ] as const
            ).map(([heading, links]) => (
              <div key={heading} className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">{heading}</h4>
                <ul className="space-y-2.5 text-sm">
                  {links.map((item) => (
                    <li key={item}>
                      <Link
                        href="#"
                        className="text-foreground/80 transition-colors hover:text-foreground"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-border/60">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row md:px-8">
            <p className="text-xs text-muted-foreground">© 2026 Medivax Pharma. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {["Privacy policy", "Terms of service", "Cookie policy"].map((label) => (
                <Link
                  key={label}
                  href="#"
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
