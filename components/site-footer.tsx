import Link from "next/link"
import Image from "next/image"

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-4">
        <div className="col-span-2 flex items-start gap-3">
          <Image src="/images/rwtlogo.png" alt="Royals Webtech Pvt. Ltd. logo" width={160} height={28} />
          <p className="text-sm text-muted-foreground">
            Royals Webtech Pvt. Ltd. — building reliable, high-quality digital solutions.
          </p>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold">Explore</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link className="hover:underline" href="/register/internship">
                Internship
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/register/job">
                Job
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/register/inquiry">
                Inquiry
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold">Company</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link
                className="hover:underline"
                href="https://www.royalswebtechpvtltd.com"
                target="_blank"
                rel="noreferrer"
              >
                Website
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="#">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="#">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Royals Webtech Pvt. Ltd.
      </div>
    </footer>
  )
}
