import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ControlsLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            <Skeleton className="h-9 w-64" />
          </h1>
          <Skeleton className="h-5 w-96" />
        </div>
      </div>

      {/* Search and filter skeletons */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <Skeleton className="h-10 w-full md:w-1/3" />
        <Skeleton className="h-10 w-full md:w-1/3" />
        <Skeleton className="h-10 w-full md:w-1/3" />
      </div>

      {/* Controls table skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
