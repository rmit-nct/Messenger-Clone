import { InboxListRegion } from '../components/inbox-list-region'
import { PaneEmptyState } from '../../app/components/pane-empty-state'

export function InboxPage() {
  return (
    <>
      <div className="h-full md:hidden">
        <InboxListRegion />
      </div>
      <div className="hidden h-full items-center justify-center md:flex">
        <PaneEmptyState />
      </div>
    </>
  )
}
