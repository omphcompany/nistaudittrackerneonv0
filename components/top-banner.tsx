import Image from "next/image"

export function TopBanner() {
  return (
    <header className="w-full bg-[#07315A] py-4 px-6 h-24 flex-shrink-0">
      <div className="flex items-center h-full">
        <div className="flex items-center gap-5">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NIST_Audit_Tracker_Icon-f7X3HK6U6FvhQ9XseN0uJN5yV1wE9h.png"
            alt="NIST Audit Tracker Logo"
            width={80}
            height={80}
            className="rounded-full"
          />
          <div>
            <h1 className="text-3xl font-bold text-white">NIST Audit Tracker</h1>
            <p className="text-base text-white/90">
              A Utility with Browser-based Database to Report and Track NIST Controls and Remediation Status
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopBanner
