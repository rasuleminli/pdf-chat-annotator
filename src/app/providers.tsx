import { AuthProvider } from '@/features/auth/providers/auth-provider'
import { PdfViewerProvider } from '@/features/pdf-viewer/providers/pdf-viewer-provider'
import { RealtimeCursorsProvider } from '@/features/realtime-cursors/providers/realtime-cursors-provider'
import { ReferencesProvider } from '@/features/references/providers/references-provider'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <PdfViewerProvider>
                <RealtimeCursorsProvider>
                    <ReferencesProvider>{children}</ReferencesProvider>
                </RealtimeCursorsProvider>
            </PdfViewerProvider>
        </AuthProvider>
    )
}
