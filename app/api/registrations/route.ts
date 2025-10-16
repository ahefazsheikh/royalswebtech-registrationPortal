// app/api/registrations/route.ts

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { generateRegistrationId } from "@/lib/id"
import { createTransport } from 'nodemailer'
import * as QRCode from 'qrcode';

// ----------------------------------------------------------------------------------
// 🚨 SERVER-SIDE CLIENTS SETUP
// These clients securely use Environment Variables (already set on Render)
// ----------------------------------------------------------------------------------

// Client for secure, privileged operations (like file uploads)
const supabaseServerClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // 🚨 Using the secure Service Role Key
    { auth: { persistSession: false } }
);

// Client for standard database inserts (can use Anon key)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- EMAIL UTILITY ---
const transporter = createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const createConfirmationEmail = (name: string, uid: string, qrCodeDataUrl: string) => {
    return `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>Dear ${name},</h2>
          <p>Thank you for registering. Your unique ID is: <strong>${uid}</strong></p>
          <p>Please present the QR code below for check-in:</p>
          <img src="${qrCodeDataUrl}" alt="Registration QR Code" style="width: 150px; height: 150px; display: block; margin: 10px 0;"/>
          <p>We look forward to reviewing your submission.</p>
        </body>
      </html>
    `;
};
// ----------------------------------------------------------------------------------

export async function POST(req: Request) {
    let registration: any = null; // Declare registration variable here

    try {
        // 🚨 FIX: Read form data (multipart/form-data) instead of JSON
        const formData = await req.formData();

        // 1. Extract fields and files
        const kindRaw = (formData.get('type') || formData.get('purpose') || "inquiry") as string;
        const kind = ["internship", "job", "inquiry", "drive"].includes(kindRaw) ? kindRaw : "inquiry";
        const uid = generateRegistrationId(kind as "internship" | "job" | "inquiry" | "drive");

        const photoFile = formData.get('photo') as File | null;
        const resumeFile = formData.get('resume') as File | null;

        const toNumber = (v: any) => {
            const n = Number(v)
            return Number.isFinite(n) ? n : null
        }
        
        // --- 2. File Upload Logic ---
        const uploadFile = async (file: File | null, type: 'photo' | 'resume') => {
            if (!file || file.size === 0) return null;
            const extension = file.name.split('.').pop();
            const path = `submissions/${uid}/${type}.${extension}`;
            
            // Convert File object to Buffer
            const buffer = Buffer.from(await file.arrayBuffer()); 
            
            const { error: uploadError } = await supabaseServerClient.storage // Use server client
                .from('uploads') // 🚨 REPLACE 'uploads' WITH YOUR ACTUAL SUPABASE BUCKET NAME
                .upload(path, buffer, { contentType: file.type, upsert: true });
                
            if (uploadError) {
                console.error(`Error uploading ${type}:`, uploadError);
                // Throwing an error here triggers the catch block and the "File Upload failed" message
                throw new Error(`File upload failed for ${type}.`);
            }
            return path;
        };

        let photo_path: string | null = null;
        let resume_path: string | null = null;
        
        try {
            photo_path = await uploadFile(photoFile, 'photo');
            resume_path = await uploadFile(resumeFile, 'resume');
        } catch (uploadError: any) {
            // Return specific file error response
            return new NextResponse(uploadError.message, { status: 500 });
        }
        
        // --- 3. Database Insert ---
        const skills =
            typeof formData.get('skills') === "string"
            ? (formData.get('skills') as string).split(',').map((s: string) => s.trim()).filter(Boolean)
            : null;

        const basePayload = {
            uid,
            type: kind,
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone') || null,
            college: formData.get('college') || null,
            experience: toNumber(formData.get('experienceYears') || formData.get('experience')),
            referred_by: formData.get('referredBy') || null,
            status: 'New', // 🚨 New Feature: Initial status for Admin Panel
            
            // Use file paths instead of file URLs
            photo_path: photo_path, 
            resume_path: resume_path,
            
            // Map JSON keys to FormData keys
            purpose: formData.get('purpose') || kind,
            degree: formData.get('degree') || null,
            graduation_year: toNumber(formData.get('graduationYear')),
            notes: formData.get('notes') || null,
            source: formData.get('source') || null,
            drive_location: formData.get('driveLocation') || null,
            drive_date: formData.get('driveDate') || null,
            portfolio_url: formData.get('portfolioUrl') ?? undefined,
            github_url: formData.get('githubUrl') ?? undefined,
            skills: skills ?? undefined,
        } as Record<string, any>;

        const sanitize = (obj: Record<string, any>) =>
            Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined))

        let { data, error } = await supabase.from("registrations").insert([sanitize(basePayload)]).select().single();
        registration = data; // Assign to outer variable for email access
        
        if (error) {
            console.log("[v0] Insert error:", error.message)
            return new NextResponse(`Database error: ${error.message}`, { status: 500 })
        }

        // --- 4. Email Sending Logic ---
        try {
            const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/verify?uid=${uid}`;
            const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, scale: 4 });
            
            await transporter.sendMail({
                from: `"Royals Webtech Portal" <${process.env.EMAIL_USER}>`,
                to: registration.email,
                subject: `Registration Confirmed: Your Unique ID ${uid}`,
                html: createConfirmationEmail(registration.name, uid, qrCodeDataUrl),
            });
            console.log(`Confirmation email sent to ${registration.email}`)

        } catch (emailError) {
            console.warn("Failed to send confirmation email:", emailError);
            // Non-critical failure: log and continue to success response
        }

        return NextResponse.json({ uid });

    } catch (e: any) {
        console.log("[v0] POST /registrations crashed:", e?.message)
        // If the crash was an internal failure, return a general error
        return new NextResponse(`Failed to create registration: ${e?.message}`, { status: 500 })
    }
}

// ----------------------------------------------------------------------------------
// GET function remains the same
// ----------------------------------------------------------------------------------

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const uid = url.searchParams.get("uid")
    if (!uid) return new NextResponse("Missing uid", { status: 400 })

    const { data, error } = await supabase.from("registrations").select("*").eq("uid", uid).maybeSingle()

    if (error) return new NextResponse(`Database error: ${error.message}`, { status: 500 })
    if (!data) return new NextResponse("Not found", { status: 404 })

    return NextResponse.json(data)
  } catch {
    return new NextResponse("Failed to load registration.", { status: 500 })
  }
}