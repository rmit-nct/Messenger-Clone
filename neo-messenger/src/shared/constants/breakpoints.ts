/** Team-standard breakpoints — single source of truth.
 *  Mobile <768: single pane + drawer nav; dialogs → bottom sheets.
 *  Tablet 768–1023: sidebar visible, collapsible (280px).
 *  Desktop ≥1024: full two-pane (sidebar 320–380px + conversation pane).
 *  Docs: UX Plan §5, Stitch brief A6, architecture spec §5.8. */
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const

export type Device = 'mobile' | 'tablet' | 'desktop'

export function deviceFromWidth(width: number): Device {
  if (width < BREAKPOINTS.mobile) return 'mobile'
  if (width < BREAKPOINTS.tablet) return 'tablet'
  return 'desktop'
}