import { useAuth } from '@/features/auth/hooks/use-auth'
import { LinkIcon, SendIcon, XIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Chat } from './chat/chat'
import {
    ChatEvent,
    ChatEventAddon,
    ChatEventAvatar,
    ChatEventBody,
    ChatEventContent,
    ChatEventTime,
    ChatEventTitle,
} from './chat/chat-event'
import { ChatMessages } from './chat/chat-messages'
import {
    ChatToolbar,
    ChatToolbarAddon,
    ChatToolbarButton,
    ChatToolbarTextarea,
} from './chat/chat-toolbar'
import { AuthJoinChatForm } from './components/auth-join-chat-form'
import { useLiveChat } from './hooks/use-live-chat'
import { ChatMetadata } from './components/chat-metadata'
import { cn } from '@/lib/utils'
import type { HighlightReference } from '@/features/references/lib/types'

type ChatWindowProps = {
    pendingHighlightRef: HighlightReference | null
    handleFocusHighlight: (highlightId: string) => void
    clearPendingRef: () => void
    dismissPendingRef: () => void
}

function ChatInner({
    pendingHighlightRef,
    handleFocusHighlight,
    clearPendingRef,
    dismissPendingRef,
}: ChatWindowProps) {
    const { user, loading: isUserLoading } = useAuth()

    const { messages, sendMessage } = useLiveChat(user)

    const [message, setMessage] = useState('')
    const isValidMessage = message.trim().length > 0

    // Scroll to bottom of the chat messages without affecting document.body.
    // scrollIntoView() bubbles through all scrollable parents (including body),
    // so we scroll the container element directly instead.
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const el = messagesContainerRef.current
        if (el) el.scrollTop = el.scrollHeight
    }, [messages])

    const handleSubmitMessage = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!isValidMessage) return
        sendMessage(message, pendingHighlightRef ?? undefined)
        setMessage('')
        clearPendingRef()
    }

    if (isUserLoading) {
        return 'Loading...'
    }

    if (!user) {
        return <AuthJoinChatForm />
    }

    return (
        <div className="flex flex-col w-full gap-4">
            <ChatMetadata />

            <Chat className="flex-1 w-full h-full">
                <ChatMessages ref={messagesContainerRef}>
                    {messages.length > 0 ? (
                        messages.map(
                            ({
                                id,
                                user: sender,
                                text,
                                timestamp,
                                highlightRef,
                            }) => (
                                <ChatEvent key={id}>
                                    <ChatEventAddon>
                                        <ChatEventAvatar
                                            fallback={sender.name[0]}
                                        />
                                    </ChatEventAddon>
                                    <ChatEventBody>
                                        <div className="flex gap-2 items-center w-full">
                                            <ChatEventTitle>
                                                <span
                                                    className={cn(
                                                        'font-semibold',
                                                        sender.id ===
                                                            user?.id &&
                                                            'text-muted-foreground'
                                                    )}
                                                >
                                                    {sender.id === user?.id
                                                        ? 'You'
                                                        : sender.name}
                                                </span>
                                            </ChatEventTitle>
                                            <ChatEventTime
                                                timestamp={timestamp}
                                            />
                                        </div>
                                        <ChatEventContent>
                                            {text}
                                        </ChatEventContent>
                                        {highlightRef && (
                                            <button
                                                onClick={() =>
                                                    handleFocusHighlight(
                                                        highlightRef.id
                                                    )
                                                }
                                                className="mt-1 inline-flex items-start gap-2.5 py-2 pl-3 pr-4 rounded-md bg-blue-600/10 hover:bg-blue-600/15 active:bg-blue-600/20 text-xs text-blue-600 transition-none text-left cursor-pointer"
                                            >
                                                <LinkIcon className="size-4 shrink-0 mt-0.5" />
                                                "{highlightRef.text}"
                                            </button>
                                        )}
                                    </ChatEventBody>
                                </ChatEvent>
                            )
                        )
                    ) : (
                        <p className="text-muted-foreground text-center">
                            No messages yet.
                            <br /> Be the first to start the conversation!
                        </p>
                    )}
                </ChatMessages>
                <ChatToolbar>
                    {/* We wrap the textarea into form so that we can submit the form
                    by clicking on the send button without repeating ourselves. */}
                    <form
                        className="w-full flex flex-row-reverse items-center justify-between"
                        onSubmit={handleSubmitMessage}
                    >
                        {pendingHighlightRef && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-950 border border-blue-700 rounded-md text-sm text-blue-300">
                                <span className="truncate max-w-[200px]">
                                    "{pendingHighlightRef.text}"
                                </span>
                                <button
                                    onClick={dismissPendingRef}
                                    className="ml-auto text-blue-400 hover:text-white"
                                >
                                    <XIcon />
                                </button>
                            </div>
                        )}

                        <ChatToolbarTextarea
                            autoFocus
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            // Textarea inserts new line on Enter by default, but we want to submit the form instead.
                            // To insert a new line, the user needs to press Shift+Enter (very common in chat apps).
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.currentTarget.form?.requestSubmit()
                                }
                            }}
                        />

                        <ChatToolbarAddon>
                            <ChatToolbarButton
                                type="submit"
                                disabled={!isValidMessage}
                            >
                                <SendIcon />
                            </ChatToolbarButton>
                        </ChatToolbarAddon>
                    </form>
                </ChatToolbar>
            </Chat>
        </div>
    )
}

export function ChatWindow(chatWindowProps: ChatWindowProps) {
    return (
        <div className="border rounded-md overflow-hidden flex p-4 w-full h-[700px] relative">
            <ChatInner {...chatWindowProps} />
        </div>
    )
}
