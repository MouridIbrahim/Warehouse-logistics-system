import { useEffect, useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { listRoles } from '../users/api'
import type { RoleDto } from '../users/api'
import { MODULES, ROLE_ACCESS } from './permissions'
import type { Access } from './permissions'

function roleLabel(name: string): string {
  return name
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function AccessCell({ access }: { access: Access }) {
  const map: Record<Access, { icon: string; label: string; className: string }> = {
    yes: { icon: 'check_circle', label: 'Yes', className: 'text-status-success-text' },
    no: { icon: 'remove', label: 'No', className: 'text-sidebar-muted' },
    limited: { icon: 'info', label: 'Limited', className: 'text-status-warning-text' },
    read: { icon: 'visibility', label: 'Read', className: 'text-status-info-text' },
  }
  const m = map[access]
  return (
    <span className={`inline-flex items-center gap-1.5 ${m.className}`}>
      <span className="material-symbols-outlined text-[16px]">{m.icon}</span>
      <span className="text-caption-meta font-semibold">{m.label}</span>
    </span>
  )
}

export function RolesPage() {
  const [roles, setRoles] = useState<RoleDto[]>([])
  const [selected, setSelected] = useState<string>('ADMINISTRATOR')

  useEffect(() => {
    listRoles().then((rs) => {
      setRoles(rs)
      if (rs.length > 0) setSelected((s) => (rs.some((r) => r.name === s) ? s : rs[0].name))
    })
  }, [])

  const access = ROLE_ACCESS[selected] ?? {}

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        description="Understand the authorization model for each role."
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelected(role.name)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                selected === role.name
                  ? 'border-primary bg-primary/5'
                  : 'border-border-default bg-surface hover:bg-app-bg'
              }`}
            >
              <div className="text-body-semibold text-text-primary">{roleLabel(role.name)}</div>
              <div className="text-caption-meta text-text-secondary">{role.description}</div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 bg-surface rounded-xl border border-border-default shadow-sm overflow-hidden">
          <div className="p-space-md border-b border-border-default">
            <h2 className="text-headline-h3 font-semibold text-text-primary">
              {roleLabel(selected)} permissions
            </h2>
            <p className="text-caption-meta text-text-secondary mt-0.5">
              Read-only reference — enforced by the backend.
            </p>
          </div>
          <div className="divide-y divide-border-default/60">
            {MODULES.map((mod) => (
              <div key={mod.name} className="px-space-md py-3">
                <div className="text-caption-meta font-semibold uppercase tracking-wider text-text-secondary mb-2">
                  {mod.name}
                </div>
                <div className="space-y-1.5">
                  {mod.capabilities.map((cap) => (
                    <div key={cap} className="flex items-center justify-between">
                      <span className="text-body-default text-text-primary">{cap}</span>
                      <AccessCell access={access[cap] ?? 'no'} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
