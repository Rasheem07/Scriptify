import React, { ReactNode } from 'react'
import { cn } from '@/app/lib/utils'

type Props = {}

export default function MaxWidthWrapper({children, className}: {children: ReactNode, className?: string}) {
  return (
    <div className={cn('mx-auto w-full max-w-screen-xl px-2.5 md:px-20', className)}>
        {children}
    </div>
  )
}