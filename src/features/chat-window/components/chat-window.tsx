import { useAuthContext } from '@/features/auth/providers/auth-provider'
import { useReferencesContext } from '@/features/references/providers/references-provider'
import { cn } from '@/lib/utils'
import { LinkIcon, SendIcon, XIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ChatProvider, useChatContext } from '../providers/chat-provider'
import { AuthJoinChatForm } from './auth-join-chat-form'
import { ChatMetadata } from './chat-metadata'
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

export function ChatWindow() {
    return (
        <div className="border rounded-md overflow-hidden flex p-4 w-full h-[700px] relative">
            <ChatProvider>
                <ChatWindowInner />
            </ChatProvider>
        </div>
    )
}

function ChatWindowInner() {
    const { user, loading: isUserLoading } = useAuthContext()

    const {
        pendingHighlightRef,
        handleFocusHighlight,
        clearPendingRef,
        dismissPendingRef,
    } = useReferencesContext()

    const { messages, sendMessage } = useChatContext()

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
                        className="w-full flex flex-col items-start"
                        onSubmit={handleSubmitMessage}
                    >
                        <div className="flex items-center w-full">
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
                        </div>

                        {pendingHighlightRef && (
                            <div className="flex items-center gap-2 pl-3 pr-9 py-1.5 mt-2 bg-gray-100 border rounded-md text-sm relative overflow-hidden">
                                <span className="truncate max-w-[200px]">
                                    "{pendingHighlightRef.text}"
                                </span>
                                <button
                                    type="button"
                                    onClick={dismissPendingRef}
                                    className="ml-auto w-7 cursor-pointer text-foreground absolute top-0 right-0 bottom-0 hover:bg-foreground/10 flex items-center justify-center"
                                    aria-label="Dismiss highlight"
                                >
                                    <XIcon className="size-5" />
                                </button>
                            </div>
                        )}
                    </form>
                </ChatToolbar>
            </Chat>
        </div>
    )
}
