import { useAuth } from '@/features/auth/hooks/use-auth'
import { getUserDisplayName } from '@/features/auth/utils/get-user-display-name'
import { SendIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Chat } from '../chat/chat'
import {
    ChatEvent,
    ChatEventAddon,
    ChatEventAvatar,
    ChatEventBody,
    ChatEventContent,
    ChatEventTime,
    ChatEventTitle,
} from '../chat/chat-event'
import { ChatMessages } from '../chat/chat-messages'
import {
    ChatToolbar,
    ChatToolbarAddon,
    ChatToolbarButton,
    ChatToolbarTextarea,
} from '../chat/chat-toolbar'
import { AuthJoinChatForm } from './components/auth-join-chat-form'
import { useLiveChat } from './hooks/use-live-chat'
import { ChatMetadata } from './components/chat-metadata'

function ChatInner() {
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
        sendMessage(message)
        setMessage('')
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
                        messages.map(({ id, name, text, timestamp }) => (
                            <ChatEvent key={id}>
                                <ChatEventAddon>
                                    <ChatEventAvatar
                                        fallback={getUserDisplayName(user)[0]}
                                    />
                                </ChatEventAddon>
                                <ChatEventBody>
                                    <div className="flex gap-2 items-center w-full">
                                        <ChatEventTitle>
                                            <span className="font-semibold">
                                                {name}
                                            </span>
                                        </ChatEventTitle>
                                        <ChatEventTime timestamp={timestamp} />
                                    </div>
                                    <ChatEventContent>{text}</ChatEventContent>
                                </ChatEventBody>
                            </ChatEvent>
                        ))
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

export function ChatWindow() {
    return (
        <div className="border rounded-md overflow-hidden flex p-4 w-full h-[700px]">
            <ChatInner />
        </div>
    )
}
