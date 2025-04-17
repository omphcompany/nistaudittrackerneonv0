"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  Database,
  FileSpreadsheet,
  Cloud,
  LineChart,
  PieChart,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Users,
  Globe,
} from "lucide-react"

export default function IntroductionPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("features")

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 py-8">
        <div className="flex-1">
          <Badge className="mb-4 bg-[#07315A] hover:bg-[#07315A]/90">NIST CSF 2.0</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">NIST Audit Tracker</h1>
          <p className="text-xl text-muted-foreground mb-6">
            A powerful cloud-based utility for tracking, visualizing, and managing your NIST CSF 2.0 controls compliance
            across all your devices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-[#07315A] hover:bg-[#07315A]/90" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/data-management")}>
              Load Sample Data
              <Database className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-md">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NIST_Audit_Tracker_Icon-f7X3HK6U6FvhQ9XseN0uJN5yV1wE9h.png"
              alt="NIST Audit Tracker"
              width={300}
              height={300}
              className="rounded-xl shadow-xl mx-auto"
            />
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="features" className="w-full mb-12" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-black">
          <TabsTrigger
            value="features"
            className="text-white hover:bg-[#035FBC] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Key Features
          </TabsTrigger>
          <TabsTrigger
            value="data"
            className="text-white hover:bg-[#035FBC] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Data Management
          </TabsTrigger>
          <TabsTrigger
            value="visualizations"
            className="text-white hover:bg-[#035FBC] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Visualizations
          </TabsTrigger>
        </TabsList>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <Cloud className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Cloud-Based Storage</CardTitle>
                <CardDescription>Powered by Neon Serverless PostgreSQL</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All data is stored securely in Neon Serverless PostgreSQL, enabling seamless access across all your
                  devices and real-time synchronization.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Multi-Device Access</CardTitle>
                <CardDescription>Access from anywhere</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access and update your NIST controls from any device with an internet connection. All changes are
                  synchronized in real-time.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>NIST CSF 2.0 Compliant</CardTitle>
                <CardDescription>Built for the latest framework</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Designed specifically for the NIST Cybersecurity Framework 2.0, with support for all functions,
                  categories, and subcategories.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Real-Time Analysis</CardTitle>
                <CardDescription>Instant data processing</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All data processing happens instantly, providing immediate insights and visualizations that reflect
                  the latest updates from any device.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <Globe className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Seamless Collaboration</CardTitle>
                <CardDescription>Work together effectively</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Multiple team members can access and update the same data simultaneously, with changes reflected
                  across all devices in real-time.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <FileSpreadsheet className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Excel Import/Export</CardTitle>
                <CardDescription>Easy data management</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Import your existing NIST controls from Excel spreadsheets and export your data for sharing or backup
                  purposes.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Management Tab */}
        <TabsContent value="data" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Cloud-Based Data Storage</h2>
              <p className="text-muted-foreground mb-4">
                The NIST Audit Tracker uses Neon Serverless PostgreSQL, a powerful cloud database system, to store all
                your control data securely in the cloud. This means:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Access your data from any device with an internet connection</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>All changes are synchronized in real-time across devices</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Your data is securely backed up and always available</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Collaborate with team members on the same dataset</span>
                </li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Sample Data for Testing</h3>
              <p className="text-muted-foreground mb-4">
                For convenience, the application comes with sample NIST control data that you can load as many times as
                needed for testing and exploration. This allows you to:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Explore all features without entering your own data</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Test different scenarios and visualizations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Reset to a clean state at any time</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Data Modification & Updates</h2>
              <p className="text-muted-foreground mb-4">
                All data can be modified directly in the application, with changes immediately synchronized to the cloud
                and reflected across all devices:
              </p>

              <div className="space-y-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Edit Controls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Update control details, compliance status, and remediation progress directly in the Controls
                      Explorer. Changes are instantly saved to the cloud.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Real-Time Synchronization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      All charts, graphs, and reports update instantly when you or your team members modify control
                      data, providing immediate feedback across all devices.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Import & Export</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Import data from Excel spreadsheets directly to the cloud database or export your current data for
                      backup or sharing purposes.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={() => router.push("/data-management")}
                  className="bg-[#07315A] hover:bg-[#07315A]/90"
                >
                  Go to Data Management
                  <Database className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Visualizations Tab */}
        <TabsContent value="visualizations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <PieChart className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Compliance Overview</CardTitle>
                <CardDescription>Track overall compliance status</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Interactive pie and donut charts showing the distribution of compliant vs. non-compliant controls,
                  with detailed breakdowns.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Gap Analysis</CardTitle>
                <CardDescription>Identify compliance gaps</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Vertical and horizontal bar charts highlighting gaps in your NIST controls implementation, with
                  drill-down capabilities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <LineChart className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Trend Analysis</CardTitle>
                <CardDescription>Track progress over time</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Line and area charts showing remediation progress and compliance improvements over time, with
                  projections.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Interactive Dashboard Experience</h2>
            <p className="text-muted-foreground mb-6">
              The NIST Audit Tracker provides a comprehensive dashboard with multiple tabs for different analysis
              perspectives:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {["Overview", "Gap Analysis", "Compliance", "Risk Analysis", "Trends"].map((tab) => (
                <Card key={tab} className="bg-white dark:bg-gray-800">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{tab}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <p className="text-muted-foreground mb-6">
              Each visualization is interactive, allowing you to hover for detailed information, filter data, and gain
              deeper insights into your NIST controls compliance status.
            </p>

            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={() => router.push("/dashboard")}
                className="bg-[#07315A] hover:bg-[#07315A]/90"
              >
                Explore Dashboard
                <BarChart3 className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-[#07315A] to-[#0A4A8B] text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Ready to start tracking your NIST compliance?</CardTitle>
          <CardDescription className="text-gray-200">
            Begin by loading sample data or importing your own controls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            The NIST Audit Tracker makes it easy to visualize, manage, and improve your cybersecurity controls
            compliance with cloud-based storage for seamless access across all your devices.
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
            className="text-black border-white hover:bg-yellow-200"
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
