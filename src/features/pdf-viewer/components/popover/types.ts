import type { SelectionRect } from '@/lib/types'

export type PopoverState = {
    x: number
    y: number
    text: string
    rects: SelectionRect[]
}
