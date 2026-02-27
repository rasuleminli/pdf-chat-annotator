import type { SelectionRect } from '@/features/realtime-cursors/hooks/lib/types'

export type HighlightReference = { id: string; text: string }

export type HandleReferenceInChatFn = (
    rects: SelectionRect[],
    text: string
) => void
