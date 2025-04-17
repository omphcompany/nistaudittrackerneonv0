"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Database,
  Shield,
  Zap,
  FileSpreadsheet,
  BarChart3,
  Cloud,
  Lock,
  Users,
  RefreshCw,
} from "lucide-react"

export default function IntroductionPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Hero Section - More visually striking with gradient background */}
      <div className="rounded-xl overflow-hidden mb-12 shadow-lg">
        <div className="bg-gradient-to-r from-[#07315A] to-[#0A4A8B] text-white p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-2/3 order-2 md:order-1">
              <Badge className="mb-4 bg-white text-[#07315A] hover:bg-white/90 text-sm px-3 py-1">NIST CSF 2.0</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">NIST Audit Tracker</h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl">
                A powerful cloud-based utility for tracking, visualizing, and managing your NIST CSF 2.0 controls
                compliance.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => router.push("/dashboard")}
                  className="bg-white text-[#07315A] hover:bg-white/90 font-medium"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  onClick={() => router.push("/data-management")}
                  className="bg-[#0A4A8B] hover:bg-[#0A4A8B]/90 text-white border border-white font-medium"
                >
                  Load Sample Data
                  <Database className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="md:w-1/3 flex justify-center order-1 md:order-2">
              <div className="bg-white/10 p-4 rounded-full">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NIST_Audit_Tracker_Icon-f7X3HK6U6FvhQ9XseN0uJN5yV1wE9h.png"
                  alt="NIST Audit Tracker"
                  width={220}
                  height={220}
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Section - More visually appealing with icons */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-l-4 border-l-[#07315A] shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-[#07315A]/20 p-3 rounded-full">
                <Cloud className="h-8 w-8 text-[#07315A]" />
              </div>
              <div>
                <CardTitle>Cloud-Based Storage</CardTitle>
                <CardDescription>Powered by Neon Serverless PostgreSQL</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#07315A]"></div>
                  <span>Secure cloud storage with automatic backups</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#07315A]"></div>
                  <span>Enterprise-grade security with encrypted connections</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#07315A]"></div>
                  <span>Automatic scaling to handle growing data needs</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#07315A] shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-[#07315A]/20 p-3 rounded-full">
                <Shield className="h-8 w-8 text-[#07315A]" />
              </div>
              <div>
                <CardTitle>NIST CSF 2.0 Compliant</CardTitle>
                <CardDescription>Built for the latest framework</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#07315A]"></div>
                  <span>Support for all functions, categories, and subcategories</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#07315A]"></div>
                  <span>Comprehensive tracking of control implementation status</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#07315A]"></div>
                  <span>Detailed compliance reporting and analysis</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#07315A] shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-[#07315A]/20 p-3 rounded-full">
                <Zap className="h-8 w-8 text-[#07315A]" />
              </div>
              <div>
                <CardTitle>Instant Analysis</CardTitle>
                <CardDescription>Real-time data processing</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#07315A]"></div>
                  <span>Server-side optimization for fast performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#07315A]"></div>
                  <span>Immediate insights with efficient data queries</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#07315A]"></div>
                  <span>Real-time updates across all visualizations</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#07315A] shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-[#07315A]/20 p-3 rounded-full">
                <FileSpreadsheet className="h-8 w-8 text-[#07315A]" />
              </div>
              <div>
                <CardTitle>Excel Import/Export</CardTitle>
                <CardDescription>Easy data management</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#07315A]"></div>
                  <span>Import existing NIST controls from spreadsheets</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#07315A]"></div>
                  <span>Export data for sharing or backup purposes</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#07315A]"></div>
                  <span>Edit control details directly in the Controls Explorer</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cloud Benefits Section - New visually appealing section */}
      <div className="mb-16 bg-gradient-to-r from-[#07315A]/5 to-[#0A4A8B]/5 rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-8 text-center">Cloud Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-md flex flex-col items-center text-center">
            <div className="bg-[#07315A]/20 p-4 rounded-full mb-4">
              <RefreshCw className="h-10 w-10 text-[#07315A]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Sync</h3>
            <p className="text-muted-foreground">
              Synchronize data across all devices and users in real-time, ensuring everyone has access to the latest
              information.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md flex flex-col items-center text-center">
            <div className="bg-[#07315A]/20 p-4 rounded-full mb-4">
              <Lock className="h-10 w-10 text-[#07315A]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Enterprise Security</h3>
            <p className="text-muted-foreground">
              Protect your sensitive compliance data with enterprise-grade security, encryption, and automatic backups.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md flex flex-col items-center text-center">
            <div className="bg-[#07315A]/20 p-4 rounded-full mb-4">
              <Users className="h-10 w-10 text-[#07315A]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Multi-User Access</h3>
            <p className="text-muted-foreground">
              Enable team collaboration with simultaneous access for multiple users, with role-based permissions.
            </p>
          </div>
        </div>
      </div>

      {/* Visualizations Section - More visually appealing */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Comprehensive Visualizations</h2>
        <p className="text-lg text-muted-foreground mb-8 text-center max-w-3xl mx-auto">
          Gain deep insights into your compliance status with multiple dashboard views for different analysis
          perspectives.
        </p>

        <Card className="shadow-lg border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-[#07315A] to-[#0A4A8B] text-white p-6">
            <div className="flex items-center gap-4">
              <BarChart3 className="h-8 w-8" />
              <CardTitle className="text-white text-2xl">Dashboard Views</CardTitle>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {[
                { name: "Overview", description: "Compliance status and distribution" },
                { name: "Gap Analysis", description: "Identify implementation gaps" },
                { name: "Compliance", description: "Detailed compliance metrics" },
                { name: "Risk Analysis", description: "Risk exposure visualization" },
                { name: "Trends", description: "Progress over time" },
              ].map((tab) => (
                <div
                  key={tab.name}
                  className="bg-[#07315A]/5 rounded-lg p-4 text-center hover:bg-[#07315A]/10 transition-colors"
                >
                  <p className="font-semibold mb-2">{tab.name}</p>
                  <p className="text-xs text-muted-foreground">{tab.description}</p>
                </div>
              ))}
            </div>
            <p className="mb-6 text-center">
              Interactive visualizations allow you to filter data and gain deeper insights into your NIST controls
              compliance status.
            </p>
            <div className="flex justify-center">
              <Button
                onClick={() => router.push("/dashboard")}
                className="bg-[#07315A] hover:bg-[#07315A]/90 text-white"
                size="lg"
              >
                Explore Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Details Section - More visually appealing */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Technical Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-[#07315A]/5 border-b">
              <CardTitle>Modern Technology Stack</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="bg-[#07315A]/10 p-2 rounded-full">
                    <div className="h-3 w-3 rounded-full bg-[#07315A]"></div>
                  </div>
                  <span>Built with Next.js and React</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-[#07315A]/10 p-2 rounded-full">
                    <div className="h-3 w-3 rounded-full bg-[#07315A]"></div>
                  </div>
                  <span>Neon Serverless PostgreSQL for cloud database storage</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-[#07315A]/10 p-2 rounded-full">
                    <div className="h-3 w-3 rounded-full bg-[#07315A]"></div>
                  </div>
                  <span>Uses Recharts for data visualization</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-[#07315A]/10 p-2 rounded-full">
                    <div className="h-3 w-3 rounded-full bg-[#07315A]"></div>
                  </div>
                  <span>Tailwind CSS for styling</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-[#07315A]/5 border-b">
              <CardTitle>Database Architecture</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="bg-[#07315A]/10 p-2 rounded-full">
                    <div className="h-3 w-3 rounded-full bg-[#07315A]"></div>
                  </div>
                  <span>Serverless PostgreSQL database hosted on Neon</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-[#07315A]/10 p-2 rounded-full">
                    <div className="h-3 w-3 rounded-full bg-[#07315A]"></div>
                  </div>
                  <span>Automatic scaling based on workload</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-[#07315A]/10 p-2 rounded-full">
                    <div className="h-3 w-3 rounded-full bg-[#07315A]"></div>
                  </div>
                  <span>Connection pooling for optimal performance</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-[#07315A]/10 p-2 rounded-full">
                    <div className="h-3 w-3 rounded-full bg-[#07315A]"></div>
                  </div>
                  <span>Branching capability for development and testing</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Call to Action - More visually striking */}
      <div className="rounded-xl overflow-hidden shadow-xl">
        <div className="bg-gradient-to-r from-[#07315A] to-[#0A4A8B] text-white p-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to start tracking your NIST compliance?</h2>
            <p className="text-xl text-white/80 mb-8">
              Begin by loading sample data or importing your own controls to experience the power of cloud-based
              compliance management.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" onClick={() => router.push("/dashboard")} className="font-medium">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                className="bg-[#0A4A8B] hover:bg-[#0A4A8B]/90 text-white border border-white font-medium"
                onClick={() => router.push("/data-management")}
              >
                Load Sample Data
                <Database className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
