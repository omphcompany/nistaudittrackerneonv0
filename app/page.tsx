import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to introduction page
  redirect("/introduction")
}
