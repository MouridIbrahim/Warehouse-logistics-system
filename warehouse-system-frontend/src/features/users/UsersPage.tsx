import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { PageResponse, UserDto } from '../../types'
import { formatDateTime } from '../../lib/format'
import { getErrorMessage } from '../../lib/api'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { FilterToolbar } from '../../components/ui/filter'
import { ActiveFilterChips } from '../../components/ui/filter'
import { createUser, getUser, listRoles, listUsers, resetUserPassword, updateUser } from './api'
import type { RoleDto } from './api'

function roleLabel(name: string): string {
  return name
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function RoleCheckboxes({
  roles,
  selected,
  onChange,
}: {
  roles: RoleDto[]
  selected: string[]
  onChange: (roles: string[]) => void
}) {
  function toggle(roleName: string) {
    onChange(
      selected.includes(roleName)
        ? selected.filter((r) => r !== roleName)
        : [...selected, roleName],
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {roles.map((r) => (
        <label key={r.id} className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-4 h-4 rounded accent-[#C45D16]"
            checked={selected.includes(r.name)}
            onChange={() => toggle(r.name)}
          />
          <span className="text-body-default text-text-primary">{roleLabel(r.name)}</span>
        </label>
      ))}
    </div>
  )
}

export function UsersPage() {
  const [term, setTerm] = useState('')
  const [role, setRole] = useState('')
  const [active, setActive] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [data, setData] = useState<PageResponse<UserDto> | null>(null)
  const [roles, setRoles] = useState<RoleDto[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<UserDto | null>(null)
  const [resetTarget, setResetTarget] = useState<UserDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    listUsers(term || undefined, role || undefined, active ? active === 'true' : undefined, page, size)
      .then(setData)
      .finally(() => setLoading(false))
  }, [term, role, active, page, size])

  useEffect(() => {
    listRoles().then(setRoles)
  }, [])

  function refresh() {
    setLoading(true)
    listUsers(term || undefined, role || undefined, active ? active === 'true' : undefined, page, size).then(setData).finally(() => setLoading(false))
  }

  const activeChips = [
    ...(term ? [{ key: 'search', label: `Search: "${term}"`, value: term, onRemove: () => setTerm('') }] : []),
    ...(role
      ? [{ key: 'role', label: `Role: ${roleLabel(role)}`, value: role, onRemove: () => setRole('') }]
      : []),
    ...(active ? [{ key: 'active', label: `Status: ${active === 'true' ? 'Active' : 'Inactive'}`, value: active, onRemove: () => setActive('') }] : []),
  ]

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Manage application users and access."
        actions={
          <Button icon="add" onClick={() => setShowCreate(true)}>
            Add User
          </Button>
        }
      />

      {activeChips.length > 0 && (
        <ActiveFilterChips chips={activeChips} onClearAll={() => { setTerm(''); setRole('') }} />
      )}

      <div className="mt-6 bg-surface rounded-xl border border-border-default shadow-sm overflow-hidden">
        <div className="p-space-md border-b border-border-default">
          <FilterToolbar
            search={{
              value: term,
              onChange: setTerm,
              placeholder: 'Search by name or username...',
            }}
            selects={[
              {
                key: 'role',
                value: role,
                onChange: setRole,
                options: roles.map((r) => ({ value: r.name, label: roleLabel(r.name) })),
                placeholder: 'All roles',
              },
              {
                key: 'active',
                value: active,
                onChange: setActive,
                options: [
                  { value: 'true', label: 'Active' },
                  { value: 'false', label: 'Inactive' },
                ],
                placeholder: 'All statuses',
              },
            ]}
            onReset={() => { setTerm(''); setRole(''); setActive('') }}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-app-bg text-table-header uppercase text-text-secondary select-none">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Roles</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/60 text-body-default text-text-primary">
              {loading && !data ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                    <span className="material-symbols-outlined animate-spin align-middle mr-2">sync</span>
                    Loading users...
                  </td>
                </tr>
              ) : data && data.content.length > 0 ? (
                data.content.map((u) => (
                  <tr key={u.id} className="hover:bg-app-bg/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                          {u.displayName?.charAt(0) ?? 'U'}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-body-semibold text-text-primary truncate">{u.displayName}</span>
                          <span className="text-caption-meta text-text-secondary truncate">@{u.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-table-data text-text-secondary">
                        {u.roles.map(roleLabel).join(', ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge tone={u.active ? 'success' : 'neutral'}>
                        {u.active ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-table-data text-text-secondary tabular-nums">
                        {formatDateTime(u.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-1 rounded text-text-secondary hover:text-primary transition-colors"
                          title="Edit user"
                          onClick={() => setEditTarget(u)}
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          className="p-1 rounded text-text-secondary hover:text-primary transition-colors"
                          title="Reset password"
                          onClick={() => setResetTarget(u)}
                        >
                          <span className="material-symbols-outlined text-[18px]">key</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon="group"
                      title="No users found"
                      description="Add your first user to grant access to the system."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalElements > 0 && (
          <Pagination
            page={page}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            size={size}
            onPageChange={setPage}
            onSizeChange={(s) => {
              setSize(s)
              setPage(0)
            }}
          />
        )}
      </div>

      <CreateUserModal
        roles={roles}
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={refresh}
      />
      <EditUserModal
        roles={roles}
        user={editTarget}
        onClose={() => setEditTarget(null)}
        onUpdated={refresh}
      />
      <ResetPasswordModal
        user={resetTarget}
        onClose={() => setResetTarget(null)}
      />
    </div>
  )
}

function CreateUserModal({
  roles,
  open,
  onClose,
  onCreated,
}: {
  roles: RoleDto[]
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await createUser({ username, password, displayName, roles: selectedRoles })
      setUsername('')
      setDisplayName('')
      setPassword('')
      setSelectedRoles([])
      onCreated()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add User">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Full name *</label>
          <input
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Username *</label>
          <input
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Password *</label>
          <input
            type="password"
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Roles *</label>
          <RoleCheckboxes roles={roles} selected={selectedRoles} onChange={setSelectedRoles} />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-status-danger-bg text-status-danger-text text-caption-meta">{error}</div>
        )}

        <div className="flex items-center justify-end gap-2 mt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function EditUserModal({
  roles,
  user,
  onClose,
  onUpdated,
}: {
  roles: RoleDto[]
  user: UserDto | null
  onClose: () => void
  onUpdated: () => void
}) {
  const [displayName, setDisplayName] = useState('')
  const [active, setActive] = useState(true)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setError(null)
      getUser(user.id)
        .then((u) => {
          setDisplayName(u.displayName)
          setActive(u.active)
          setSelectedRoles(u.roles)
        })
        .catch((err) => setError(getErrorMessage(err)))
    }
  }, [user])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      await updateUser(user.id, { displayName, active, roles: selectedRoles })
      onUpdated()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={!!user} onClose={onClose} title="Edit User">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Full name</label>
          <input
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-4 h-4 rounded accent-[#C45D16]"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          <span className="text-body-default text-text-primary">Account active</span>
        </label>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Roles</label>
          <RoleCheckboxes roles={roles} selected={selectedRoles} onChange={setSelectedRoles} />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-status-danger-bg text-status-danger-text text-caption-meta">{error}</div>
        )}

        <div className="flex items-center justify-end gap-2 mt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function ResetPasswordModal({ user, onClose }: { user: UserDto | null; onClose: () => void }) {
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (user) {
      setNewPassword('')
      setError(null)
      setDone(false)
    }
  }, [user])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      await resetUserPassword(user.id, newPassword)
      setDone(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={!!user} onClose={onClose} title="Reset Password">
      {done ? (
        <div className="text-center py-4">
          <span className="material-symbols-outlined text-[40px] text-status-success-text">check_circle</span>
          <p className="text-body-default text-text-primary mt-2">Password updated for {user?.displayName}.</p>
          <Button className="mt-4" onClick={onClose}>
            Done
          </Button>
        </div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <p className="text-body-default text-text-secondary">
            Set a new password for <strong className="text-text-primary">{user?.displayName}</strong>.
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="text-form-label text-text-primary">New password *</label>
            <input
              type="password"
              className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-status-danger-bg text-status-danger-text text-caption-meta">{error}</div>
          )}

          <div className="flex items-center justify-end gap-2 mt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
