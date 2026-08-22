import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { ChatInterface } from './ChatInterface';

interface ChatPageLayoutProps {
    title: string;
    subtitle: string;
    backLabel: string;
    onBack: () => void;
    defaultUserId?: string | null;
}

/**
 * Shared layout for the customer and sitter messaging pages.
 *
 * On mobile the chat previously lived in normal page flow with a guessed
 * `calc(100vh-180px)` height. That's not viewport-locked, so opening the
 * keyboard (or any residual scroll) let the page scroll and exposed empty
 * space plus the site Footer underneath the chat — not a proper full-screen
 * chat UI.
 *
 * Below md this renders as a `position: fixed` panel pinned below a slim
 * back/title bar, sized to the *visual*
 * viewport (which shrinks correctly when the keyboard opens) so the input
 * is always reachable and the page behind it can never be scrolled into
 * view. Desktop is unchanged: normal page flow with its own header.
 */
export const ChatPageLayout: React.FC<ChatPageLayoutProps> = ({ title, subtitle, backLabel, onBack, defaultUserId }) => {
    const [isDesktop, setIsDesktop] = useState(() =>
        typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : true
    );
    const [mobileBox, setMobileBox] = useState<{ top: number; height: number } | null>(null);
    const subHeaderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 768px)');
        const onChange = () => setIsDesktop(mq.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        if (isDesktop) { setMobileBox(null); return; }

        const update = () => {
            const subHeaderHeight = subHeaderRef.current ? subHeaderRef.current.getBoundingClientRect().height : 52;
            const vv = window.visualViewport;
            const viewportHeight = vv ? vv.height : window.innerHeight;
            const top = subHeaderHeight;
            setMobileBox({ top, height: Math.max(viewportHeight - top, 240) });
        };

        update();
        window.addEventListener('resize', update);
        window.visualViewport?.addEventListener('resize', update);
        window.visualViewport?.addEventListener('scroll', update);
        return () => {
            window.removeEventListener('resize', update);
            window.visualViewport?.removeEventListener('resize', update);
            window.visualViewport?.removeEventListener('scroll', update);
        };
    }, [isDesktop]);

    // Keep the page itself unscrollable while the fixed mobile chat is mounted.
    // The messaging routes render without the site Navbar/Footer (see AppShell),
    // so the document is already only as tall as the viewport — a simple
    // overflow lock is enough here. Note: pinning <body> with position:fixed was
    // tried and made things worse on iOS (it fought Safari's own keyboard
    // focus-scrolling and left the page offset), so keep this minimal.
    useEffect(() => {
        if (isDesktop) return;
        const body = document.body.style;
        const prevOverflow = body.overflow;
        body.overflow = 'hidden';
        return () => { body.overflow = prevOverflow; };
    }, [isDesktop]);

    if (isDesktop) {
        return (
            <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-900">
                <div className="mx-auto flex min-h-[100dvh] max-w-7xl flex-col px-4 py-4 md:px-6 md:py-6 lg:px-8">
                    <div className="mb-4 shrink-0 md:mb-6">
                        <Button variant="ghost" onClick={onBack} className="mb-3 px-2 text-sm md:mb-4 md:text-base">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {backLabel}
                        </Button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
                            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
                        </div>
                    </div>
                    <div className="min-h-0 flex-1">
                        <ChatInterface defaultSelectedUserId={defaultUserId} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Slim fixed sub-header — pinned below the main navbar, never part of the
                page's scrollable flow, so a back-to-dashboard action is always reachable. */}
            <div
                ref={subHeaderRef}
                className="md:hidden fixed inset-x-0 top-0 z-30 flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
            >
                <button
                    onClick={onBack}
                    className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                    aria-label={backLabel}
                >
                    <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <h1 className="text-base font-bold text-gray-900 dark:text-white truncate">{title}</h1>
            </div>

            {/* Fixed, viewport-locked chat panel (keyboard-safe height via visualViewport) */}
            <div
                className="md:hidden fixed inset-x-0 z-20 bg-gray-50 dark:bg-gray-900"
                style={mobileBox ? { top: mobileBox.top, height: mobileBox.height } : { top: 0, bottom: 0 }}
            >
                <ChatInterface defaultSelectedUserId={defaultUserId} />
            </div>
        </>
    );
};
