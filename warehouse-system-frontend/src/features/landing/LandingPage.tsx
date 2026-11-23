import { Link } from 'react-router-dom'
import { useReducedMotion, motion } from 'motion/react'

import { fadeUp, fadeLeft, fadeRight, scaleIn, stagger, viewportOnce, EASE_OUT } from './animations'

/* ------------------------------------------------------------------ */
/* Shared image                                                      */
/* ------------------------------------------------------------------ */

function SectionImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const reduced = useReducedMotion()
  if (reduced) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-surface-container shadow-xl ${className}`}>
        <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      </div>
    )
  }
  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      whileInView="visible"
      viewport={viewportOnce}
      whileHover={{ scale: 1.015 }}
      style={{ transformOrigin: 'center center' }}
      className={`relative overflow-hidden rounded-xl bg-surface-container shadow-xl ${className}`}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Header                                                            */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'About', href: '#about' },
]

function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_OUT }}
      className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/90 backdrop-blur-md shadow-[0_1px_8px_rgba(24,33,47,0.06)]"
    >
      <div className="h-16 w-full px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/images/logo.png" alt="LogiTrack" className="w-10 h-10 rounded-lg object-cover shrink-0" />
          <div className="flex flex-col">
            <span className="text-headline-h3 text-text-primary leading-tight">LogiTrack</span>
            <span className="text-caption-meta text-text-secondary leading-tight hidden sm:block">
              Warehouse &amp; Logistics Management
            </span>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#home" className="transition-colors text-primary font-semibold text-body-default">
            Home
          </a>
          {NAV_LINKS.slice(1).map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-body-default text-text-secondary hover:text-text-primary transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="h-10 px-4 rounded-lg text-button-text text-text-primary bg-surface hover:bg-app-bg transition-colors flex items-center justify-center"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="h-10 px-4 rounded-lg text-button-text font-semibold text-on-primary bg-primary hover:bg-primary-hover shadow-sm transition-colors flex items-center justify-center"
          >
            Get Started
          </Link>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-1">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

/* ------------------------------------------------------------------ */
/* Hero                                                              */
/* ------------------------------------------------------------------ */

function Sparkline() {
  return (
    <svg className="h-full w-full fill-none" viewBox="0 0 100 24">
      <path d="M0,18 L16,16 L32,19 L48,11 L64,13 L80,7 L100,4" stroke="#C45D16" strokeWidth="2" />
    </svg>
  )
}

function Hero() {
  return (
    <section id="home" className="relative w-full overflow-hidden bg-app-bg pt-16 pb-space-xl lg:py-24">
      {/* Ambient backdrop glows */}
      <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-primary-fixed/20 blur-3xl" />

      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-space-xl lg:grid-cols-12 lg:gap-12">
          {/* Hero text */}
          <motion.div
            variants={stagger(0.12)}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start lg:col-span-6"
          >
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-1.5 rounded-full bg-status-warning-bg px-3.5 py-1 text-caption-meta font-semibold text-status-warning-text shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="uppercase tracking-wider text-[11px]">
                Smarter Warehouse &amp; Logistics Management
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-space-md text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-[48px] lg:leading-[56px]"
            >
              Take Control of Every Warehouse Operation.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-space-md max-w-xl text-body-default text-text-secondary lg:text-base lg:leading-relaxed"
            >
              Manage inventory, streamline inbound and outbound operations, track shipments, and gain
              complete visibility across your warehouse workflows — all from one centralized platform.
            </motion.p>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-space-lg flex flex-wrap items-center gap-2 sm:gap-4"
            >
              <Link
                to="/register"
                className="group inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-primary px-6 text-button-text font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-hover active:scale-[0.98]"
              >
                <span>Explore the Platform</span>
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-0.5">
                  arrow_forward
                </span>
              </Link>
              <a
                href="#features"
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-surface px-5 text-button-text font-semibold text-text-primary shadow-sm hover:bg-app-bg transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-text-secondary">play_circle</span>
                <span>Discover Features</span>
              </a>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-space-xl flex flex-wrap items-center gap-x-6 gap-y-3 pt-1 text-text-secondary"
            >
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">domain</span>
                <span className="text-caption-meta font-semibold text-text-primary">Multi-Facility Support</span>
              </div>
              <div className="h-3 w-px bg-border-default hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">sensors</span>
                <span className="text-caption-meta font-semibold text-text-primary">
                  Real-Time EDI 214 Telemetry
                </span>
              </div>
              <div className="h-3 w-px bg-border-default hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">security</span>
                <span className="text-caption-meta font-semibold text-text-primary">Role-Based Access (RBAC)</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero visual */}
          <div className="relative lg:col-span-6">
            <SectionImage
              src="/images/Gemini_Generated_Image_jc4w80jc4w80jc4w.jpg"
              alt="Wide high angle photograph of a vast modern logistics distribution warehouse with high steel storage racks, polished concrete floors, automated guided vehicles, and electric forklifts under bright industrial lighting"
              className="h-[380px] sm:h-[440px] lg:h-[480px] w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-sidebar-bg/60 via-transparent to-transparent" />

            {/* Floating card 1: Inventory Overview */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.25, duration: 0.6, ease: EASE_OUT }}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 rounded-lg bg-surface/95 p-3.5 shadow-md backdrop-blur-md max-w-[210px] sm:max-w-[230px]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] uppercase tracking-wider text-text-secondary">
                  Inventory Overview
                </span>
                <span className="flex h-2 w-2 rounded-full bg-status-success-text" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-headline-h2 font-semibold text-text-primary">1,248,600</span>
                <span className="text-caption-meta font-semibold text-status-success-text">+8.4% MoM</span>
              </div>
              <p className="text-[11px] text-text-secondary mt-0.5">Physical Units • 142 Active SKUs</p>
              <div className="mt-2 h-5 w-full">
                <Sparkline />
              </div>
            </motion.div>

            {/* Floating card 2: Active Shipments */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.35, duration: 0.6, ease: EASE_OUT }}
              className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 rounded-lg bg-surface/95 p-3.5 shadow-md backdrop-blur-md max-w-[210px] sm:max-w-[240px]"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-status-info-bg text-status-info-text">
                  <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-text-secondary">
                    Active Shipments
                  </span>
                  <span className="text-body-default font-semibold text-text-primary">28 Consignments</span>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-text-secondary">
                <span className="inline-flex items-center gap-1 text-status-success-text">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> 100% On-Time
                </span>
                <span className="rounded bg-surface-container px-1.5 py-0.5 text-text-primary font-semibold">
                  8 in transit
                </span>
              </div>
            </motion.div>

            {/* Floating card 3: Terminal node */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.45, duration: 0.6, ease: EASE_OUT }}
              className="hidden sm:flex absolute bottom-6 right-6 items-center gap-2 rounded-lg bg-sidebar-bg/90 px-3 py-2 text-on-primary shadow-md backdrop-blur-sm"
            >
              <span className="material-symbols-outlined text-[18px] text-primary-fixed">warehouse</span>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-sidebar-muted">Primary Facility</span>
                <span className="text-caption-meta font-semibold text-sidebar-text">
                  WH-KM-001 (Operational 99.8%)
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Platform overview                                                 */
/* ------------------------------------------------------------------ */

const CAPABILITIES = [
  {
    icon: 'inventory_2',
    iconClass: 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-on-primary',
    title: 'Inventory Management',
    desc: 'Real-time balance telemetry, storage bay coordinates, and dynamic stock allocations across facilities.',
    points: [
      'Monitor stock levels & buffers',
      'View catalog metadata & SKUs',
      'Access stock movement history',
      'Maintain accurate bin counts',
    ],
    link: 'View inventory workflows',
    linkClass: 'text-primary',
    checkClass: 'text-primary',
  },
  {
    icon: 'south_west',
    iconClass: 'bg-status-info-bg text-status-info-text group-hover:bg-status-info-text group-hover:text-on-primary',
    title: 'Inbound Operations',
    desc: 'Streamline supplier purchase orders, staging dock receipts, and fast putaway processes without paperwork delay.',
    points: [
      'Manage incoming cargo manifests',
      'Organize receiving operations',
      'Record accepted vs damaged items',
      'Maintain inbound receipt records',
    ],
    link: 'View receiving docks',
    linkClass: 'text-status-info-text',
    checkClass: 'text-status-info-text',
  },
  {
    icon: 'north_east',
    iconClass: 'bg-status-warning-bg text-status-warning-text group-hover:bg-status-warning-text group-hover:text-on-primary',
    title: 'Outbound Operations',
    desc: 'Orchestrate zone and wave picks, scan verification, sorting tables, and rapid staging for parcel carriers.',
    points: [
      'Batch fulfillment picking waves',
      'Organize packing & dispatch',
      'Track pallet staging lanes',
      'Maintain automated audit logs',
    ],
    link: 'Explore wave routing',
    linkClass: 'text-status-warning-text',
    checkClass: 'text-status-warning-text',
  },
  {
    icon: 'local_shipping',
    iconClass: 'bg-status-success-bg text-status-success-text group-hover:bg-status-success-text group-hover:text-on-primary',
    title: 'Shipment Management',
    desc: 'End-to-end multi-carrier consignments, automated bill of lading (BOL), and continuous delivery telemetry.',
    points: [
      'Manage unified freight manifests',
      'View real-time carrier tracking',
      'Automated dispatch documentation',
      'Monitor dock turnaround SLA',
    ],
    link: 'View fleet consignments',
    linkClass: 'text-status-success-text',
    checkClass: 'text-status-success-text',
  },
]

function PlatformOverview() {
  return (
    <section id="features" className="w-full bg-surface py-space-xl lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-table-header uppercase tracking-wider text-primary">
            Core Architecture
          </span>
          <h2 className="mt-1 text-headline-h1 font-bold text-text-primary">
            Everything Your Warehouse Needs. One Platform.
          </h2>
          <p className="mt-2 text-body-default text-text-secondary">
            Bring your essential warehouse operations together with a unified management experience
            built for real-world logistical throughput.
          </p>
        </motion.div>

        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          animate="visible"
          className="mt-space-xl grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {CAPABILITIES.map((c) => (
            <motion.div
              key={c.title}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(24,33,47,0.08)' }}
              className="relative flex flex-col justify-between rounded-xl bg-app-bg p-6 shadow-sm transition-colors duration-200 hover:bg-surface"
            >
              <div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${c.iconClass}`}
                >
                  <span className="material-symbols-outlined text-[26px]">{c.icon}</span>
                </motion.div>
                <h3 className="mt-space-md text-headline-h3 font-semibold text-text-primary">
                  {c.title}
                </h3>
                <p className="mt-1 text-body-default text-text-secondary">{c.desc}</p>
                <ul className="mt-space-md space-y-2 text-table-data text-text-primary">
                  {c.points.map((p) => (
                    <li key={p} className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[16px] ${c.checkClass}`}>
                        check_circle
                      </span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-space-lg pt-1">
                <span
                  className={`inline-flex items-center gap-1 text-[13px] font-semibold ${c.linkClass} group-hover:underline`}
                >
                  <span>{c.link}</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Feature showcase                                                  */
/* ------------------------------------------------------------------ */

function Bullet({ title, desc }: { title: string; desc: string }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="flex items-start gap-3 rounded-lg bg-surface p-3.5 shadow-sm"
    >
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <span className="material-symbols-outlined text-[15px]">done</span>
      </div>
      <div className="flex flex-col">
        <span className="text-body-default font-semibold text-text-primary">{title}</span>
        <span className="text-caption-meta text-text-secondary">{desc}</span>
      </div>
    </motion.div>
  )
}

function FeatureShowcase() {
  return (
    <section id="solutions" className="w-full bg-app-bg py-space-xl lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 space-y-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-center max-w-2xl mx-auto"
        >
          <span className="text-table-header uppercase tracking-wider text-primary">
            Operational Precision
          </span>
          <h2 className="mt-1 text-headline-h1 font-bold text-text-primary">
            See Your Operations More Clearly.
          </h2>
          <p className="mt-1 text-body-default text-text-secondary">
            Eliminate dark inventory zones and manual reconciliation with instant barcode terminal
            synch and live dock tracking.
          </p>
        </motion.div>

        {/* Split 1: text left, image right */}
        <motion.div
          variants={fadeLeft}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12"
        >
          <div className="flex flex-col lg:col-span-5">
            <div className="inline-flex items-center gap-2 text-primary font-semibold text-caption-meta">
              <span className="material-symbols-outlined text-[18px]">barcode_scanner</span>
              <span className="uppercase tracking-wider">Stock Telemetry &amp; Auditing</span>
            </div>
            <motion.h3
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-2 text-headline-h1 font-bold text-text-primary"
            >
              Inventory Visibility
            </motion.h3>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-space-md text-body-default text-text-secondary"
            >
              Get a clear view of your inventory, stock levels, and movement history. Make better
              operational decisions with organized inventory information and live handheld scanner feeds.
            </motion.p>
            <motion.div
              variants={stagger(0.08)}
              initial="hidden"
              animate="visible"
              className="mt-space-lg space-y-4"
            >
              <Bullet
                title="Real-time FIFO / LIFO Tracking"
                desc="Enforce automated stock rotation to minimize shelf expiration and obsolete holding costs."
              />
              <Bullet
                title="Automated Safety Buffer Alerts"
                desc="Configurable thresholds trigger replenishment purchase notifications automatically when inventory hits sub-10%."
              />
              <Bullet
                title="Granular Storage Bay Allocation"
                desc="Three-axis coordinates (Aisle-Rack-Shelf) guide staff immediately to precise pallet footprints."
              />
            </motion.div>
          </div>
          <div className="relative lg:col-span-7">
            <SectionImage
              src="/images/Gemini_Generated_Image_axpporaxpporaxpp.jpg"
              alt="Warehouse worker in an orange high-visibility vest scanning palletized carton inventory with a rugged handheld barcode scanner"
              className="h-[360px] sm:h-[420px]"
            />
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="absolute bottom-5 left-5 flex items-center gap-3 rounded-lg bg-sidebar-bg/95 p-3.5 text-on-primary shadow-lg backdrop-blur-md"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded bg-primary text-on-primary">
                <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-body-default font-semibold text-sidebar-text">
                    RF Terminal #WH-TC57-04
                  </span>
                  <span className="h-2 w-2 rounded-full bg-status-success-text" />
                </div>
                <span className="text-caption-meta text-sidebar-muted">
                  Connected • 14ms WebSocket Sync • ASN #9081
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Split 2: image left, text right */}
        <motion.div
          variants={fadeRight}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12"
        >
          <div className="order-2 lg:order-1 relative lg:col-span-7">
            <SectionImage
              src="/images/Gemini_Generated_Image_kml744kml744kml7.jpg"
              alt="Warehouse dock workers in safety gear organizing staging cartons and wooden pallets by loading dock bays"
              className="h-[360px] sm:h-[420px]"
            />
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="absolute top-5 right-5 flex items-center gap-3 rounded-lg bg-surface/95 p-3.5 shadow-lg backdrop-blur-md"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded bg-status-warning-bg text-status-warning-text">
                <span className="material-symbols-outlined text-[20px]">dock</span>
              </div>
              <div className="flex flex-col">
                <span className="text-body-default font-semibold text-text-primary">
                  Dock Gate 04 • Outbound Staging
                </span>
                <span className="text-caption-meta text-text-secondary">
                  Wave Pick #W-1049 • 240/240 Verified (100%)
                </span>
              </div>
            </motion.div>
          </div>
          <div className="order-1 lg:order-2 flex flex-col lg:col-span-5">
            <div className="inline-flex items-center gap-2 text-primary font-semibold text-caption-meta">
              <span className="material-symbols-outlined text-[18px]">hub</span>
              <span className="uppercase tracking-wider">Throughput Automation</span>
            </div>
            <motion.h3
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-2 text-headline-h1 font-bold text-text-primary"
            >
              Simplified Warehouse Operations
            </motion.h3>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-space-md text-body-default text-text-secondary"
            >
              Manage incoming and outgoing goods through structured workflows designed to keep
              warehouse operations organized, compliant, and extraordinarily efficient under peak
              seasonal volume.
            </motion.p>
            <motion.div
              variants={stagger(0.08)}
              initial="hidden"
              animate="visible"
              className="mt-space-lg space-y-4"
            >
              <Bullet
                title="Guided Wave Picking Checklists"
                desc="System-optimized pick routing reduces operator travel distance by an average of 34% per shift."
              />
              <Bullet
                title="Instant Discrepancy Capture"
                desc="Immediate automated logging of overages, shortages, or damages (OS&D) directly from dock inspection."
              />
              <Bullet
                title="Verified Master Dispatch Ledger"
                desc="Every seal code and pallet handover recorded with carrier timestamp and digital signature."
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Benefits                                                          */
/* ------------------------------------------------------------------ */

const BENEFITS = [
  {
    icon: 'dataset',
    title: 'Centralized Management',
    desc: 'Manage essential warehouse operations from one platform without fragmented spreadsheets or siloed inventory records.',
  },
  {
    icon: 'visibility',
    title: 'Operational Visibility',
    desc: 'Access organized information about inventory, movements, and dock workflows in real time across the enterprise.',
  },
  {
    icon: 'account_tree',
    title: 'Structured Workflows',
    desc: 'Keep inbound receipts, wave picking, and outbound dispatches orderly, verifiable, and strictly compliant.',
  },
  {
    icon: 'badge',
    title: 'Role-Based Access',
    desc: 'Provide every user with secure, specialized access according to their operational shift responsibilities.',
  },
]

function Benefits() {
  return (
    <section className="w-full bg-surface py-space-xl lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-table-header uppercase tracking-wider text-primary">
            The LogiTrack Standard
          </span>
          <h2 className="mt-1 text-headline-h1 font-bold text-text-primary">
            Built to Make Warehouse Management Simpler.
          </h2>
          <p className="mt-2 text-body-default text-text-secondary">
            Eliminate fragile disconnected spreadsheets, minimize lost freight, and empower shift
            supervisors with deterministic tools.
          </p>
        </motion.div>

        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          animate="visible"
          className="mt-space-xl grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {BENEFITS.map((b) => (
            <motion.div
              key={b.title}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(24,33,47,0.08)' }}
              className="flex flex-col rounded-xl bg-app-bg p-6 shadow-sm transition-colors duration-200 hover:bg-surface"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface text-primary shadow-sm"
              >
                <span className="material-symbols-outlined text-[24px]">{b.icon}</span>
              </motion.div>
              <h4 className="mt-space-md text-headline-h3 font-semibold text-text-primary">{b.title}</h4>
              <p className="mt-1 text-body-default text-text-secondary leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Dashboard preview                                                 */
/* ------------------------------------------------------------------ */

const KPIS = [
  { label: 'Catalog SKUs', icon: 'category', iconClass: 'text-primary', value: '142', badge: 'Active', badgeClass: 'text-status-success-text', foot: '0 out of stock' },
  { label: 'On-Hand Units', icon: 'layers', iconClass: 'text-status-info-text', value: '1,248,600', badge: '98.2% cap', badgeClass: 'text-status-success-text', foot: 'Across 4 Facilities' },
  { label: 'Pending Outbound', icon: 'pending_actions', iconClass: 'text-status-warning-text', value: '14 Waves', badge: 'Priority', badgeClass: 'text-status-warning-text', foot: 'Ready for staging' },
  { label: 'Active Shipments', icon: 'local_shipping', iconClass: 'text-status-success-text', value: '28', badge: '100% On-Time', badgeClass: 'text-status-success-text', foot: '8 In Transit via EDI' },
]

const SIDEBAR_ITEMS = [
  { label: 'Dashboard', icon: 'dashboard', active: true },
  { label: 'Inventory', icon: 'inventory' },
  { label: 'Inbound Orders', icon: 'move_to_inbox' },
  { label: 'Outbound Waves', icon: 'outbox' },
  { label: 'Shipments', icon: 'local_shipping' },
  { label: 'Reports', icon: 'assessment' },
]

const ACTIVITY = [
  { icon: 'verified', iconClass: 'text-status-success-text', title: 'Dock Gate 04: Manifest Verified', desc: 'Carrier Swift Freight #BOL-88401 • 32 Pallets', time: '1m ago' },
  { icon: 'barcode_reader', iconClass: 'text-primary', title: 'Bay A-12: Wave Pick Completed', desc: 'Operator #104 scanned SKU-66910 • 120 units', time: '4m ago' },
  { icon: 'local_shipping', iconClass: 'text-status-info-text', title: 'Inbound Dock 02: ASN Received', desc: 'Trailer ID #TR-9942 checked into staging bay', time: '9m ago' },
]

function ThroughputChart() {
  return (
    <svg className="h-full w-full overflow-visible" viewBox="0 0 500 160">
      <line stroke="#E2E8F0" strokeDasharray="3 3" x1="0" x2="500" y1="30" y2="30" />
      <line stroke="#E2E8F0" strokeDasharray="3 3" x1="0" x2="500" y1="80" y2="80" />
      <line stroke="#E2E8F0" strokeDasharray="3 3" x1="0" x2="500" y1="130" y2="130" />
      <path
        d="M 0,110 Q 70,120 140,85 T 280,60 T 420,95 T 500,45"
        fill="none"
        stroke="#1D4ED8"
        strokeWidth="2.5"
      />
      <path
        d="M 0,130 Q 80,100 160,75 T 300,35 T 410,50 T 500,20"
        fill="none"
        stroke="#C45D16"
        strokeWidth="3"
      />
      <circle cx="300" cy="35" fill="#C45D16" r="4.5" stroke="#FFFFFF" strokeWidth="2" />
    </svg>
  )
}

function DashboardPreview() {
  return (
    <section className="w-full bg-app-bg py-space-xl lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl text-center"
        >
          <span className="text-table-header uppercase tracking-wider text-primary">
            Live Operations Console
          </span>
          <h2 className="mt-1 text-headline-h1 font-bold text-text-primary">
            Your Warehouse Operations, At a Glance.
          </h2>
          <p className="mt-2 text-body-default text-text-secondary">
            A unified operations cockpit designed for speed, scanability, and high-velocity decision-making.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-space-xl overflow-hidden rounded-xl bg-surface shadow-2xl"
        >
          {/* Shell header */}
          <div className="flex items-center justify-between bg-sidebar-bg px-4 py-3 text-sidebar-text">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-error inline-block" />
              <span className="h-3 w-3 rounded-full bg-[#f59e0b] inline-block" />
              <span className="h-3 w-3 rounded-full bg-status-success-text inline-block" />
              <span className="ml-2 text-[12px] text-sidebar-muted">
                LogiTrack Enterprise Core v4.8.2 — Active Station WH-KM-001
              </span>
            </div>
            <div className="flex items-center gap-3 text-sidebar-muted">
              <span className="text-[11px] bg-surface/10 px-2 py-0.5 rounded text-sidebar-text font-mono">
                LATENCY: 12ms
              </span>
              <span className="material-symbols-outlined text-[18px]">wifi</span>
            </div>
          </div>

          <div className="flex min-h-[580px] w-full flex-col lg:flex-row">
            {/* Mini sidebar */}
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              animate="visible"
              className="w-full shrink-0 bg-sidebar-bg p-4 lg:w-56 flex flex-row lg:flex-col justify-between overflow-x-auto"
            >
              <div className="flex flex-row lg:flex-col gap-1 w-full">
                {SIDEBAR_ITEMS.map((item) => (
                  <div
                    key={item.label}
                    className={
                      item.active
                        ? 'flex items-center gap-3 rounded-lg bg-primary px-3 py-2 text-on-primary shrink-0'
                        : 'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-muted hover:bg-surface/5 hover:text-sidebar-text transition-colors shrink-0'
                    }
                  >
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    <span className={item.active ? 'text-[13px] font-semibold' : 'text-[13px]'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="hidden lg:flex items-center gap-2 rounded-lg bg-surface/5 p-2 mt-auto">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary font-bold text-xs">
                  MV
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-[12px] font-semibold text-sidebar-text">Marcus Vance</span>
                  <span className="text-[10px] text-sidebar-muted">Floor Supervisor</span>
                </div>
              </div>
            </motion.div>

            {/* Main content */}
            <motion.div
              variants={fadeRight}
              initial="hidden"
              animate="visible"
              className="flex-1 bg-app-bg p-4 lg:p-6 flex flex-col gap-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3.5 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-headline-h3 font-semibold text-text-primary">
                    Warehouse Operations Overview
                  </span>
                  <span className="rounded bg-status-success-bg px-2 py-0.5 text-[11px] font-semibold text-status-success-text">
                    Shift A Active
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-text-secondary">
                      search
                    </span>
                    <input
                      className="h-8 rounded bg-app-bg pl-8 pr-3 text-[12px] text-text-primary focus:outline-none w-44 sm:w-56"
                      placeholder="Scan SKU, ASN, or Bay..."
                      readOnly
                      type="text"
                    />
                  </div>
                  <button className="h-8 rounded bg-primary px-3 text-[12px] font-semibold text-on-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">add</span>
                    <span>New Receipt</span>
                  </button>
                </div>
              </div>

              {/* KPI cards */}
              <motion.div
                variants={stagger(0.06)}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-2 lg:grid-cols-4"
              >
                {KPIS.map((k) => (
                  <motion.div
                    key={k.label}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ y: -2, boxShadow: '0 8px 16px rgba(24,33,47,0.06)' }}
                    className="rounded-lg bg-surface p-3.5 shadow-sm transition-colors hover:bg-surface-container"
                  >
                    <div className="flex items-center justify-between text-text-secondary">
                      <span className="text-[11px] uppercase tracking-wider">{k.label}</span>
                      <span className={`material-symbols-outlined text-[16px] ${k.iconClass}`}>{k.icon}</span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-[22px] font-bold text-text-primary">{k.value}</span>
                      <span className={`text-[11px] font-semibold ${k.badgeClass}`}>{k.badge}</span>
                    </div>
                    <span className="text-[11px] text-text-secondary">{k.foot}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Chart + feed */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                <motion.div
                  variants={fadeLeft}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col justify-between rounded-lg bg-surface p-4 shadow-sm lg:col-span-7"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[14px] font-semibold text-text-primary">
                        30-Day Throughput Velocity
                      </h4>
                      <p className="text-[11px] text-text-secondary">
                        Inbound intake vs. outbound dispatch units (Thousands)
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-semibold">
                      <span className="flex items-center gap-1 text-primary">
                        <span className="h-2 w-2 rounded-full bg-primary inline-block" /> Outbound
                      </span>
                      <span className="flex items-center gap-1 text-status-info-text">
                        <span className="h-2 w-2 rounded-full bg-status-info-text inline-block" /> Inbound
                      </span>
                    </div>
                  </div>
                  <div className="relative mt-4 h-48 w-full">
                    <ThroughputChart />
                    <div className="absolute top-2 left-1/2 -translate-x-12 rounded bg-sidebar-bg px-2 py-1 text-[10px] text-on-primary shadow pointer-events-none">
                      <span className="font-semibold">Peak Day 18:</span> 48,200 Units
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-border-default pt-2 text-[10px] text-text-secondary">
                    <span>Day 01</span>
                    <span>Day 08</span>
                    <span>Day 15</span>
                    <span>Day 22</span>
                    <span>Day 30</span>
                  </div>
                </motion.div>

                <motion.div
                  variants={fadeRight}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col rounded-lg bg-surface p-4 shadow-sm lg:col-span-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-semibold text-text-primary">
                        Live Terminal Activity
                      </span>
                      <span className="h-2 w-2 rounded-full bg-status-success-text animate-pulse" />
                    </div>
                    <span className="text-[11px] text-text-secondary">Auto-sync 3s</span>
                  </div>
                  <motion.div
                    variants={stagger(0.08)}
                    initial="hidden"
                    animate="visible"
                    className="mt-3 space-y-2.5 overflow-hidden"
                  >
                    {ACTIVITY.map((a) => (
                      <motion.div
                        key={a.title}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        className="flex items-start gap-2.5 rounded bg-app-bg p-2 text-text-primary"
                      >
                        <span className={`material-symbols-outlined text-[16px] ${a.iconClass} mt-0.5`}>
                          {a.icon}
                        </span>
                        <div className="flex flex-col text-[12px] min-w-0">
                          <span className="font-semibold truncate">{a.title}</span>
                          <span className="text-[11px] text-text-secondary">{a.desc}</span>
                        </div>
                        <span className="ml-auto text-[10px] text-text-secondary whitespace-nowrap">
                          {a.time}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Roles                                                             */
/* ------------------------------------------------------------------ */

const ROLES = [
  {
    name: 'Administrator',
    icon: 'admin_panel_settings',
    iconClass: 'bg-sidebar-bg text-on-primary',
    badge: 'Full System',
    badgeClass: 'bg-status-danger-bg text-status-danger-text',
    scope: 'All Warehouses',
    desc: 'Full system management, user provisioning, global policy configuration, facility nodes, and complete audit trail visibility.',
  },
  {
    name: 'Warehouse Manager',
    icon: 'manage_accounts',
    iconClass: 'bg-primary text-on-primary',
    badge: 'Supervisory',
    badgeClass: 'bg-status-warning-bg text-status-warning-text',
    scope: 'Facility Level',
    desc: 'Supervises floor operations, catalog specifications, storage bin allocations, exception overrides, and operational SLA reports.',
  },
  {
    name: 'Warehouse Employee',
    icon: 'engineering',
    iconClass: 'bg-status-info-bg text-status-info-text',
    badge: 'Execution',
    badgeClass: 'bg-status-info-bg text-status-info-text',
    scope: 'Terminal App',
    desc: 'Executes physical dock receiving, storage putaway, wave picking checklists, and discrepancy photo logging via mobile scanners.',
  },
  {
    name: 'Shipment Manager',
    icon: 'local_shipping',
    iconClass: 'bg-status-success-bg text-status-success-text',
    badge: 'Logistics',
    badgeClass: 'bg-status-success-bg text-status-success-text',
    scope: 'Carrier Portal',
    desc: 'Coordinates freight carriers, tender manifests, bill of lading (BOL) documentation, rate quotes, and EDI 214 transit status.',
  },
  {
    name: 'Viewer / Auditor',
    icon: 'verified_user',
    iconClass: 'bg-surface-container text-text-secondary',
    badge: 'Read-Only',
    badgeClass: 'bg-status-neutral-bg text-status-neutral-text',
    scope: 'Audit Reports',
    desc: 'Read-only access to historical movement ledgers, inventory valuations, compliance exports, and internal financial audit records.',
  },
]

function Roles() {
  return (
    <section id="about" className="w-full bg-surface py-space-xl lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-table-header uppercase tracking-wider text-primary">
            Governance &amp; Operations
          </span>
          <h2 className="mt-1 text-headline-h1 font-bold text-text-primary">Designed Around Your Team.</h2>
          <p className="mt-2 text-body-default text-text-secondary">
            Organize access, shifts, and accountability with granular role-based permissions tailored
            for industrial supply chains.
          </p>
        </motion.div>

        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          animate="visible"
          className="mt-space-xl space-y-2"
        >
          {ROLES.map((r) => (
            <motion.div
              key={r.name}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -2, boxShadow: '0 8px 16px rgba(24,33,47,0.06)' }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-app-bg p-4 sm:px-6 sm:py-4 transition-colors duration-200 hover:bg-surface"
            >
              <div className="flex items-center gap-4">
                <motion.div whileHover={{ scale: 1.1 }}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${r.iconClass}`}
                >
                  <span className="material-symbols-outlined text-[20px]">{r.icon}</span>
                </motion.div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h4 className="text-headline-h3 font-semibold text-text-primary">{r.name}</h4>
                    <span
                      className={`rounded px-2 py-0.5 text-caption-meta font-semibold text-[11px] ${r.badgeClass}`}
                    >
                      {r.badge}
                    </span>
                  </div>
                  <p className="text-body-default text-text-secondary mt-0.5">{r.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="rounded bg-surface px-3 py-1 text-caption-meta text-text-secondary shadow-sm">
                  {r.scope}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Final CTA                                                         */
/* ------------------------------------------------------------------ */

function FinalCta() {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="w-full bg-sidebar-bg py-space-xl lg:py-24 text-sidebar-text"
    >
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-surface/5 p-space-xl lg:p-16 text-center">
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-96 rounded-full bg-primary/20 blur-3xl" />
          <motion.div
            variants={stagger(0.1)}
            initial="hidden"
            animate="visible"
            className="relative z-10 mx-auto max-w-3xl"
          >
            <span className="text-table-header uppercase tracking-wider text-primary-fixed">
              Ready to Modernize?
            </span>
            <h2 className="mt-2 text-headline-h1 font-bold text-on-primary">
              Bring Your Warehouse Operations Together.
            </h2>
            <p className="mt-space-md text-body-default text-sidebar-muted lg:text-base">
              Get a clearer, more organized way to manage inventory, warehouse workflows, and
              shipments across all your regional distribution hubs.
            </p>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="mt-space-xl flex flex-wrap items-center justify-center gap-2 sm:gap-4"
            >
              <Link
                to="/register"
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-primary px-7 text-button-text font-semibold text-on-primary shadow transition-all hover:bg-primary-hover active:scale-[0.98]"
              >
                <span>Get Started</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <a
                href="#features"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-surface/10 px-6 text-button-text font-semibold text-on-primary hover:bg-surface/20 transition-colors"
              >
                <span>Explore Features</span>
              </a>
            </motion.div>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="mt-space-lg flex items-center justify-center gap-2 text-caption-meta text-sidebar-muted"
            >
              <span className="material-symbols-outlined text-[16px] text-status-success-text">lock</span>
              <span>Enterprise-ready WMS architecture • No credit card required to explore</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

/* ------------------------------------------------------------------ */
/* Footer                                                            */
/* ------------------------------------------------------------------ */

const FOOTER_PLATFORM = ['Inventory Telemetry', 'Yard & Dock Hub', 'Dispatch Routing', 'Terminal Scanners']

function Footer() {
  return (
    <motion.footer
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="w-full bg-sidebar-bg text-sidebar-text"
    >
      <div className="w-full px-6 lg:px-8 py-space-xl">
        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl"
        >
          <div className="lg:col-span-2 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <img src="/images/logo.png" alt="LogiTrack" className="w-9 h-9 rounded-lg object-cover shrink-0" />
              <span className="text-headline-h3 font-semibold text-sidebar-text">LogiTrack</span>
            </div>
            <p className="text-body-default text-sidebar-muted max-w-sm">
              High-throughput warehouse telemetry, multimodal inventory control, and real-time
              distribution hub management for high-velocity logistics operators.
            </p>
            <div className="flex items-center gap-2 text-sidebar-muted mt-1">
              <span className="material-symbols-outlined text-[16px] text-status-success-text">verified</span>
              <span className="text-caption-meta text-sidebar-muted">99.99% Operational Uptime</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-table-header text-sidebar-text uppercase tracking-wider">Navigation</span>
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  whileHover={{ x: 4 }}
                  className={
                    i === 0
                      ? 'transition-colors text-sidebar-text font-semibold'
                      : 'text-body-default text-sidebar-muted hover:text-sidebar-text transition-colors'
                  }
                >
                  {l.label}
                </motion.a>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-table-header text-sidebar-text uppercase tracking-wider">
              Platform Modules
            </span>
            <nav className="flex flex-col gap-1">
              {FOOTER_PLATFORM.map((p) => (
                <motion.a
                  key={p}
                  href="#features"
                  whileHover={{ x: 4 }}
                  className="text-body-default text-sidebar-muted hover:text-sidebar-text transition-colors"
                >
                  {p}
                </motion.a>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-table-header text-sidebar-text uppercase tracking-wider">Enterprise</span>
            <div className="flex flex-col gap-1">
              <span className="text-body-default text-sidebar-muted">Direct Dispatch Support:</span>
              <span className="text-body-default font-semibold text-sidebar-text">
                dispatch@logitrack.internal
              </span>
              <span className="text-caption-meta text-sidebar-muted mt-1">Terminal ID: WH-CENTRAL-01</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="mt-space-xl pt-4 flex flex-col sm:flex-row items-center justify-between gap-2"
        >
          <span className="text-caption-meta text-sidebar-muted">
            © {new Date().getFullYear()} LogiTrack Systems Inc. All industrial rights reserved.
          </span>
          <div className="flex items-center gap-4">
            {['Privacy Policy', 'Terms of Service', 'Security & SLA'].map((l) => (
              <motion.a
                key={l}
                href="#"
                whileHover={{ x: 4 }}
                className="text-caption-meta text-sidebar-muted hover:text-sidebar-text transition-colors"
              >
                {l}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.footer>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                              */
/* ------------------------------------------------------------------ */

export function LandingPage() {
  return (
    <div className="min-h-screen bg-app-bg">
      <Header />
      <main className="w-full bg-app-bg flex-1">
        <Hero />
        <PlatformOverview />
        <FeatureShowcase />
        <Benefits />
        <DashboardPreview />
        <Roles />
        <FinalCta />
        <Footer />
      </main>
    </div>
  )
}
