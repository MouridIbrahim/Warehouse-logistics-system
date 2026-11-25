import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-context'
import { ADMIN_MANAGER, AUDIT_VIEW, OPERATIONS, SHIPMENT_MANAGE } from '../../features/auth/permissions'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface OnboardingValue {
  restartTour: () => void
}

const OnboardingContext = createContext<OnboardingValue | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const roleKey = user?.roles.slice().sort().join(',') ?? ''
  const storageKey = user ? `logitrack:onboarding:v1:${user.id}:${roleKey}` : ''

  useEffect(() => {
    if (!storageKey) {
      setIsReady(false)
      setIsOpen(false)
      return
    }

    setIsOpen(localStorage.getItem(storageKey) !== 'complete')
    setIsReady(true)
  }, [storageKey])

  const finishTour = () => {
    if (storageKey) localStorage.setItem(storageKey, 'complete')
    setIsOpen(false)
  }

  const value = useMemo(() => ({
    restartTour: () => setIsOpen(true),
  }), [])

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      {isReady && user && (
        <OnboardingGuide user={user} open={isOpen} onFinish={finishTour} />
      )}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider')
  return context
}

function OnboardingGuide({
  user,
  open,
  onFinish,
}: {
  user: NonNullable<ReturnType<typeof useAuth>['user']>
  open: boolean
  onFinish: () => void
}) {
  const steps = getOnboardingSteps(user.roles, user.displayName)
  const [stepIndex, setStepIndex] = useState(0)
  const step = steps[stepIndex]

  useEffect(() => {
    if (open) setStepIndex(0)
  }, [open])

  return (
    <Modal open={open} onClose={onFinish} title="Welcome to LogiTrack">
      <div aria-live="polite">
        <p className="text-caption-meta text-text-secondary">
          Step {stepIndex + 1} of {steps.length}
        </p>
        <div className="mt-2 h-1.5 rounded-full bg-app-bg" aria-label="Tour progress">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
        <h3 className="mt-5 text-headline-h3 font-semibold text-text-primary">{step.title}</h3>
        <p className="mt-2 text-body-default text-text-secondary">{step.description}</p>
        {step.links.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {step.links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={onFinish}
                className="inline-flex min-h-10 items-center rounded-lg border border-border-default px-3 text-body-default font-semibold text-primary hover:bg-app-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="mt-6 flex items-center justify-between gap-2 border-t border-border-default pt-4">
        <Button type="button" variant="ghost" onClick={onFinish}>
          Skip tour
        </Button>
        <div className="flex gap-2">
          {stepIndex > 0 && (
            <Button type="button" variant="secondary" onClick={() => setStepIndex((current) => current - 1)}>
              Back
            </Button>
          )}
          {stepIndex < steps.length - 1 ? (
            <Button type="button" onClick={() => setStepIndex((current) => current + 1)}>
              Next
            </Button>
          ) : (
            <Button type="button" onClick={onFinish}>
              Finish
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

function getOnboardingSteps(roles: string[], displayName: string) {
  const includesRole = (allowedRoles: string[]) => roles.some((role) => allowedRoles.includes(role))
  const isOperations = includesRole(OPERATIONS)
  const isManager = includesRole(ADMIN_MANAGER)
  const isShipmentManager = includesRole(SHIPMENT_MANAGE)
  const isAuditor = includesRole(AUDIT_VIEW)

  const links = isOperations
    ? [
        { label: 'Receive goods', to: '/app/inbound' },
        { label: 'Prepare dispatch', to: '/app/outbound' },
        { label: 'Check stock', to: '/app/inventory' },
      ]
    : isShipmentManager
      ? [{ label: 'Track shipments', to: '/app/shipments' }]
      : [{ label: 'View reports', to: '/app/reports' }]

  if (isAuditor && !isOperations) links.push({ label: 'Review audit logs', to: '/app/audit-logs' })
  if (isManager) links.push({ label: 'Manage products', to: '/app/products' })

  const responsibility = isOperations
    ? 'Your work centers on receiving, outbound orders, and accurate stock records.'
    : isShipmentManager
      ? 'Your work centers on shipment tracking, status updates, and delivery records.'
      : isAuditor
        ? 'Your work centers on reviewing operational data, reports, and audit history.'
        : 'Use the dashboard to find the operational information available to your account.'

  return [
    {
      title: `Welcome, ${displayName}`,
      description: 'LogiTrack brings warehouse operations, stock, and shipments into one place. This short tour shows where to start.',
      links: [],
    },
    {
      title: 'Your dashboard',
      description: `Start here for a role-relevant summary and shortcuts. ${responsibility}`,
      links: [{ label: 'Go to dashboard', to: '/app' }],
    },
    {
      title: 'Find work by task',
      description: 'Use the sidebar to move between daily work, stock and product records, reports, and account settings. Items appear according to your role.',
      links: [],
    },
    {
      title: 'Start with a common task',
      description: 'Choose a starting point below. You can reopen this guide from your account menu at any time.',
      links,
    },
  ]
}
