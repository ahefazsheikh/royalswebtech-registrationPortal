import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { isAdmin } from "@/lib/admin"
import { AdminRowActions } from "@/components/admin-row-actions"

export default async function AdminPage() {
  const supabase = await createServerClient()
  const admin = await isAdmin(supabase)
  if (!admin) {
    redirect("/auth/login")
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200)

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Admin Panel</h1>
          <Link className="underline" href="/admin/scan">
            Open QR Scanner
          </Link>
        </div>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <p className="text-destructive">{error.message}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="p-2">UID</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Phone</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Resume</th>
                      <th className="p-2">Created</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data || []).map((r) => (
                      <tr key={r.uid} className="border-t">
                        <td className="p-2 font-mono">{r.uid}</td>
                        <td className="p-2">{r.name}</td>
                        <td className="p-2 capitalize">{r.type}</td>
                        <td className="p-2">{r.email}</td>
                        <td className="p-2">{r.phone}</td>
                        <td className="p-2">
                          <Badge variant={r.checked_in ? "default" : "secondary"}>
                            {r.checked_in ? "Checked-in" : r.status || "new"}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {r.resume_url ? (
                            <a href={r.resume_url} className="underline" target="_blank" rel="noreferrer">
                              Open
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                        <td className="p-2">
                          <AdminRowActions uid={r.uid} checkedIn={!!r.checked_in} status={r.status || "new"} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!error && (!data || data.length === 0) ? <p className="text-muted-foreground">No records yet.</p> : null}
          </CardContent>
        </Card>
        <p className="mt-4 text-xs text-muted-foreground">
          Tip: Add Supabase and Blob env vars in the sidebar to enable full functionality.
        </p>
      </section>
    </main>
  )
}
