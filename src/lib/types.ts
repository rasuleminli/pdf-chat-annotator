export type SelectionRect = {
    x: number
    y: number
    width: number
    height: number
}

export type SelectionPayload = {
    rects: SelectionRect[]
    user: { id: number; name: string }
    color: string
}

export type HighlightPayload = SelectionPayload & {
    id: string
    text: string
}

export type HighlightReference = { id: string; text: string }
