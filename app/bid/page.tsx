import { Button } from '@/components/ui/button'
import React from 'react'

function page() {
  return (
    <div
    className="w-full h-full min-h-screen flex flex-col items-center justify-center rounded-lg border border-dashed shadow-sm"
  >
    <div className="flex flex-col items-center gap-1 text-center">
      <h3 className="text-2xl font-bold tracking-tight">
        No auctions found
      </h3>
      <p className="text-sm text-muted-foreground">
        currently there are no auctions running.
      </p>
    </div>
  </div>
  )
}

export default page