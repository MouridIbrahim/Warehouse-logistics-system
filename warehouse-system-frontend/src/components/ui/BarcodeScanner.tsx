import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import type { IScannerControls } from '@zxing/browser'

export function BarcodeScanner({ onDetected }: { onDetected: (value: string) => void }) {
  const cameraApiAvailable = typeof navigator !== 'undefined'
    && Boolean(navigator.mediaDevices?.getUserMedia)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const resolvedRef = useRef(false)
  const [isStarting, setIsStarting] = useState(cameraApiAvailable)
  const [isReadingImage, setIsReadingImage] = useState(false)
  const [error, setError] = useState(
    cameraApiAvailable ? '' : 'Camera access is not available in this browser or page context.',
  )

  useEffect(() => {
    if (!cameraApiAvailable) return

    let active = true
    const video = videoRef.current

    const reader = readerRef.current ?? new BrowserMultiFormatReader()
    readerRef.current = reader
    const startCamera = async () => {
      if (!video) throw new Error('Unable to initialize the camera preview.')

      const controls = await reader.decodeFromVideoDevice(undefined, video, (result, _decodeError, scannerControls) => {
        if (!result || !active || resolvedRef.current) return

        resolvedRef.current = true
        scannerControls.stop()
        controlsRef.current = null
        onDetected(result.getText())
      })

      if (!active || resolvedRef.current) {
        controls.stop()
        return
      }

      controlsRef.current = controls
      setIsStarting(false)
    }

    void startCamera().catch((cameraError: unknown) => {
      if (!active) return
      setIsStarting(false)
      setError(getCameraErrorMessage(cameraError))
    })

    return () => {
      active = false
      controlsRef.current?.stop()
      controlsRef.current = null
    }
  }, [cameraApiAvailable, onDetected])

  async function handleImageFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) return

    input.value = ''
    setError('')
    setIsReadingImage(true)
    const imageUrl = URL.createObjectURL(file)

    try {
      const reader = readerRef.current ?? new BrowserMultiFormatReader()
      readerRef.current = reader
      const result = await reader.decodeFromImageUrl(imageUrl)
      const value = result.getText().trim()

      if (!value) {
        setError('No barcode or QR code was found in that image. Try a clearer image.')
        return
      }

      if (resolvedRef.current) return
      resolvedRef.current = true
      controlsRef.current?.stop()
      controlsRef.current = null
      onDetected(value)
    } catch {
      setError('Could not read a barcode or QR code from that image. Try a clear, well-lit image.')
    } finally {
      URL.revokeObjectURL(imageUrl)
      setIsReadingImage(false)
    }
  }

  return (
    <div>
      <video
        ref={videoRef}
        className="aspect-video w-full rounded-lg bg-black object-cover"
        autoPlay
        muted
        playsInline
        aria-label="Live camera preview for barcode and QR scanning"
      />
      <p className={`mt-3 text-sm ${error ? 'text-status-danger-text' : 'text-text-secondary'}`} role={error ? 'alert' : 'status'}>
        {error || (isStarting ? 'Starting camera...' : 'Point the camera at a barcode or QR code containing the product SKU.')}
      </p>
      <div className="mt-4 border-t border-border-default pt-4">
        <label htmlFor="barcode-image" className="block text-body-default font-medium text-text-primary">
          Or import an image
        </label>
        <p className="mt-1 text-caption-meta text-text-secondary">
          Upload a clear photo or screenshot of a barcode or QR code. Use this if the camera preview is black.
        </p>
        <input
          id="barcode-image"
          type="file"
          accept="image/*"
          aria-label="Import barcode or QR code image"
          className="mt-2 block w-full text-sm text-text-primary file:mr-3 file:rounded-lg file:border-0 file:bg-app-bg file:px-3 file:py-2 file:text-sm file:font-semibold file:text-text-primary"
          onChange={(event) => { void handleImageFile(event) }}
          disabled={isReadingImage}
        />
        {isReadingImage && <p className="mt-2 text-caption-meta text-text-secondary" role="status">Reading image...</p>}
      </div>
    </div>
  )
}

function getCameraErrorMessage(error: unknown): string {
  const name = error && typeof error === 'object' && 'name' in error
    ? String(error.name)
    : ''

  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return 'Camera access was denied. Allow camera access in your browser settings and try again.'
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'No camera was found on this device.'
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return 'The camera could not start. It may already be in use by another application.'
  }

  return error instanceof Error ? error.message : 'Unable to start the camera scanner.'
}
