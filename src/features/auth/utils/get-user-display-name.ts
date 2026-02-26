import type { User } from '@supabase/supabase-js'

export function getUserDisplayName(user: User) {
    return typeof user.user_metadata?.display_name === 'string'
        ? user.user_metadata.display_name
        : 'Guest'
}
