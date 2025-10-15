"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AdminRowActions({
  uid,
  checkedIn,
  status,
}: {
  uid: string
  checkedIn: boolean
  status: "new" | "reviewing" | "shortlisted" | "rejected" | "hired" | "checked_in" | string
}) {
  const [busy, setBusy] = useState(false)
  const [curStatus, setCurStatus] = useState(status)
  const [curChecked, setCurChecked] = useState(checkedIn)

  async function update(partial: any) {
    try {
      setBusy(true)
      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, ...partial }),
      })
      if (!res.ok) throw new Error(await res.text())
      // optimistic UI
      if (typeof partial.checked_in === "boolean") setCurChecked(partial.checked_in)
      if (typeof partial.status === "string") setCurStatus(partial.status)
    } catch (e) {
      console.error("[v0] update row failed", e)
      alert("Failed to update row")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={curChecked ? "secondary" : "default"}
        disabled={busy}
        onClick={() => update({ checked_in: !curChecked, status: !curChecked ? "checked_in" : curStatus })}
      >
        {curChecked ? "Undo Check-in" : "Check-in"}
      </Button>

      <Select value={curStatus} onValueChange={(v) => update({ status: v })} disabled={busy}>
        <SelectTrigger className="h-8 w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="reviewing">Reviewing</SelectItem>
          <SelectItem value="shortlisted">Shortlisted</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="hired">Hired</SelectItem>
          <SelectItem value="checked_in">Checked-in</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
