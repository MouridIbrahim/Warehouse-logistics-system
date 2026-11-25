import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BarcodeScanner } from './BarcodeScanner'

const { decodeFromImageUrl, decodeFromVideoDevice } = vi.hoisted(() => ({
  decodeFromImageUrl: vi.fn(),
  decodeFromVideoDevice: vi.fn(),
}))

vi.mock('@zxing/browser', () => ({
  BrowserMultiFormatReader: class {
    decodeFromImageUrl(...args: unknown[]) {
      return decodeFromImageUrl(...args)
    }

    decodeFromVideoDevice(...args: unknown[]) {
      return decodeFromVideoDevice(...args)
    }
  },
}))

type TestScanCallback = (
  result: { getText: () => string } | undefined,
  error: unknown,
  controls: { stop: () => void },
) => void

describe('BarcodeScanner', () => {
  afterEach(cleanup)

  beforeEach(() => {
    decodeFromImageUrl.mockReset()
    decodeFromVideoDevice.mockReset()
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: vi.fn() },
    })
  })

  it('passes a decoded SKU to the caller and stops the camera', async () => {
    const controls = { stop: vi.fn() }
    let scan: TestScanCallback | undefined
    decodeFromVideoDevice.mockImplementation((...args: unknown[]) => {
      scan = args[2] as TestScanCallback
      return Promise.resolve(controls)
    })
    const onDetected = vi.fn()

    render(<BarcodeScanner onDetected={onDetected} />)

    await waitFor(() => expect(decodeFromVideoDevice).toHaveBeenCalled())
    act(() => scan?.({ getText: () => 'SKU-100' }, undefined, controls))

    expect(onDetected).toHaveBeenCalledWith('SKU-100')
    expect(controls.stop).toHaveBeenCalledOnce()
  })

  it('shows a useful error when camera permission is denied', async () => {
    decodeFromVideoDevice.mockRejectedValue(new DOMException('Denied', 'NotAllowedError'))

    render(<BarcodeScanner onDetected={vi.fn()} />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Camera access was denied.',
    )
  })

  it('decodes an imported image and releases its object URL', async () => {
    const controls = { stop: vi.fn() }
    decodeFromVideoDevice.mockResolvedValue(controls)
    decodeFromImageUrl.mockResolvedValue({ getText: () => 'SKU-200' })
    const createObjectURL = vi.fn(() => 'blob:barcode-image')
    const revokeObjectURL = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL })
    const onDetected = vi.fn()

    render(<BarcodeScanner onDetected={onDetected} />)

    const file = new File(['image'], 'barcode.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText('Import barcode or QR code image'), {
      target: { files: [file] },
    })

    await waitFor(() => expect(decodeFromImageUrl).toHaveBeenCalledWith('blob:barcode-image'))
    expect(onDetected).toHaveBeenCalledWith('SKU-200')
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:barcode-image')
    expect(controls.stop).toHaveBeenCalled()
  })
})
