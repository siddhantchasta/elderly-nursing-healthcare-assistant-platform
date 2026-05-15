import Link from "next/link";

export default function AuthShell({ 
  title, 
  subtitle, 
  children 
}: { 
  title: string; 
  subtitle: string; 
  children: React.ReactNode 
}) {
  return (
    <main className="flex min-h-screen bg-background">
      {/* Left Panel - Branding */}
      <div className="hidden w-1/2 bg-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="text-2xl font-semibold tracking-tight text-primary-foreground">
          HarmonyCare
        </Link>
        
        <div className="space-y-6">
          <blockquote className="text-xl font-medium leading-relaxed text-primary-foreground/90">
            &ldquo;The care my mother receives has given our entire family peace of mind. 
            The caregivers are not just professionals — they&apos;ve become part of our family.&rdquo;
          </blockquote>
          <div>
            <p className="font-medium text-primary-foreground">Margaret Chen</p>
            <p className="text-sm text-primary-foreground/70">Family Member, San Francisco</p>
          </div>
        </div>

        <div className="flex items-center gap-8 text-sm text-primary-foreground/70">
          <div>
            <p className="text-2xl font-semibold text-primary-foreground">2,000+</p>
            <p>Families Served</p>
          </div>
          <div className="h-10 w-px bg-primary-foreground/20" />
          <div>
            <p className="text-2xl font-semibold text-primary-foreground">98%</p>
            <p>Satisfaction Rate</p>
          </div>
          <div className="h-10 w-px bg-primary-foreground/20" />
          <div>
            <p className="text-2xl font-semibold text-primary-foreground">24/7</p>
            <p>Support Available</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <Link href="/" className="mb-10 block text-xl font-semibold tracking-tight text-primary lg:hidden">
            HarmonyCare
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="mt-2 text-muted-foreground">{subtitle}</p>
          </div>

          {children}

          <p className="mt-10 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
