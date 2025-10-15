export function generateRegistrationId(kind: "internship" | "job" | "inquiry" | "drive") {
  const prefix = "RWT"
  const type = kind === "internship" ? "INT" : kind === "job" ? "JOB" : kind === "inquiry" ? "INQ" : "DRV"
  const now = new Date()
  const y = now.getFullYear().toString().slice(-2)
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${prefix}-${type}-${y}${m}${d}-${rand}`
}
