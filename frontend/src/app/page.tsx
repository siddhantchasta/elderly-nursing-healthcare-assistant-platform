import Link from "next/link";

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-sm">HC</span>
          </div>
          <span className="font-semibold text-foreground tracking-tight">HarmonyCare</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Services</a>
          <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
          <a href="#process" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition-colors">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-medium text-primary mb-4 tracking-wide uppercase">Trusted by 2,000+ families nationwide</p>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground leading-tight tracking-tight text-balance">
          Compassionate care for your loved ones
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Professional in-home nursing and healthcare assistance for seniors. 
          We match your family with vetted, experienced caregivers who treat your loved ones like their own.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium text-base hover:bg-primary/90 transition-colors">
            Find a Caregiver
          </Link>
          <Link href="/login" className="w-full sm:w-auto border border-border text-foreground px-8 py-4 rounded-full font-medium text-base hover:bg-secondary transition-colors">
            Family Portal
          </Link>
        </div>
      </div>
    </section>
  );
}

function TrustBadges() {
  return (
    <section className="py-12 px-6 border-y border-border bg-card">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-sm text-muted-foreground mb-8">Accredited and recognized by</p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          <div className="text-muted-foreground/60 font-semibold tracking-tight">Joint Commission</div>
          <div className="text-muted-foreground/60 font-semibold tracking-tight">NAHC</div>
          <div className="text-muted-foreground/60 font-semibold tracking-tight">Medicare Certified</div>
          <div className="text-muted-foreground/60 font-semibold tracking-tight">State Licensed</div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const services = [
    {
      title: "Personal Care",
      description: "Bathing, grooming, dressing, and mobility assistance with dignity and respect.",
    },
    {
      title: "Skilled Nursing",
      description: "Medication management, wound care, and chronic condition monitoring by RNs and LPNs.",
    },
    {
      title: "Companion Care",
      description: "Meaningful companionship, conversation, and engagement in daily activities.",
    },
    {
      title: "Memory Care",
      description: "Specialized support for seniors with Alzheimer&apos;s, dementia, and cognitive challenges.",
    },
    {
      title: "Respite Care",
      description: "Temporary relief for family caregivers while ensuring continuity of care.",
    },
    {
      title: "24-Hour Care",
      description: "Round-the-clock support for seniors who need constant assistance and supervision.",
    },
  ];

  return (
    <section id="services" className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3 tracking-wide uppercase">Our Services</p>
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight text-balance">
            Care tailored to every need
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.title} className="bg-card border border-border rounded-2xl p-8 hover:border-primary/30 transition-colors">
              <h3 className="text-xl font-semibold text-card-foreground mb-3">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="py-24 px-6 bg-secondary">
      <div className="mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm font-medium text-primary mb-3 tracking-wide uppercase">Why HarmonyCare</p>
            <h2 className="text-4xl md:text-5xl font-semibold text-secondary-foreground tracking-tight leading-tight">
              Built on decades of healthcare expertise
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed text-lg">
              Our founders spent 25 years in geriatric medicine before starting HarmonyCare. 
              We understand that choosing a caregiver is one of the most important decisions a family makes.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Every caregiver undergoes thorough background checks, skills assessments, and ongoing training. 
              We maintain a 1:3 caregiver-to-patient ratio for personalized attention.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-2xl p-8 border border-border">
              <div className="text-4xl font-semibold text-primary">98%</div>
              <p className="mt-2 text-sm text-muted-foreground">Family satisfaction rate</p>
            </div>
            <div className="bg-card rounded-2xl p-8 border border-border">
              <div className="text-4xl font-semibold text-primary">500+</div>
              <p className="mt-2 text-sm text-muted-foreground">Certified caregivers</p>
            </div>
            <div className="bg-card rounded-2xl p-8 border border-border">
              <div className="text-4xl font-semibold text-primary">15yr</div>
              <p className="mt-2 text-sm text-muted-foreground">Average experience</p>
            </div>
            <div className="bg-card rounded-2xl p-8 border border-border">
              <div className="text-4xl font-semibold text-primary">24/7</div>
              <p className="mt-2 text-sm text-muted-foreground">Support available</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const steps = [
    {
      number: "01",
      title: "Initial Consultation",
      description: "We assess your loved one&apos;s needs, preferences, and medical requirements through a detailed conversation.",
    },
    {
      number: "02",
      title: "Caregiver Matching",
      description: "Our care coordinators match you with caregivers based on skills, personality, and availability.",
    },
    {
      number: "03",
      title: "Meet and Greet",
      description: "Arrange an introduction to ensure compatibility before care begins. No obligation to proceed.",
    },
    {
      number: "04",
      title: "Care Begins",
      description: "Your caregiver starts providing personalized care with ongoing supervision and family updates.",
    },
  ];

  return (
    <section id="process" className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3 tracking-wide uppercase">The Process</p>
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight text-balance">
            Getting started is simple
          </h2>
        </div>
        <div className="space-y-0">
          {steps.map((step, index) => (
            <div key={step.number} className={`flex gap-8 py-8 ${index !== steps.length - 1 ? 'border-b border-border' : ''}`}>
              <div className="text-3xl font-semibold text-muted-foreground/40">{step.number}</div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-xl">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialSection() {
  return (
    <section className="py-24 px-6 bg-primary">
      <div className="mx-auto max-w-4xl text-center">
        <blockquote className="text-2xl md:text-3xl font-medium text-primary-foreground leading-relaxed">
          &ldquo;After my mother&apos;s stroke, we were overwhelmed. HarmonyCare matched us with Sarah, 
          who has been with us for three years. She&apos;s not just a caregiver—she&apos;s family now.&rdquo;
        </blockquote>
        <div className="mt-8">
          <p className="text-primary-foreground font-medium">Margaret Chen</p>
          <p className="text-primary-foreground/70 text-sm">San Francisco, CA</p>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight text-balance">
          Ready to find the right care?
        </h2>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
          Schedule a free consultation with our care coordinators. 
          No commitment required—just a conversation about what&apos;s best for your family.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium text-base hover:bg-primary/90 transition-colors">
            Schedule Consultation
          </Link>
          <a href="tel:+18005551234" className="w-full sm:w-auto text-foreground font-medium">
            or call (800) 555-1234
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-sm">HC</span>
              </div>
              <span className="font-semibold text-foreground tracking-tight">HarmonyCare</span>
            </div>
            <p className="text-sm text-muted-foreground">Professional in-home care for seniors.</p>
          </div>
          <div className="flex flex-wrap gap-8 text-sm">
            <div>
              <p className="font-medium text-foreground mb-3">Services</p>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Personal Care</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Skilled Nursing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Memory Care</a></li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-3">Company</p>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-3">Legal</p>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HarmonyCare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <TrustBadges />
      <ServicesSection />
      <AboutSection />
      <ProcessSection />
      <TestimonialSection />
      <CTASection />
      <Footer />
    </main>
  );
}
