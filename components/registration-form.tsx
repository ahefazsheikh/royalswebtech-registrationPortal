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

// Removed 'resumeUrl' and 'photoUrl' from schema as they are now files sent in FormData, 
// not URLs sent in the initial JSON payload.
const schema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Invalid email format."),
  phone: z.string().min(8, "Phone number is required."),
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
  // File inputs are managed by state, not react-hook-form directly in this setup
})

type FormValues = z.infer<typeof schema>

export function RegistrationForm({ type }: { type: "internship" | "job" | "inquiry" }) {
  const router = useRouter()
  // Renamed 'uploading' to 'isSubmitting' for clarity, as it covers the whole process
  const [isSubmitting, setIsSubmitting] = useState(false) 
  
  // State for resume file
  const [file, setFile] = useState<File | null>(null)
  // State for photo file
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      purpose: type,
    },
  })

  // 🚨 NEW, CORRECTED SUBMISSION FUNCTION
  async function onSubmit(values: FormValues) {
    setError(null)
    setIsSubmitting(true)
    
    // 1. Create a FormData object to carry files and fields
    const formData = new FormData()
    
    // 2. Append all text/non-file fields from 'values'
    for (const key in values) {
        const value = values[key as keyof FormValues];
        
        // Skip null/undefined/empty string values
        if (value !== null && value !== undefined && value !== "") {
            // Append the key-value pair to FormData
            formData.append(key, value);
        }
    }
    
    // 3. Append the files (photo and resume) explicitly
    // The backend API route expects the keys 'photo' and 'resume'
    if (photoFile) {
        // Appending the File object
        formData.append('photo', photoFile); 
    }
    if (file) {
        // Appending the File object
        formData.append('resume', file); 
    }

    // 4. Ensure 'type' and 'purpose' are explicitly set
    formData.append('type', type);
    formData.append('purpose', type);

    // 5. Fetch call to the central API route
    try {
        const res = await fetch("/api/registrations", {
            method: "POST",
            // 🚨 CRITICAL FIX: DO NOT set the 'Content-Type' header!
            // The browser automatically sets it to 'multipart/form-data'
            body: formData, // Send the complete FormData object
        });

        if (!res.ok) {
            const errText = await res.text();
            // Display error from the backend (e.g., File upload failed for photo)
            setError(errText || "Submission failed. Please check your inputs.");
            return;
        }
        
        const data = await res.json();
        router.push(`/success/${data.uid}`);

    } catch (e: any) {
        setError("An unexpected error occurred during submission.");
        console.error(e);
    } finally {
        setIsSubmitting(false);
    }
  }
  
  // Removed old uploadToBlob, handleUpload, and toFormData functions

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
            {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...form.register("email")} required />
              {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" type="tel" {...form.register("phone")} required />
              {form.formState.errors.phone && <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>}
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
              {form.formState.errors.portfolioUrl && <p className="text-sm text-destructive">{form.formState.errors.portfolioUrl.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input id="githubUrl" {...form.register("githubUrl")} placeholder="https://github.com/..." />
              {form.formState.errors.githubUrl && <p className="text-sm text-destructive">{form.formState.errors.githubUrl.message}</p>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...form.register("notes")} rows={4} placeholder="Additional info" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="resume">Resume (PDF)</Label>
            <Input 
              id="resume" 
              type="file" 
              accept=".pdf" 
              onChange={(e) => setFile(e.target.files?.[0] ?? null)} 
            />
            <p className="text-xs text-muted-foreground">Submit a single PDF file.</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="photo">Photo (JPG/PNG)</Label>
            <Input
              id="photo"
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">Tip: Use a clear headshot. PNG or JPG.</p>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className={cn("flex items-center gap-3 pt-2")}>
            <Button type="submit" disabled={form.formState.isSubmitting || isSubmitting}>
              {form.formState.isSubmitting || isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}






// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { z } from "zod"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { Label } from "@/components/ui/label"
// import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
// import { cn } from "@/lib/utils"

// const schema = z.object({
//   name: z.string().min(2),
//   email: z.string().email(),
//   phone: z.string().min(8),
//   college: z.string().min(2).optional().or(z.literal("")),
//   degree: z.string().optional().or(z.literal("")),
//   graduationYear: z.string().optional().or(z.literal("")),
//   experienceYears: z.string().optional().or(z.literal("")),
//   purpose: z.string().min(2),
//   referredBy: z.string().optional().or(z.literal("")),
//   portfolioUrl: z.string().url().optional().or(z.literal("")),
//   githubUrl: z.string().url().optional().or(z.literal("")),
//   skills: z.string().optional().or(z.literal("")),
//   notes: z.string().optional().or(z.literal("")),
//   resumeUrl: z.string().optional(),
//   photoUrl: z.string().optional(),
// })

// type FormValues = z.infer<typeof schema>

// export function RegistrationForm({ type }: { type: "internship" | "job" | "inquiry" }) {
//   const router = useRouter()
//   const [uploading, setUploading] = useState(false)
//   const [file, setFile] = useState<File | null>(null)
//   const [photoFile, setPhotoFile] = useState<File | null>(null)
//   const [error, setError] = useState<string | null>(null)

//   const form = useForm<FormValues>({
//     resolver: zodResolver(schema),
//     defaultValues: {
//       purpose: type,
//     },
//   })

//   async function uploadToBlob(f?: File | null) {
//     if (!f) return undefined
//     try {
//       setUploading(true)
//       const res = await fetch("/api/upload", {
//         method: "POST",
//         body: (() => {
//           const fd = new FormData()
//           fd.set("file", f)
//           return fd
//         })(),
//       })
//       if (!res.ok) throw new Error("Upload failed")
//       const data = await res.json()
//       return data?.url as string | undefined
//     } catch (e: any) {
//       setError("File upload failed. You can submit without files.")
//       return undefined
//     } finally {
//       setUploading(false)
//     }
//   }

//   async function handleUpload() {
//     if (!file) return undefined
//     try {
//       setUploading(true)
//       const res = await fetch("/api/upload", {
//         method: "POST",
//         body: await toFormData(file),
//       })
//       if (!res.ok) throw new Error("Upload failed")
//       const data = await res.json()
//       return data?.url as string | undefined
//     } catch (e: any) {
//       setError("Resume upload failed. Please try again or continue without resume.")
//       return undefined
//     } finally {
//       setUploading(false)
//     }
//   }

//   function toFormData(f: File) {
//     const fd = new FormData()
//     fd.set("file", f)
//     return fd
//   }

//   async function onSubmit(values: FormValues) {
//     setError(null)

//     let resumeUrl = values.resumeUrl
//     if (file) {
//       resumeUrl = (await uploadToBlob(file)) || undefined
//     }

//     let photoUrl = values.photoUrl
//     if (photoFile) {
//       photoUrl = (await uploadToBlob(photoFile)) || undefined
//     }

//     const payload = { ...values, resumeUrl, photoUrl, type }
//     const res = await fetch("/api/registrations", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     })
//     if (!res.ok) {
//       const errText = await res.text()
//       setError(errText || "Submission failed.")
//       return
//     }
//     const data = await res.json()
//     router.push(`/success/${data.uid}`)
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="text-pretty capitalize">{type} Registration</CardTitle>
//         <CardDescription>Fill your details below. Fields marked with * are required.</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
//           <div className="grid gap-2">
//             <Label htmlFor="name">Name *</Label>
//             <Input id="name" {...form.register("name")} required />
//           </div>
//           <div className="grid gap-2 md:grid-cols-2">
//             <div className="grid gap-2">
//               <Label htmlFor="email">Email *</Label>
//               <Input id="email" type="email" {...form.register("email")} required />
//             </div>
//             <div className="grid gap-2">
//               <Label htmlFor="phone">Phone *</Label>
//               <Input id="phone" type="tel" {...form.register("phone")} required />
//             </div>
//           </div>
//           <div className="grid gap-2 md:grid-cols-2">
//             <div className="grid gap-2">
//               <Label htmlFor="college">College</Label>
//               <Input id="college" {...form.register("college")} />
//             </div>
//             <div className="grid gap-2">
//               <Label htmlFor="degree">Degree</Label>
//               <Input id="degree" {...form.register("degree")} placeholder="B.Tech, M.Sc, etc." />
//             </div>
//           </div>
//           <div className="grid gap-2 md:grid-cols-3">
//             <div className="grid gap-2">
//               <Label htmlFor="graduationYear">Graduation Year</Label>
//               <Input id="graduationYear" {...form.register("graduationYear")} placeholder="2025" />
//             </div>
//             <div className="grid gap-2">
//               <Label htmlFor="experienceYears">Experience (years)</Label>
//               <Input id="experienceYears" {...form.register("experienceYears")} placeholder="0" />
//             </div>
//             <div className="grid gap-2">
//               <Label htmlFor="purpose">Purpose *</Label>
//               <Select defaultValue={type} onValueChange={(v) => form.setValue("purpose", v)}>
//                 <SelectTrigger id="purpose">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="internship">Internship</SelectItem>
//                   <SelectItem value="job">Job</SelectItem>
//                   <SelectItem value="inquiry">Inquiry</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <div className="grid gap-2 md:grid-cols-2">
//             <div className="grid gap-2">
//               <Label htmlFor="referredBy">Referred By</Label>
//               <Input id="referredBy" {...form.register("referredBy")} />
//             </div>
//             <div className="grid gap-2">
//               <Label htmlFor="skills">Key Skills</Label>
//               <Input id="skills" {...form.register("skills")} placeholder="React, Node, SQL" />
//             </div>
//           </div>

//           <div className="grid gap-2 md:grid-cols-2">
//             <div className="grid gap-2">
//               <Label htmlFor="portfolioUrl">Portfolio URL</Label>
//               <Input id="portfolioUrl" {...form.register("portfolioUrl")} placeholder="https://..." />
//             </div>
//             <div className="grid gap-2">
//               <Label htmlFor="githubUrl">GitHub URL</Label>
//               <Input id="githubUrl" {...form.register("githubUrl")} placeholder="https://github.com/..." />
//             </div>
//           </div>

//           <div className="grid gap-2">
//             <Label htmlFor="notes">Notes</Label>
//             <Textarea id="notes" {...form.register("notes")} rows={4} placeholder="Additional info" />
//           </div>

//           <div className="grid gap-2">
//             <Label htmlFor="resume">Resume (PDF)</Label>
//             <Input id="resume" type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
//             <p className="text-xs text-muted-foreground">
//               Uploads use Vercel Blob. If disabled, you can submit without a file.
//             </p>
//           </div>

//           <div className="grid gap-2">
//             <Label htmlFor="photo">Photo (JPG/PNG)</Label>
//             <Input
//               id="photo"
//               type="file"
//               accept="image/jpeg,image/png"
//               onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
//             />
//             <p className="text-xs text-muted-foreground">Tip: Use a clear headshot. PNG or JPG up to ~5MB.</p>
//           </div>

//           {error ? <p className="text-sm text-destructive">{error}</p> : null}

//           <div className={cn("flex items-center gap-3 pt-2")}>
//             <Button type="submit" disabled={form.formState.isSubmitting || uploading}>
//               {form.formState.isSubmitting ? "Submitting..." : "Submit"}
//             </Button>
//           </div>
//         </form>
//       </CardContent>
//     </Card>
//   )
// }
