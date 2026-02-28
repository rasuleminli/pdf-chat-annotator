export type CursorEventPayload = {
    position: {
        x: number
        y: number
    }
    user: {
        id: number
        name: string
    }
    color: string
    timestamp: number
}
