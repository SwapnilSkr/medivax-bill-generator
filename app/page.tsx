import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, Thermometer, Truck, Shield } from "lucide-react"
import GenerateBillButton from "@/components/generate-bill-button"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Thermometer className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold tracking-tight">Medivax Pharma</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Services
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              About Us
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Cold Chain
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Contact
            </Link>
          </nav>
          <Button variant="outline" size="sm" className="hidden md:flex">
            Login
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-blue-50">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">
                  Vaccine Distribution Excellence
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Preserving Health Through Perfect Temperature Control
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Medivax Pharma ensures the integrity and efficacy of vaccines through our state-of-the-art cold
                  storage and distribution network, maintaining precise temperatures for optimal vaccine preservation.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700">
                    Our Services
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="inline-flex h-10 items-center justify-center">
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative w-full max-w-[500px] aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 shadow-lg">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-6">
                      <Thermometer className="mx-auto h-16 w-16 text-blue-600 mb-4" />
                      <h3 className="text-xl font-bold text-blue-900">Temperature Controlled</h3>
                      <p className="mt-2 text-sm text-blue-700">-70°C to 8°C precision storage</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Our Cold Chain Excellence</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Ensuring vaccine efficacy through uninterrupted temperature control from storage to delivery
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4 rounded-lg border bg-blue-50 p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Thermometer className="h-6 w-6 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Precise Temperature Control</h3>
                  <p className="text-sm text-gray-500">
                    Our facilities maintain exact temperatures required for each vaccine type, from ultra-cold to
                    refrigerated.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4 rounded-lg border bg-blue-50 p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Seamless Distribution</h3>
                  <p className="text-sm text-gray-500">
                    Temperature-controlled vehicles and containers ensure cold chain integrity during transit.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4 rounded-lg border bg-blue-50 p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Quality Assurance</h3>
                  <p className="text-sm text-gray-500">
                    Continuous monitoring and validation systems protect vaccine integrity at every step.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-50">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Generate Your Bill</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Quick and easy billing for our distribution services
                </p>
              </div>
              <div className="mx-auto w-full max-w-sm space-y-2">
                <GenerateBillButton />
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-white">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:py-12 px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex flex-col gap-2 md:gap-4 lg:gap-6">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-semibold tracking-tight">Medivax Pharma</span>
            </div>
            <p className="text-sm text-gray-500">Preserving health through perfect temperature control since 2010.</p>
          </div>
          <div className="md:ml-auto grid grid-cols-2 gap-10 sm:grid-cols-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-500 hover:text-gray-900">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:text-gray-900">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Services</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-500 hover:text-gray-900">
                    Storage
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:text-gray-900">
                    Distribution
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-500 hover:text-gray-900">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:text-gray-900">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-500 hover:text-gray-900">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:text-gray-900">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t py-6">
          <div className="container flex flex-col items-center justify-between gap-4 md:flex-row px-4 md:px-6 max-w-7xl mx-auto">
            <p className="text-xs text-gray-500">© 2023 Medivax Pharma. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="text-xs text-gray-500 hover:text-gray-900">
                Privacy Policy
              </Link>
              <Link href="#" className="text-xs text-gray-500 hover:text-gray-900">
                Terms of Service
              </Link>
              <Link href="#" className="text-xs text-gray-500 hover:text-gray-900">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

