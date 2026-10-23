import { useEffect } from 'react'

/** Closes dialogs with Escape so keyboard users can leave overlays. */
export function useEscapeKey(isOpen, onEscape) {
  useEffect(() => {
    if (!isOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onEscape()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onEscape])
}
