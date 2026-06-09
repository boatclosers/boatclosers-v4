'use client'

import dynamic from 'next/dynamic'

const BoatClosersApp = dynamic(
  () => import('@/components/BoatClosersApp'),
  { ssr: false }
)

export default function Page() {
  return <BoatClosersApp />
}
