import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { listProducts } from '../products/api'
import { listWarehouses, listLocations } from '../warehouses/api'
import { createOutboundOrder } from './api'

interface ItemRow {
  productId: string
  storageLocationId: string
  requestedQuantity: string
}

export function CreateOutboundOrderPage() {
  const navigate = useNavigate()
  const [referenceNumber, setReferenceNumber] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<ItemRow[]>([
    { productId: '', storageLocationId: '', requestedQuantity: '1' },
  ])
  const [productOptions, setProductOptions] = useState<{ value: string; label: string }[]>([])
  const [warehouseOptions, setWarehouseOptions] = useState<{ value: string; label: string }[]>([])
  const [locationOptions, setLocationOptions] = useState<{ value: string; label: string }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    listProducts(undefined, 0, 100).then((d) =>
      setProductOptions(d.content.map((p) => ({ value: String(p.id), label: `${p.name} (${p.sku})` }))),
    )
    listWarehouses(undefined, 0, 100).then((d) =>
      setWarehouseOptions(d.content.map((w) => ({ value: String(w.id), label: w.name }))),
    )
  }, [])

  useEffect(() => {
    if (warehouseId) {
      listLocations(Number(warehouseId), undefined, 0, 100).then((d) =>
        setLocationOptions(d.content.map((l) => ({ value: String(l.id), label: l.code }))),
      )
    } else {
      setLocationOptions([])
    }
  }, [warehouseId])

  function updateItem(index: number, field: keyof ItemRow, value: string) {
    setItems((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  function addItem() {
    setItems((prev) => [...prev, { productId: '', storageLocationId: '', requestedQuantity: '1' }])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsedItems = items.map((i) => ({
      productId: Number(i.productId),
      storageLocationId: Number(i.storageLocationId),
      requestedQuantity: Number(i.requestedQuantity),
    }))
    setLoading(true)
    setError(null)
    try {
      await createOutboundOrder({
        referenceNumber,
        warehouseId: Number(warehouseId),
        notes: notes || undefined,
        items: parsedItems,
      })
      navigate('/app/outbound')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="text-caption-meta text-text-secondary mb-2 flex items-center gap-1.5">
        <Link to="/app/outbound" className="hover:text-primary">
          Outbound Operations
        </Link>
        <span className="text-text-secondary/50">/</span>
        <span className="text-text-primary font-semibold">New Outbound Order</span>
      </div>

      <h1 className="text-headline-h1 font-bold text-text-primary">Create Outbound Order</h1>

      <form className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6" onSubmit={handleSubmit}>
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-xl border border-border-default p-space-lg shadow-sm">
            <h2 className="text-headline-h3 font-semibold text-text-primary">General Information</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-form-label text-text-primary">Reference number *</label>
                <input
                  className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g. SO-2026-00001"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-form-label text-text-primary">Source warehouse *</label>
                <Select
                  value={warehouseId}
                  onChange={setWarehouseId}
                  placeholder="Select warehouse"
                  options={warehouseOptions}
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-form-label text-text-primary">Notes</label>
                <textarea
                  className="px-3 py-2 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-border-default p-space-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-headline-h3 font-semibold text-text-primary">Items</h2>
              <Button type="button" variant="secondary" icon="add" onClick={addItem}>
                Add item
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-3 rounded-lg bg-app-bg">
                  <div className="sm:col-span-5 flex flex-col gap-1.5">
                    <label className="text-form-label text-text-primary">Product *</label>
                    <Select
                      value={item.productId}
                      onChange={(v) => updateItem(index, 'productId', v)}
                      placeholder="Select product"
                      options={productOptions}
                    />
                  </div>
                  <div className="sm:col-span-3 flex flex-col gap-1.5">
                    <label className="text-form-label text-text-primary">Location *</label>
                    <Select
                      value={item.storageLocationId}
                      onChange={(v) => updateItem(index, 'storageLocationId', v)}
                      placeholder="Select location"
                      options={locationOptions}
                    />
                  </div>
                  <div className="sm:col-span-3 flex flex-col gap-1.5">
                    <label className="text-form-label text-text-primary">Quantity *</label>
                    <input
                      type="number"
                      min={1}
                      className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                      value={item.requestedQuantity}
                      onChange={(e) => updateItem(index, 'requestedQuantity', e.target.value)}
                      required
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      className="p-2 rounded-lg text-text-secondary hover:text-status-danger-text transition-colors"
                      onClick={() => removeItem(index)}
                      title="Remove item"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-surface rounded-xl border border-border-default p-space-lg shadow-sm">
            <h2 className="text-headline-h3 font-semibold text-text-primary">Order Summary</h2>
            <div className="mt-3 space-y-2 text-body-default">
              <div className="flex justify-between text-text-secondary">
                <span>Items</span>
                <span className="font-semibold text-text-primary tabular-nums">{items.length}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Total quantity</span>
                <span className="font-semibold text-text-primary tabular-nums">
                  {items.reduce((sum, i) => sum + (Number(i.requestedQuantity) || 0), 0)}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-status-danger-bg text-status-danger-text text-caption-meta">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/app/outbound')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Outbound Order'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
