'use client'

import { useTheme } from 'next-themes'
import { Button } from '../ui/button'
import { Moon, Sun } from 'lucide-react'

export default function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return resolvedTheme === 'dark' ? (
    <Button size={'icon'} variant={'ghost'} onClick={() => setTheme('light')}>
      <Sun />
    </Button>
  ) : (
    <Button size={'icon'} variant={'ghost'} onClick={() => setTheme('dark')}>
      <Moon />
    </Button>
  )
}
