import { useEffect, useState } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export function parseDeviceType(): DeviceType {
  if (typeof window === 'undefined' || !window) return 'desktop'

  // Using both user agent and screen dimensions for better accuracy
  const userAgent = navigator.userAgent.toLowerCase()
  const width = window.innerWidth
  const height = window.innerHeight
  const ratio = width / height

  // iPadOS 13+ detection (it reports as MacOS)
  const isIPadOS =
    userAgent.includes('macintosh') && navigator.maxTouchPoints > 1

  // Tablet detection based on screen size and touch capability
  const isTabletByDimensions =
    width >= 600 && // Min tablet width
    width <= 1200 && // Max tablet width
    ratio <= 1.3 && // Portrait-ish aspect ratio
    (navigator.maxTouchPoints > 0 || 'ontouchstart' in window)

  if (
    /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent,
    ) ||
    (width < 600 && navigator.maxTouchPoints > 0)
  ) {
    return 'mobile'
  }

  if (isIPadOS || /ipad/i.test(userAgent) || isTabletByDimensions) {
    return 'tablet'
  }

  return 'desktop'
}

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>(parseDeviceType())

  useEffect(() => {
    const updateDeviceType = () => setDeviceType(parseDeviceType())

    // Initial check
    updateDeviceType()

    // Update on resize
    window.addEventListener('resize', updateDeviceType)

    // Cleanup
    return () => window.removeEventListener('resize', updateDeviceType)
  }, [])

  return deviceType
}
