import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { WorkflowProgress } from '../../components/ui/WorkflowProgress'
import { listProducts } from '../products/api'
import { listWarehouses, listLocations } from '../warehouses/api'
import { createInboundOrder } from './api'

interface ItemRow {
  productId: string
  storageLocationId: string
  receivedQuantity: string
}
import { useFormDraft } from '../../components/ui/toast'

export function CreateInboundOrderPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [draftData, saveDraft, clearDraft] = useFormDraft<{
    referenceNumber: string
    warehouseId: string
    notes: string
    items: ItemRow[]
  }>('inbound-create', {
    referenceNumber: '',
    warehouseId: '',
    notes: '',
    items: [{ productId: '', storageLocationId: '', receivedQuantity: '1' }],
  })

  const [referenceNumber, setReferenceNumber] = useState(draftData.referenceNumber)
  const [warehouseId, setWarehouseId] = useState(draftData.warehouseId)
  const [notes, setNotes] = useState(draftData.notes)
  const [items, setItems] = useState(draftData.items)
  const [productOptions, setProductOptions] = useState<{ value: string; label: string }[]>([])
  const [warehouseOptions, setWarehouseOptions] = useState<{ value: string; label: string }[]>([])
  const [locationOptions, setLocationOptions] = useState<{ value: string; label: string }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Persist form draft as user types
  useEffect(() => {
    saveDraft({
      referenceNumber,
      warehouseId,
      notes,
      items,
    })
  }, [referenceNumber, warehouseId, notes, items, saveDraft])

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
    setItems((prev) => [...prev, { productId: '', storageLocationId: '', receivedQuantity: '1' }])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (currentStep !== 3) return
    const parsedItems = items.map((i) => ({
      productId: Number(i.productId),
      storageLocationId: Number(i.storageLocationId),
      receivedQuantity: Number(i.receivedQuantity),
    }))
    setLoading(true)
    setError(null)
    try {
      await createInboundOrder({
        referenceNumber,
        warehouseId: Number(warehouseId),
        notes: notes || undefined,
        items: parsedItems,
      })
      clearDraft()
      navigate('/app/inbound')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  function continueWorkflow() {
    setError(null)
    if (currentStep === 1 && (!referenceNumber.trim() || !warehouseId)) {
      setError('Enter a reference number and select the destination warehouse before continuing.')
      return
    }
    if (currentStep === 2 && items.some((item) =>
      !item.productId || !item.storageLocationId || !Number.isFinite(Number(item.receivedQuantity)) || Number(item.receivedQuantity) < 1,
    )) {
      setError('Complete each item with a product, location, and quantity of at least 1.')
      return
    }
    setCurrentStep((step) => Math.min(step + 1, 3))
  }

  const warehouseName = warehouseOptions.find((option) => option.value === warehouseId)?.label ?? 'Not selected'

  return (
    <div>
      <div className="text-caption-meta text-text-secondary mb-2 flex items-center gap-1.5">
        <Link to="/app/inbound" className="hover:text-primary">
          Inbound Operations
        </Link>
        <span className="text-text-secondary/50">/</span>
        <span className="text-text-primary font-semibold">New Inbound Order</span>
      </div>

      <h1 className="text-headline-h1 font-bold text-text-primary">Create Inbound Order</h1>
      <p className="mt-1 text-body-default text-text-secondary">
        Record goods expected at your warehouse. You can review all details before creating the order.
      </p>

      <form className="mt-6" onSubmit={handleSubmit}>
        <WorkflowProgress steps={['Order details', 'Items', 'Review']} currentStep={currentStep} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {currentStep === 1 && (
          <div className="bg-surface rounded-xl border border-border-default p-space-lg shadow-sm">
            <h2 className="text-headline-h3 font-semibold text-text-primary">General Information</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="inbound-reference" className="text-form-label text-text-primary">Reference number *</label>
                <input
                  id="inbound-reference"
                  className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g. PO-2026-00001"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  required={currentStep === 1}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="inbound-warehouse" className="text-form-label text-text-primary">Destination warehouse *</label>
                <Select
                  id="inbound-warehouse"
                  value={warehouseId}
                  onChange={(value) => {
                    setWarehouseId(value)
                    setItems((current) => current.map((item) => ({ ...item, storageLocationId: '' })))
                  }}
                  placeholder="Select warehouse"
                  options={warehouseOptions}
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="inbound-notes" className="text-form-label text-text-primary">Notes</label>
                <textarea
                  id="inbound-notes"
                  className="px-3 py-2 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
          )}

          {currentStep === 2 && (
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
                      <label htmlFor={`inbound-product-${index}`} className="text-form-label text-text-primary">Product *</label>
                      <Select id={`inbound-product-${index}`} value={item.productId} onChange={(v) => updateItem(index, 'productId', v)} placeholder="Select product" options={productOptions} />
                    </div>
                    <div className="sm:col-span-3 flex flex-col gap-1.5">
                      <label htmlFor={`inbound-location-${index}`} className="text-form-label text-text-primary">Location *</label>
                      <Select id={`inbound-location-${index}`} value={item.storageLocationId} onChange={(v) => updateItem(index, 'storageLocationId', v)} placeholder="Select location" options={locationOptions} />
                    </div>
                    <div className="sm:col-span-3 flex flex-col gap-1.5">
                      <label htmlFor={`inbound-quantity-${index}`} className="text-form-label text-text-primary">Quantity *</label>
                      <input id={`inbound-quantity-${index}`} type="number" min={1} className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" value={item.receivedQuantity} onChange={(e) => updateItem(index, 'receivedQuantity', e.target.value)} required />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button type="button" aria-label={`Remove item ${index + 1}`} className="p-2 rounded-lg text-text-secondary hover:text-status-danger-text transition-colors" onClick={() => removeItem(index)}>
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <section aria-labelledby="inbound-review-title" className="bg-surface rounded-xl border border-border-default p-space-lg shadow-sm">
              <h2 id="inbound-review-title" className="text-headline-h3 font-semibold text-text-primary">Review inbound order</h2>
              <p className="mt-1 text-caption-meta text-text-secondary">Check the destination and quantities before creating this order.</p>
              <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-body-default">
                <div><dt className="text-caption-meta text-text-secondary">Reference</dt><dd className="font-semibold">{referenceNumber}</dd></div>
                <div><dt className="text-caption-meta text-text-secondary">Destination warehouse</dt><dd className="font-semibold">{warehouseName}</dd></div>
                {notes && <div className="sm:col-span-2"><dt className="text-caption-meta text-text-secondary">Notes</dt><dd>{notes}</dd></div>}
              </dl>
              <ul className="mt-4 divide-y divide-border-default border-y border-border-default">
                {items.map((item, index) => (
                  <li key={`${item.productId}-${index}`} className="flex flex-wrap justify-between gap-2 py-3 text-body-default">
                    <span>{productOptions.find((option) => option.value === item.productId)?.label ?? 'Product'} · Location {locationOptions.find((option) => option.value === item.storageLocationId)?.label ?? item.storageLocationId}</span>
                    <span className="font-semibold tabular-nums">{item.receivedQuantity} units</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
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
                  {items.reduce((sum, i) => sum + (Number(i.receivedQuantity) || 0), 0)}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div role="alert" className="p-3 rounded-lg bg-status-danger-bg text-status-danger-text text-caption-meta">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/app/inbound')}>
              Cancel
            </Button>
            {currentStep > 1 && (
              <Button type="button" variant="secondary" onClick={() => { setError(null); setCurrentStep((step) => step - 1) }}>
                Back
              </Button>
            )}
            {currentStep < 3 ? (
              <Button type="button" onClick={continueWorkflow} className="flex-1">
                {currentStep === 1 ? 'Continue to items' : 'Review order'}
              </Button>
            ) : (
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create inbound order'}
              </Button>
            )}
          </div>
        </div>
        </div>
      </form>
    </div>
  )
}
