import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'

const MOTION_EASE = [0.22, 1, 0.36, 1] as const

const NAV_ITEMS = [
  { label: 'Home', id: 'home' },
  { label: 'Product', id: 'product' },
  { label: 'How it works', id: 'how-it-works' },
  { label: 'Roles', id: 'roles' },
  { label: 'FAQ', id: 'faq' },
]

const MODULES = [
  {
    title: 'Inventory',
    description: 'View stock balances and record inventory adjustments.',
  },
  {
    title: 'Inbound receiving',
    description: 'Create inbound orders and record received goods.',
  },
  {
    title: 'Outbound orders',
    description: 'Create outbound orders and confirm dispatch.',
  },
  {
    title: 'Shipments',
    description: 'Manage shipment records and update their status.',
  },
  {
    title: 'Cycle counting',
    description: 'Count products and scan barcodes or QR codes with a camera or image.',
  },
  {
    title: 'Reports and audit',
    description: 'Review operational reports and audit history where your role allows.',
  },
]

const ROLES = [
  {
    title: 'Administrator',
    description: 'Manages user access and system settings, with access to operational modules.',
  },
  {
    title: 'Warehouse Manager',
    description: 'Manages products, locations, receiving, inventory, outbound orders, shipments, reports, and audit history.',
  },
  {
    title: 'Warehouse Employee',
    description: 'Records inbound work, views inventory, handles outbound orders and dispatch, and takes part in cycle counts.',
  },
  {
    title: 'Shipment Manager',
    description: 'Manages shipment records and status, with read access to related inventory and outbound information.',
  },
  {
    title: 'Viewer or Auditor',
    description: 'Reviews inventory, shipment status, operational reports, and audit history without changing records.',
  },
]

const FAQ_ITEMS = [
  {
    question: 'What is LogiTrack?',
    answer:
      'LogiTrack is a warehouse management application for product records, inventory, inbound receiving, outbound orders, shipments, reports, and audit history.',
  },
  {
    question: 'Who is LogiTrack for?',
    answer:
      'The application has separate roles for administrators, warehouse managers, warehouse employees, shipment managers, and viewers or auditors.',
  },
  {
    question: 'Can anyone create an account?',
    answer:
      'Registration is for initial setup. The first registered account becomes the Administrator. After that, ask an existing administrator to create an account for you.',
  },
  {
    question: 'What can warehouse teams manage?',
    answer:
      'Depending on their role, teams can manage products and warehouse locations, record receiving, review and adjust inventory, create outbound orders, manage shipments, and view reports.',
  },
  {
    question: 'Can I scan a barcode or QR code?',
    answer:
      'Yes. Cycle counting supports scanning a product barcode or QR code with a device camera or importing an image.',
  },
  {
    question: 'Do all users have the same access?',
    answer:
      'No. The application uses its existing roles to control which pages and actions each account can access. An administrator manages user access.',
  },
]

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.5,
        delay: shouldReduceMotion ? 0 : delay,
        ease: MOTION_EASE,
      }}
    >
      {children}
    </motion.div>
  )
}

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4 transition-transform group-hover:translate-x-1"
    >
      <path d="M3.5 10h13m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      {open ? (
        <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      )}
    </svg>
  )
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const sections = NAV_ITEMS.map(({ id }) => document.getElementById(id)).filter(
      (section): section is HTMLElement => section !== null,
    )
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (current) setActiveSection(current.target.id)
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-[60] rounded-md bg-surface px-4 py-2 text-text-primary focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline focus:outline-2 focus:outline-primary"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-50 border-b border-border-default bg-surface">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            aria-label="LogiTrack home"
            className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            onClick={closeMenu}
          >
            <img src="/images/logo.png" alt="" className="h-9 w-9 rounded-md object-cover" />
            <span className="text-lg font-bold tracking-tight text-text-primary">LogiTrack</span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-5 lg:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={activeSection === item.id ? 'location' : undefined}
                className={`rounded-sm text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
                  activeSection === item.id
                    ? 'font-semibold text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              to="/login"
              className="rounded-md px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-app-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Create first account
            </Link>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border-default text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary lg:hidden"
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>

        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          hidden={!menuOpen}
          className="border-t border-border-default bg-surface px-4 py-4 sm:px-6 lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={activeSection === item.id ? 'location' : undefined}
                onClick={closeMenu}
                className={`rounded-md px-3 py-2.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
                  activeSection === item.id
                    ? 'bg-app-bg font-semibold text-primary'
                    : 'text-text-primary hover:bg-app-bg'
                }`}
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 flex gap-3 border-t border-border-default pt-3">
              <Link
                to="/login"
                onClick={closeMenu}
                className="flex min-h-10 flex-1 items-center justify-center rounded-md border border-border-default px-3 text-sm font-medium text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="flex min-h-10 flex-1 items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-on-primary hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Create account
              </Link>
            </div>
          </div>
        </nav>
      </header>
    </>
  )
}

function Hero() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="scroll-mt-20 bg-app-bg py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        <motion.div
          className="max-w-2xl"
          initial={shouldReduceMotion ? false : { opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: MOTION_EASE }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Warehouse work, made easier to follow
          </p>
          <h1
            id="hero-title"
            className="mt-4 text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl lg:text-6xl"
          >
            Make warehouse work easier to follow.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary sm:text-lg">
            LogiTrack brings product records, inventory, receiving, outbound orders, shipments, and
            operational reports into one workspace, with access shaped by each account&apos;s role.
          </p>
          <div className="mt-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              to="/register"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Create first account
              <ArrowRightIcon />
            </Link>
            <Link
              to="/login"
              className="rounded-sm text-sm font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:text-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              Already have an account? Sign in
            </Link>
          </div>
          <p className="mt-4 max-w-lg text-sm leading-6 text-text-secondary">
            The first registered account becomes the system Administrator. For an existing
            installation, ask an administrator to create your account.
          </p>
        </motion.div>

        <motion.figure
          className="relative overflow-hidden rounded-xl border border-border-default bg-surface"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98, x: 18 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.65,
            delay: shouldReduceMotion ? 0 : 0.08,
            ease: MOTION_EASE,
          }}
        >
          <img
            src="/images/Gemini_Generated_Image_axpporaxpporaxpp.jpg"
            alt="Warehouse employee scanning a labeled carton on a storage rack"
            className="aspect-[4/3] w-full object-cover"
            fetchPriority="high"
          />
          <div className="landing-float absolute bottom-12 left-4 max-w-[calc(100%-2rem)] rounded-lg border border-border-default bg-surface px-4 py-3 shadow-lg sm:bottom-14 sm:left-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Product areas
            </p>
            <p className="mt-1 text-sm font-semibold text-text-primary">
              Inventory · Receiving · Dispatch · Shipments
            </p>
          </div>
          <figcaption className="border-t border-border-default px-4 py-3 text-sm text-text-secondary">
            A clearer view of the work moving through your warehouse.
          </figcaption>
        </motion.figure>
      </div>
    </section>
  )
}

function Benefits() {
  const benefits = [
    {
      title: 'Work from shared records',
      description: 'Keep product, inventory, and order information in one application.',
    },
    {
      title: 'Follow goods through the warehouse',
      description: 'Record inbound receiving and outbound dispatch activity.',
    },
    {
      title: 'Keep access appropriate',
      description: 'Use LogiTrack roles to control the pages and actions available to each account.',
    },
  ]

  return (
    <section aria-label="LogiTrack benefits" className="border-y border-border-default bg-surface">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
        {benefits.map((benefit, index) => (
          <Reveal key={benefit.title} delay={index * 0.06}>
            <div className="border-l-2 border-primary pl-4">
              <h2 className="text-base font-semibold text-text-primary">{benefit.title}</h2>
              <p className="mt-1 text-sm leading-6 text-text-secondary">{benefit.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function ProductModules() {
  return (
    <section
      id="product"
      aria-labelledby="product-title"
      className="scroll-mt-20 bg-surface py-14 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Product areas
          </p>
          <h2 id="product-title" className="mt-3 text-3xl font-bold tracking-tight text-text-primary">
            The tools your warehouse team works with.
          </h2>
          <p className="mt-3 text-base leading-7 text-text-secondary">
            Find the right place for daily operations without sorting through unrelated tools.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module, index) => (
            <Reveal key={module.title} delay={index * 0.05}>
              <article className="landing-card h-full rounded-lg border border-border-default bg-app-bg p-5">
                <span aria-hidden="true" className="mb-4 block h-1 w-8 rounded-full bg-primary" />
                <h3 className="text-lg font-semibold text-text-primary">{module.title}</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{module.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const shouldReduceMotion = useReducedMotion()
  const steps = [
    {
      number: '01',
      title: 'Set up your workspace',
      description:
        'The first account is the Administrator. Add products, warehouses, locations, and team accounts as needed.',
    },
    {
      number: '02',
      title: 'Record daily activity',
      description:
        'Create inbound and outbound orders, receive goods, review stock, and count products.',
    },
    {
      number: '03',
      title: 'Review and follow up',
      description:
        'Check shipment records, operational reports, and audit history according to your role.',
    },
  ]

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="scroll-mt-20 bg-app-bg py-14 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            A straightforward starting point
          </p>
          <h2 id="how-title" className="mt-3 text-3xl font-bold tracking-tight text-text-primary">
            From setup to the next task.
          </h2>
        </div>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.li
              key={step.number}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.5,
                delay: shouldReduceMotion ? 0 : index * 0.07,
                ease: MOTION_EASE,
              }}
              className="h-full border-t border-border-default pt-4"
            >
              <span className="text-sm font-bold tabular-nums text-primary">{step.number}</span>
              <h3 className="mt-3 text-lg font-semibold text-text-primary">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{step.description}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function TaglineReveal() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.section
      aria-label="LogiTrack tagline"
      className="bg-sidebar-bg px-4 py-16 text-center text-on-primary sm:py-20"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">LogiTrack</p>
      <p className="mx-auto mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        Know what is on hand.
        <span className="mt-2 block text-accent">Know what happens next.</span>
      </p>
    </motion.section>
  )
}

function RoleAccess() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section
      id="roles"
      aria-labelledby="roles-title"
      className="scroll-mt-20 bg-surface py-14 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Access by role
          </p>
          <h2 id="roles-title" className="mt-3 text-3xl font-bold tracking-tight text-text-primary">
            The right view for each responsibility.
          </h2>
          <p className="mt-3 text-base leading-7 text-text-secondary">
            LogiTrack uses its existing roles to determine which operations each account can
            perform.
          </p>
        </div>
        <ul className="mt-8 divide-y divide-border-default border-y border-border-default">
          {ROLES.map((role, index) => (
            <motion.li
              key={role.title}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.45,
                delay: shouldReduceMotion ? 0 : index * 0.04,
                ease: MOTION_EASE,
              }}
              className="grid gap-1 py-4 sm:grid-cols-[minmax(12rem,0.7fr)_1.3fr] sm:gap-6"
            >
              <h3 className="font-semibold text-text-primary">{role.title}</h3>
              <p className="text-sm leading-6 text-text-secondary">{role.description}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function FrequentlyAskedQuestions() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="scroll-mt-20 bg-app-bg py-14 sm:py-16"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Frequently asked questions
        </p>
        <h2 id="faq-title" className="mt-3 text-3xl font-bold tracking-tight text-text-primary">
          Good to know before you begin.
        </h2>
        <Reveal className="mt-6">
          <div className="divide-y divide-border-default border-y border-border-default">
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className="group py-4">
                <summary className="cursor-pointer rounded-sm text-base font-semibold text-text-primary marker:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                  {item.question}
                </summary>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">{item.answer}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function FinalCallToAction() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section aria-labelledby="final-cta-title" className="bg-sidebar-bg px-4 py-14 text-center sm:py-16">
      <motion.div
        className="mx-auto max-w-3xl"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: MOTION_EASE }}
      >
        <h2 id="final-cta-title" className="text-3xl font-bold tracking-tight text-on-primary">
          Start with a clear view of your warehouse.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-sidebar-text">
          Create the first account to set up LogiTrack, or sign in if your administrator has
          already created your account.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/register"
            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Create first account
            <ArrowRightIcon />
          </Link>
          <Link
            to="/login"
            className="inline-flex min-h-12 items-center justify-center rounded-md border border-sidebar-text/40 px-5 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-surface/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Sign in
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-sidebar-text/15 bg-sidebar-bg text-sidebar-text">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex w-fit items-center gap-2 rounded-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <img src="/images/logo.png" alt="" className="h-8 w-8 rounded-md object-cover" />
          LogiTrack
        </Link>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <a href="#product" className="rounded-sm text-sidebar-text hover:text-on-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
            Product
          </a>
          <a href="#faq" className="rounded-sm text-sidebar-text hover:text-on-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
            FAQ
          </a>
          <Link to="/login" className="rounded-sm text-sidebar-text hover:text-on-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
            Sign in
          </Link>
        </nav>
        <span className="text-xs text-sidebar-muted">© LogiTrack</span>
      </div>
    </footer>
  )
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-app-bg">
      <Header />
      <main id="main-content">
        <Hero />
        <Benefits />
        <ProductModules />
        <HowItWorks />
        <TaglineReveal />
        <RoleAccess />
        <FrequentlyAskedQuestions />
        <FinalCallToAction />
      </main>
      <Footer />
    </div>
  )
}
