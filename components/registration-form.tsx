"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  college: z.string().min(2).optional().or(z.literal("")),
  degree: z.string().optional().or(z.literal("")),
  graduationYear: z.string().optional().or(z.literal("")),
  experienceYears: z.string().optional().or(z.literal("")),
  purpose: z.string().min(2),
  referredBy: z.string().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  skills: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  resumeUrl: z.string().optional(),
  photoUrl: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function RegistrationForm({ type }: { type: "internship" | "job" | "inquiry" }) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      purpose: type,
    },
  })

  async function uploadToBlob(f?: File | null) {
    if (!f) return undefined
    try {
      setUploading(true)
      const res = await fetch("/api/upload", {
        method: "POST",
        body: (() => {
          const fd = new FormData()
          fd.set("file", f)
          return fd
        })(),
      })
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()
      return data?.url as string | undefined
    } catch (e: any) {
      setError("File upload failed. You can submit without files.")
      return undefined
    } finally {
      setUploading(false)
    }
  }

  async function handleUpload() {
    if (!file) return undefined
    try {
      setUploading(true)
      const res = await fetch("/api/upload", {
        method: "POST",
        body: await toFormData(file),
      })
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()
      return data?.url as string | undefined
    } catch (e: any) {
      setError("Resume upload failed. Please try again or continue without resume.")
      return undefined
    } finally {
      setUploading(false)
    }
  }

  function toFormData(f: File) {
    const fd = new FormData()
    fd.set("file", f)
    return fd
  }

  async function onSubmit(values: FormValues) {
    setError(null)

    let resumeUrl = values.resumeUrl
    if (file) {
      resumeUrl = (await uploadToBlob(file)) || undefined
    }

    let photoUrl = values.photoUrl
    if (photoFile) {
      photoUrl = (await uploadToBlob(photoFile)) || undefined
    }

    const payload = { ...values, resumeUrl, photoUrl, type }
    const res = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const errText = await res.text()
      setError(errText || "Submission failed.")
      return
    }
    const data = await res.json()
    router.push(`/success/${data.uid}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-pretty capitalize">{type} Registration</CardTitle>
        <CardDescription>Fill your details below. Fields marked with * are required.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...form.register("name")} required />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...form.register("email")} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" type="tel" {...form.register("phone")} required />
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="college">College</Label>
              <Input id="college" {...form.register("college")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="degree">Degree</Label>
              <Input id="degree" {...form.register("degree")} placeholder="B.Tech, M.Sc, etc." />
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="graduationYear">Graduation Year</Label>
              <Input id="graduationYear" {...form.register("graduationYear")} placeholder="2025" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="experienceYears">Experience (years)</Label>
              <Input id="experienceYears" {...form.register("experienceYears")} placeholder="0" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="purpose">Purpose *</Label>
              <Select defaultValue={type} onValueChange={(v) => form.setValue("purpose", v)}>
                <SelectTrigger id="purpose">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="job">Job</SelectItem>
                  <SelectItem value="inquiry">Inquiry</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="referredBy">Referred By</Label>
              <Input id="referredBy" {...form.register("referredBy")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="skills">Key Skills</Label>
              <Input id="skills" {...form.register("skills")} placeholder="React, Node, SQL" />
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="portfolioUrl">Portfolio URL</Label>
              <Input id="portfolioUrl" {...form.register("portfolioUrl")} placeholder="https://..." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input id="githubUrl" {...form.register("githubUrl")} placeholder="https://github.com/..." />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...form.register("notes")} rows={4} placeholder="Additional info" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="resume">Resume (PDF)</Label>
            <Input id="resume" type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <p className="text-xs text-muted-foreground">
              Uploads use Vercel Blob. If disabled, you can submit without a file.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="photo">Photo (JPG/PNG)</Label>
            <Input
              id="photo"
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">Tip: Use a clear headshot. PNG or JPG up to ~5MB.</p>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className={cn("flex items-center gap-3 pt-2")}>
            <Button type="submit" disabled={form.formState.isSubmitting || uploading}>
              {form.formState.isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
