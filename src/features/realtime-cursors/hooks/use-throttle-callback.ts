import { useCallback, useRef } from 'react'

/**
 * Throttle a callback to a certain delay, It will only call the callback if the delay has passed, with the arguments
 * from the last call
 */
export const useThrottleCallback = <Params extends unknown[], Return>(
    callback: (...args: Params) => Return,
    delay: number
) => {
    const lastCall = useRef(0)
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    return useCallback(
        (...args: Params) => {
            const now = Date.now()
            const remainingTime = delay - (now - lastCall.current)

            if (remainingTime <= 0) {
                if (timeout.current) {
                    clearTimeout(timeout.current)
                    timeout.current = null
                }
                lastCall.current = now
                callback(...args)
            } else if (!timeout.current) {
                timeout.current = setTimeout(() => {
                    lastCall.current = Date.now()
                    timeout.current = null
                    callback(...args)
                }, remainingTime)
            }
        },
        [callback, delay]
    )
}
