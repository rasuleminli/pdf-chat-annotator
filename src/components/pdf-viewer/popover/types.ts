import type { SelectionRect } from '@/features/realtime-cursors/hooks/lib/types'

export type PopoverState = {
    x: number
    y: number
    text: string
    rects: SelectionRect[]
}
