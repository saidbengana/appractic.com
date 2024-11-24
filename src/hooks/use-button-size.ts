import { useMemo } from 'react'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export const useButtonSize = (size: ButtonSize) => {
  const sizeClass = useMemo(() => {
    const sizes = {
      'xs': 'py-1 px-2',
      'sm': 'px-3 py-2',
      'md': 'px-4 py-2',
      'lg': 'px-4 py-3',
    } as const

    return sizes[size]
  }, [size])

  return {
    sizeClass,
  }
}
