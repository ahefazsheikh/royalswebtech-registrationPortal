import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { generateRegistrationId } from "@/lib/id"

import QRCode from 'qrcode';

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const kindRaw = (body?.type || body?.purpose || "inquiry") as string
    const kind = ["internship", "job", "inquiry", "drive"].includes(kindRaw) ? kindRaw : "inquiry"
    const uid = generateRegistrationId(kind as "internship" | "job" | "inquiry" | "drive")

    const toNumber = (v: any) => {
      const n = Number(v)
      return Number.isFinite(n) ? n : null
    }

    const skills =
      typeof body?.skills === "string"
        ? body.skills
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : Array.isArray(body?.skills)
          ? body.skills
          : null

    const supabase = await createServerClient()

    const basePayload = {
      uid,
      type: kind,
      purpose: body?.purpose || kind,
      name: body?.name,
      email: body?.email,
      phone: body?.phone || null,
      college: body?.college || null,
      degree: body?.degree || null,
      graduation_year: toNumber(body?.graduationYear),
      experience: toNumber(body?.experienceYears ?? body?.experience),
      referred_by: body?.referredBy || null,
      notes: body?.notes || null,
      source: body?.source || null,
      drive_location: body?.driveLocation || null,
      drive_date: body?.driveDate || null,

      // Optional columns — use undefined so we can omit if not present in DB
      portfolio_url: body?.portfolioUrl ?? undefined,
      github_url: body?.githubUrl ?? undefined,
      skills: skills ?? undefined,
      resume_url: body?.resumeUrl ?? undefined,
      photo_url: body?.photoUrl ?? undefined,
    } as Record<string, any>

    const sanitize = (obj: Record<string, any>) =>
      Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined))

    // First attempt with whatever optional keys are present
    let { error } = await supabase.from("registrations").insert([sanitize(basePayload)])

    // If it fails due to a missing optional column (e.g., photo_url), retry without the known offenders
    if (error && /photo_url|portfolio_url|github_url|resume_url|skills/i.test(error.message || "")) {
      const { photo_url, portfolio_url, github_url, resume_url, skills, ...rest } = basePayload
      const retry = await supabase.from("registrations").insert([sanitize(rest)])
      error = retry.error
    }

    if (error) {
      console.log("[v0] Insert error:", error.message)
      return new NextResponse(`Database error: ${error.message}`, { status: 500 })
    }

    return NextResponse.json({ uid })
  } catch (e: any) {
    console.log("[v0] POST /registrations crashed:", e?.message)
    return new NextResponse("Failed to create registration.", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const uid = url.searchParams.get("uid")
    if (!uid) return new NextResponse("Missing uid", { status: 400 })

    const supabase = await createServerClient()
    const { data, error } = await supabase.from("registrations").select("*").eq("uid", uid).maybeSingle()

    if (error) return new NextResponse(`Database error: ${error.message}`, { status: 500 })
    if (!data) return new NextResponse("Not found", { status: 404 })

    return NextResponse.json(data)
  } catch {
    return new NextResponse("Failed to load registration.", { status: 500 })
  }
}