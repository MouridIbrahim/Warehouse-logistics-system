import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'

const MOTION_EASE = [0.22, 1, 0.36, 1] as const

const NAV_ITEMS = [
  { label: 'Home', id: 'home' },
  { label: 'Features', id: 'product' },
  { label: 'How it works', id: 'how-it-works' },
  { label: 'Platform', id: 'roles' },
  { label: 'FAQ', id: 'faq' },
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
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5 overflow-visible">
      <motion.path
        d="M4 7h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        animate={open ? { d: 'M6 6l12 12' } : { d: 'M4 7h16' }}
        transition={{ duration: 0.5, ease: MOTION_EASE }}
      />
      <motion.path
        d="M4 12h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        style={{ transformOrigin: 'center' }}
        transition={{ duration: 0.3, ease: MOTION_EASE }}
      />
      <motion.path
        d="M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        animate={open ? { d: 'M18 6L6 18' } : { d: 'M4 17h16' }}
        transition={{ duration: 0.5, ease: MOTION_EASE }}
      />
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
      <motion.header
        initial={menuOpen ? false : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: MOTION_EASE }}
        className="fixed inset-x-0 top-3 z-50 px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto flex min-h-14 max-w-5xl items-center justify-between gap-4 rounded-full border border-white/60 bg-white/85 px-3 shadow-[0_12px_40px_rgba(36,43,53,0.12)] backdrop-blur-xl sm:px-4">
          <Link
            to="/"
            aria-label="LogiTrack home"
            className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            onClick={closeMenu}
          >
            <img src="/images/logo.png" alt="" className="h-8 w-8 rounded-lg object-cover" />
            <span className="title-2 font-medium text-text-primary">LogiTrack</span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-4 lg:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={activeSection === item.id ? 'location' : undefined}
                className={`rounded-sm px-2 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
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
              className="rounded-md px-3 py-2 text-sm font-medium text-text-primary transition-colors duration-300 hover:bg-app-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition-[transform,background-color] duration-300 hover:bg-primary-hover active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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

        {menuOpen && (
          <motion.nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: MOTION_EASE }}
            className="fixed inset-0 -z-10 min-h-dvh bg-white/95 px-4 pb-8 pt-24 backdrop-blur-xl sm:px-6 lg:hidden"
          >
          <motion.div
            className="mx-auto flex max-w-7xl flex-col gap-1"
            initial="closed"
            animate="open"
            variants={{
              closed: {},
              open: { transition: { staggerChildren: 0.06 } },
            }}
          >
            {NAV_ITEMS.map((item) => (
              <motion.div
                key={item.id}
                variants={{
                  closed: { opacity: 0, y: 24 },
                  open: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5, ease: MOTION_EASE }}
              >
                <a
                  href={`#${item.id}`}
                  aria-current={activeSection === item.id ? 'location' : undefined}
                  onClick={closeMenu}
                  className={`block rounded-md px-3 py-3 text-xl font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
                    activeSection === item.id
                      ? 'bg-app-bg text-primary'
                      : 'text-text-primary hover:bg-app-bg'
                  }`}
                >
                  {item.label}
                </a>
              </motion.div>
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
          </motion.div>
          </motion.nav>
        )}
      </motion.header>
    </>
  )
}

function Hero() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="scroll-mt-20 overflow-hidden bg-app-bg pb-16 pt-32 sm:pb-20 sm:pt-36 lg:pb-24 lg:pt-40"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:gap-12 lg:px-8">
        <motion.div
          className="max-w-[680px]"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: MOTION_EASE }}
        >
          <div className="flex items-center gap-2 text-primary">
            <span className="h-px w-8 bg-primary" aria-hidden="true" />
            <p className="caption-3 uppercase tracking-[0.16em]">Warehouse operations platform</p>
          </div>
          <h1
            id="hero-title"
            className="heading-1 mt-6 text-balance bg-gradient-to-r from-black to-[#666666] bg-clip-text text-transparent"
          >
            Keep every warehouse
            <span className="block">operation under control.</span>
          </h1>
          <p className="body-3 mt-6 max-w-[680px] text-pretty text-text-secondary">
            LogiTrack brings product records, inventory, receiving, outbound orders, shipments, and
            operational reports into one workspace, with access shaped by each account&apos;s role.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link
              to="/register"
              className="group button-md inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-on-primary transition-[transform,background-color] duration-300 hover:bg-primary-hover active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Create first account
              <ArrowRightIcon />
            </Link>
            <Link
              to="/login"
              className="button-md inline-flex min-h-12 items-center justify-center rounded-md border border-border-default px-5 py-3 text-text-primary transition-[transform,background-color] duration-300 hover:bg-surface active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              Sign in
            </Link>
          </div>
        </motion.div>

        <motion.figure
          className="landing-warehouse relative min-h-[420px] overflow-hidden rounded-2xl border border-border-default bg-[#DDE3E8] shadow-[0_24px_64px_rgba(36,43,53,0.16)] sm:min-h-[520px]"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.65,
            delay: shouldReduceMotion ? 0 : 0.08,
            ease: MOTION_EASE,
          }}
        >
          <img
            src="/images/Gemini_Generated_Image_jc4w80jc4w80jc4w.jpg"
            alt="Warehouse employee scanning a labeled carton on a storage rack"
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
          />
          <motion.div
            className="landing-float absolute left-4 top-4 w-[210px] rounded-lg border border-white/70 bg-white/92 p-4 shadow-[0_16px_40px_rgba(36,43,53,0.16)] backdrop-blur-md sm:left-6 sm:top-6"
            animate={shouldReduceMotion ? undefined : { y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: MOTION_EASE }}
          >
            <div className="flex items-center justify-between">
              <p className="caption-4 text-text-secondary">Inventory status</p>
              <span className="h-2 w-2 rounded-full bg-status-success" aria-hidden="true" />
            </div>
            <p className="title-3 mt-2 text-text-primary">Stock positions</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[62, 78, 91].map((width) => (
                <span key={width} className="h-1.5 rounded-full bg-[#DFE4E8]">
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
                </span>
              ))}
            </div>
          </motion.div>
          <motion.div
            className="landing-float-delayed absolute bottom-5 right-4 w-[230px] rounded-lg border border-white/70 bg-[#242B35]/95 p-4 text-white shadow-[0_16px_40px_rgba(36,43,53,0.22)] sm:bottom-6 sm:right-6"
            animate={shouldReduceMotion ? undefined : { y: [0, 5, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: MOTION_EASE }}
          >
            <p className="caption-4 text-[#C8D0DA]">Cycle count</p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <p className="title-3">Rack A12</p>
              <span className="caption-3 rounded-full bg-[#F28C28] px-2 py-1 text-[#242B35]">Scanning</span>
            </div>
          </motion.div>
          <figcaption className="absolute inset-x-0 bottom-0 sr-only">
            Operational warehouse visualization
          </figcaption>
        </motion.figure>
      </div>
    </section>
  )
}

function Benefits() {
  const benefits = [
    {
      title: 'Shared operational records',
      description: 'Keep product, inventory, receiving, and dispatch information in one workspace.',
      number: '01',
    },
    {
      title: 'Traceable warehouse movement',
      description: 'Follow inbound receiving and outbound dispatch activity from creation to completion.',
      number: '02',
    },
    {
      title: 'Access matched to responsibility',
      description: 'Give every account the operational views and actions allowed by its existing role.',
      number: '03',
    },
  ]

  return (
    <section aria-label="LogiTrack benefits" className="bg-surface py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
        {benefits.map((benefit, index) => (
          <Reveal key={benefit.title} delay={index * 0.08}>
            <article className="border-t border-border-default pt-5">
              <span className="caption-3 text-primary">{benefit.number}</span>
              <h2 className="heading-6 mt-4 text-text-primary">{benefit.title}</h2>
              <p className="body-6 mt-3 text-pretty text-text-secondary">{benefit.description}</p>
            </article>
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
      className="scroll-mt-20 bg-surface py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-[680px]">
          <p className="caption-3 uppercase tracking-[0.16em] text-primary">Product areas</p>
          <h2 id="product-title" className="heading-2 mt-4 text-balance text-text-primary">
            One workspace for the work moving through your warehouse.
          </h2>
        </div>

        <div className="mt-12 space-y-16">
          <Reveal>
            <article className="grid items-center gap-8 lg:grid-cols-[1fr_1.15fr]">
              <div className="max-w-xl">
                <p className="caption-3 uppercase tracking-[0.16em] text-primary">Inventory visibility</p>
                <h3 className="heading-4 mt-4 text-text-primary">Know the stock position before the next decision.</h3>
                <p className="body-3 mt-4 text-pretty text-text-secondary">
                  Review inventory balances, record adjustments, manage products and locations, and run cycle counts with barcode or QR scanning.
                </p>
              </div>
              <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-border-default bg-app-bg p-6 sm:p-8">
                <div className="absolute right-8 top-8 h-16 w-16 rounded-full border-[12px] border-primary/15 border-t-primary" aria-hidden="true" />
                <div className="grid h-full grid-cols-2 gap-3 pt-24">
                  {['Products', 'Locations', 'Balances', 'Adjustments'].map((label, index) => (
                    <div key={label} className="rounded-lg border border-border-default bg-white p-4">
                      <span className="caption-4 text-text-secondary">{label}</span>
                      <div className={`mt-4 h-2 rounded-full ${index === 0 ? 'w-4/5 bg-primary' : 'w-3/5 bg-[#CBD5DF]'}`} />
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>

          <Reveal>
            <article className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr]">
              <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-border-default bg-[#242B35] p-6 sm:p-8 lg:order-1">
                <div className="mx-auto max-w-md rounded-xl border border-white/10 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <p className="title-3 text-text-primary">Receiving operation</p>
                    <span className="caption-3 rounded-full bg-status-warning-bg px-2 py-1 text-status-warning-text">In progress</span>
                  </div>
                  <div className="mt-6 space-y-3">
                    {['Goods registered', 'Items received', 'Balance updated'].map((step, index) => (
                      <div key={step} className="flex items-center gap-3 rounded-lg bg-app-bg p-3">
                        <span className={`h-3 w-3 rounded-full ${index < 2 ? 'bg-status-success' : 'border border-border-default bg-white'}`} />
                        <span className="body-6 text-text-primary">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="max-w-xl lg:order-2">
                <p className="caption-3 uppercase tracking-[0.16em] text-primary">Inbound and outbound</p>
                <h3 className="heading-4 mt-4 text-text-primary">Record the flow, from arrival to dispatch.</h3>
                <p className="body-3 mt-4 text-pretty text-text-secondary">
                  Create receiving and outbound orders, add order items, record received goods, and confirm dispatch through role controlled workflows.
                </p>
              </div>
            </article>
          </Reveal>

          <Reveal>
            <article className="grid items-center gap-8 lg:grid-cols-[1fr_1.15fr]">
              <div className="max-w-xl">
                <p className="caption-3 uppercase tracking-[0.16em] text-primary">Shipments and reports</p>
                <h3 className="heading-4 mt-4 text-text-primary">Follow shipments and review operational history.</h3>
                <p className="body-3 mt-4 text-pretty text-text-secondary">
                  Manage shipment records and statuses, export reports, and review audit history when the current role provides access.
                </p>
              </div>
              <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-border-default bg-[#EEF1F3] p-6 sm:p-8">
                <div className="absolute left-8 right-8 top-8 h-px bg-[#B8C1CA]" />
                {['Receiving', 'Dispatched', 'Delivered'].map((label, index) => (
                  <div
                    key={label}
                    className="absolute top-6 rounded-lg border border-border-default bg-white px-3 py-2 shadow-[0_8px_24px_rgba(36,43,53,0.08)]"
                    style={{ left: `${16 + index * 32}%` }}
                  >
                    <span className={`mr-2 inline-block h-2 w-2 rounded-full ${index < 2 ? 'bg-primary' : 'bg-status-success'}`} />
                    <span className="caption-4 text-text-primary">{label}</span>
                  </div>
                ))}
                <div className="mt-32 rounded-xl border border-border-default bg-white p-5">
                  <p className="title-3 text-text-primary">Operational report</p>
                  <div className="mt-5 flex h-32 items-end gap-3">
                    {[42, 58, 35, 72, 64, 88, 76].map((height, index) => (
                      <span
                        key={`${height}-${index}`}
                        className="flex-1 rounded-t-md bg-primary/80"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </Reveal>
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
      labels: ['Products', 'Warehouses', 'Locations'],
    },
    {
      number: '02',
      title: 'Record daily activity',
      description:
        'Create inbound and outbound orders, receive goods, review stock, and count products.',
      labels: ['Receiving', 'Inventory', 'Cycle count'],
    },
    {
      number: '03',
      title: 'Review and follow up',
      description:
        'Check shipment records, operational reports, and audit history according to your role.',
      labels: ['Shipments', 'Reports', 'Audit'],
    },
  ]

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="scroll-mt-20 bg-app-bg py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-[680px]">
          <p className="caption-3 uppercase tracking-[0.16em] text-primary">A straightforward starting point</p>
          <h2 id="how-title" className="heading-2 mt-4 text-balance text-text-primary">
            From setup to the next task.
          </h2>
        </div>
        <ol className="mt-12 grid gap-6 lg:grid-cols-3">
          {steps.map((step, index) => (
            <motion.li
              key={step.number}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.65,
                delay: shouldReduceMotion ? 0 : index * 0.08,
                ease: MOTION_EASE,
              }}
              className="overflow-hidden rounded-2xl border border-border-default bg-surface"
            >
              <div className="min-h-44 bg-[#EEF1F3] p-6">
                <span className="caption-3 text-primary">{step.number}</span>
                <div className="mt-8 space-y-2">
                  {step.labels.map((label, labelIndex) => (
                    <div
                      key={label}
                      className={`flex h-10 items-center rounded-md border border-border-default bg-white px-3 ${labelIndex === 1 ? 'mx-4' : ''}`}
                    >
                      <span className="mr-3 h-2 w-2 rounded-full bg-primary" />
                      <span className="body-6 text-text-primary">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6">
                <h3 className="heading-6 text-text-primary">{step.title}</h3>
                <p className="body-6 mt-3 text-pretty text-text-secondary">{step.description}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function TaglineReveal() {
  const shouldReduceMotion = useReducedMotion()
  const words = ['Every', 'warehouse', 'operation.', 'Under', 'control.']

  return (
    <motion.section
      aria-label="LogiTrack tagline"
      className="bg-sidebar-bg px-4 py-20 text-on-primary sm:py-24"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.55,
        ease: MOTION_EASE,
      }}
    >
      <div className="mx-auto max-w-5xl">
        <p className="caption-3 uppercase tracking-[0.16em] text-accent">LogiTrack</p>
        <h2 className="heading-1 mt-6 max-w-[680px] text-balance">
          {words.map((word, index) => (
            <motion.span
              key={word}
              className={`mr-[0.28em] inline-block ${index >= 3 ? 'text-white' : 'text-white'}`}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0.3 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.9 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.5,
                delay: shouldReduceMotion ? 0 : index * 0.12,
                ease: MOTION_EASE,
              }}
            >
              {word}
            </motion.span>
          ))}
        </h2>
      </div>
    </motion.section>
  )
}

function RoleAccess() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section
      id="roles"
      aria-labelledby="roles-title"
      className="scroll-mt-20 bg-surface py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-[680px]">
          <p className="caption-3 uppercase tracking-[0.16em] text-primary">Access by role</p>
          <h2 id="roles-title" className="heading-2 mt-4 text-balance text-text-primary">
            The right view for each responsibility.
          </h2>
        </div>
        <ul className="mt-12 divide-y divide-border-default border-y border-border-default">
          {ROLES.map((role, index) => (
            <motion.li
              key={role.title}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.65,
                delay: shouldReduceMotion ? 0 : index * 0.08,
                ease: MOTION_EASE,
              }}
              className="grid gap-2 py-6 sm:grid-cols-[minmax(12rem,0.7fr)_1.3fr] sm:gap-8"
            >
              <h3 className="title-2 text-text-primary">{role.title}</h3>
              <p className="body-6 text-pretty text-text-secondary">{role.description}</p>
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
      className="scroll-mt-20 bg-app-bg py-16 sm:py-20"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="caption-3 uppercase tracking-[0.16em] text-primary">Frequently asked questions</p>
        <h2 id="faq-title" className="heading-2 mt-4 max-w-[680px] text-balance text-text-primary">
          Good to know before you begin.
        </h2>
        <Reveal className="mt-12">
          <div className="divide-y divide-border-default border-y border-border-default">
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className="group py-6">
                <summary className="cursor-pointer rounded-sm title-2 text-text-primary marker:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                  {item.question}
                </summary>
                <p className="body-6 mt-3 max-w-2xl text-pretty text-text-secondary">{item.answer}</p>
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
    <section aria-labelledby="final-cta-title" className="bg-sidebar-bg px-4 py-20 sm:py-24">
      <motion.div
        className="mx-auto max-w-5xl"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.65, ease: MOTION_EASE }}
      >
        <div className="max-w-[680px]">
          <p className="caption-3 uppercase tracking-[0.16em] text-accent">Start with LogiTrack</p>
          <h2 id="final-cta-title" className="heading-2 mt-4 text-balance text-on-primary">
            Give your warehouse a clear next step.
          </h2>
          <p className="body-3 mt-5 max-w-2xl text-pretty text-sidebar-text">
            Create the first account to set up LogiTrack, or sign in if your administrator has already created your account.
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/register"
            className="group button-md inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-on-primary transition-[transform,background-color] duration-300 hover:bg-primary-hover active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Create first account
            <ArrowRightIcon />
          </Link>
          <Link
            to="/login"
            className="button-md inline-flex min-h-12 items-center justify-center rounded-md border border-sidebar-text/40 px-5 py-3 text-on-primary transition-[transform,background-color] duration-300 hover:bg-surface/10 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-[1fr_auto] sm:px-6 lg:px-8">
        <div>
        <Link
          to="/"
          className="flex w-fit items-center gap-2 rounded-sm title-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <img src="/images/logo.png" alt="" className="h-8 w-8 rounded-md object-cover" />
          LogiTrack
        </Link>
          <p className="body-6 mt-3 max-w-md text-sidebar-muted">
            Warehouse management for inventory, receiving, dispatch, shipments, and operational records.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 body-6">
          <a href="#product" className="rounded-sm text-sidebar-text transition-colors duration-300 hover:text-on-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
            Features
          </a>
          <a href="#how-it-works" className="rounded-sm text-sidebar-text transition-colors duration-300 hover:text-on-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
            How it works
          </a>
          <a href="#faq" className="rounded-sm text-sidebar-text transition-colors duration-300 hover:text-on-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
            FAQ
          </a>
          <Link to="/login" className="rounded-sm text-sidebar-text transition-colors duration-300 hover:text-on-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
            Sign in
          </Link>
        </nav>
        <span className="caption-5 text-sidebar-muted sm:col-span-2">© LogiTrack</span>
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
