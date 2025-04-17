"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Database } from "lucide-react"

export default function DarkIntroductionPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Hero Section - Centered with dark background */}
      <div className="bg-[#07315A] text-white rounded-xl p-8 mb-12">
        <div className="flex flex-col items-center text-center mb-8">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NIST_Audit_Tracker_Icon-f7X3HK6U6FvhQ9XseN0uJN5yV1wE9h.png"
            alt="NIST Audit Tracker"
            width={200}
            height={200}
            className="rounded-full mb-8"
          />
          <Badge className="mb-4 bg-white text-[#07315A] hover:bg-white/90">NIST CSF 2.0</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">NIST Audit Tracker</h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl">
            A powerful browser-based utility for tracking, visualizing, and managing your NIST CSF 2.0 controls
            compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-white text-[#07315A] hover:bg-white/90"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-white border-white hover:bg-white/10"
              onClick={() => router.push("/data-management")}
            >
              Load Sample Data
              <Database className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-950 text-white border-none">
            <CardHeader>
              <CardTitle>Browser-Based Storage</CardTitle>
              <CardDescription className="text-gray-400">No external database required</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                All data is stored securely in your browser using IndexedDB, eliminating the need for external database
                connections or server setup.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-950 text-white border-none">
            <CardHeader>
              <CardTitle>NIST CSF 2.0 Compliant</CardTitle>
              <CardDescription className="text-gray-400">Built for the latest framework</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Designed specifically for the NIST Cybersecurity Framework 2.0, with support for all functions,
                categories, and subcategories.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-950 text-white border-none">
            <CardHeader>
              <CardTitle>Instant Analysis</CardTitle>
              <CardDescription className="text-gray-400">Real-time data processing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                All data processing happens instantly in your browser, providing immediate insights and visualizations
                without server-side processing.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-950 text-white border-none">
            <CardHeader>
              <CardTitle>Excel Import/Export</CardTitle>
              <CardDescription className="text-gray-400">Easy data management</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Import your existing NIST controls from Excel spreadsheets and export your data for sharing or backup
                purposes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-12 bg-gray-800" />

      {/* Data Management Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Data Management</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Browser-Based Data Storage</h3>
            <p className="text-muted-foreground mb-6">
              The NIST Audit Tracker uses IndexedDB, a powerful browser-based database system, to store all your control
              data locally in your browser. This means:
            </p>
            <ul className="space-y-3 mb-6 list-disc pl-5">
              <li>No server setup or database configuration required</li>
              <li>Your data stays on your device, enhancing privacy and security</li>
              <li>Data is retained for up to 90 days in your browser</li>
              <li>Option to clear all data at any time for privacy</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Sample Data for Testing</h3>
            <p className="text-muted-foreground mb-6">
              For convenience, the application comes with sample NIST control data that you can load as many times as
              needed for testing and exploration. This allows you to:
            </p>
            <ul className="space-y-3 list-disc pl-5">
              <li>Explore all features without entering your own data</li>
              <li>Test different scenarios and visualizations</li>
              <li>Reset to a clean state at any time</li>
            </ul>
            <div className="mt-6">
              <Button onClick={() => router.push("/data-management")} className="bg-[#07315A] hover:bg-[#07315A]/90">
                Go to Data Management
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-12 bg-gray-800" />

      {/* Visualizations Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Comprehensive Visualizations</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
          The NIST Audit Tracker provides a comprehensive dashboard with multiple tabs for different analysis
          perspectives, allowing you to gain deep insights into your compliance status.
        </p>

        <div className="bg-gray-950 text-white rounded-xl p-8">
          <h3 className="text-xl font-semibold mb-4">Dashboard Tabs</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {["Overview", "Gap Analysis", "Compliance", "Risk Analysis", "Trends"].map((tab) => (
              <div key={tab} className="bg-gray-900 rounded-lg p-4 text-center">
                <p className="font-medium">{tab}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-300 mb-6">
            Each visualization is interactive, allowing you to hover for detailed information, filter data, and gain
            deeper insights into your NIST controls compliance status.
          </p>
          <div className="flex justify-center">
            <Button onClick={() => router.push("/dashboard")} className="bg-white text-[#07315A] hover:bg-white/90">
              Explore Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-[#07315A] to-[#0A4A8B] text-white border-none">
        <CardHeader>
          <CardTitle className="text-2xl">Ready to start tracking your NIST compliance?</CardTitle>
          <CardDescription className="text-gray-200">
            Begin by loading sample data or importing your own controls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            The NIST Audit Tracker makes it easy to visualize, manage, and improve your cybersecurity controls
            compliance without complex setup or external dependencies.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" variant="secondary" onClick={() => router.push("/dashboard")}>
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-white border-white hover:bg-white/10"
            onClick={() => router.push("/data-management")}
          >
            Load Sample Data
            <Database className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
