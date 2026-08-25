import { Resend } from 'resend';
import { bookingReference } from '../utils/bookingReference';

export interface EmailUser {
    firstName?: string;
    lastName?: string;
    email: string;
}

export interface BookingEmailData {
    id: string;
    serviceType: string;
    startDate: Date | string;
    endDate: Date | string;
    totalPrice: number | string;
}

export interface SupportEmailData {
    id: string;
    type: string;
    subject: string;
    description: string;
    status: string;
    adminResponse?: string;
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.EMAIL_FROM || 'Double Paws <notifications@example.com>';
const replyTo = process.env.EMAIL_REPLY_TO || undefined;
const appUrl = (process.env.EMAIL_APP_URL || 'http://localhost:5173').replace(/\/$/, '');

const escapeHtml = (value: unknown): string => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const displayName = (user: EmailUser): string =>
    `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'there';

const serviceLabel = (serviceType: string): string =>
    serviceType.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase()).trim();

const formatDate = (value: Date | string): string => new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeZone: 'Europe/Berlin',
}).format(new Date(value));

const bookingSummary = (booking: BookingEmailData): string => `
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;margin:20px 0">
        <strong>Reference: ${escapeHtml(bookingReference(booking.id))}</strong><br />
        <strong>${escapeHtml(serviceLabel(booking.serviceType))}</strong><br />
        ${escapeHtml(formatDate(booking.startDate))} - ${escapeHtml(formatDate(booking.endDate))}<br />
        Total: <strong>EUR ${escapeHtml(booking.totalPrice)}</strong>
    </div>
`;

const layout = (title: string, content: string, action?: { label: string; href: string }): string => `
<!doctype html>
<html lang="en">
<body style="margin:0;background:#f7f8fa;color:#172033;font-family:Arial,sans-serif;line-height:1.6">
  <div style="max-width:600px;margin:32px auto;padding:0 16px">
    <div style="background:#ff7417;color:#fff;border-radius:16px 16px 0 0;padding:22px 28px;font-size:22px;font-weight:700">Double Paws</div>
    <main style="background:#fff;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 16px 16px;padding:28px">
      <h1 style="margin:0 0 16px;font-size:24px;color:#111827">${escapeHtml(title)}</h1>
      ${content}
      ${action ? `<p style="margin:24px 0"><a href="${escapeHtml(action.href)}" style="display:inline-block;background:#ff7417;color:#fff;text-decoration:none;border-radius:10px;padding:12px 18px;font-weight:700">${escapeHtml(action.label)}</a></p>` : ''}
      <p style="margin:28px 0 0;color:#6b7280;font-size:12px">You are receiving this because of activity on your Double Paws account.</p>
    </main>
  </div>
</body>
</html>`;

const send = async (to: string, subject: string, html: string): Promise<void> => {
    if (!resend) {
        if (process.env.NODE_ENV !== 'production') {
            console.info(`[email] RESEND_API_KEY not configured; skipped "${subject}" to ${to}`);
        }
        return;
    }

    try {
        const result = await resend.emails.send({
            from,
            to: [to],
            subject,
            html,
            ...(replyTo ? { replyTo } : {}),
        });

        if (result.error) {
            console.error(`[email] Resend rejected "${subject}" for ${to}:`, result.error);
        }
    } catch (error) {
        // Email must never make a successful booking, message, or payment fail.
        console.error(`[email] Failed to send "${subject}" to ${to}:`, error);
    }
};

export const emailService = {
    isConfigured: (): boolean => Boolean(resend),

    sendWelcome: (user: EmailUser): Promise<void> => send(
        user.email,
        'Welcome to Double Paws',
        layout(
            `Welcome, ${displayName(user)}!`,
            '<p>Your Double Paws account is ready. You can now create pet profiles, find trusted sitters, and manage bookings in one place.</p>',
            { label: 'Open Double Paws', href: `${appUrl}/dashboard` },
        ),
    ),

    sendBookingCreated: (owner: EmailUser, sitter: EmailUser, booking: BookingEmailData): Promise<void> => Promise.all([
        send(
            owner.email,
            'Booking request sent',
            layout(
                'Your booking request was sent',
                `<p>Hi ${escapeHtml(displayName(owner))}, your request has been sent to ${escapeHtml(displayName(sitter))}.</p>${bookingSummary(booking)}<p>We will email you when the sitter responds.</p>`,
                { label: 'View booking', href: `${appUrl}/dashboard` },
            ),
        ),
        send(
            sitter.email,
            'New booking request',
            layout(
                'You have a new booking request',
                `<p>Hi ${escapeHtml(displayName(sitter))}, ${escapeHtml(displayName(owner))} would like to book your service.</p>${bookingSummary(booking)}<p>Open your sitter dashboard to accept or reject the request.</p>`,
                { label: 'Review request', href: `${appUrl}/sitter-dashboard` },
            ),
        ),
    ]).then(() => undefined),

    sendBookingStatus: (recipient: EmailUser, booking: BookingEmailData, status: 'accepted' | 'rejected' | 'cancelled' | 'completed'): Promise<void> => {
        const copy = {
            accepted: ['Booking accepted', 'Your sitter accepted the booking request.'],
            rejected: ['Booking request declined', 'The booking request was declined. You can return to Double Paws to find another sitter.'],
            cancelled: ['Booking cancelled', 'This booking has been cancelled.'],
            completed: ['Service completed', 'The sitter marked this service as completed. Payment is now available in your dashboard.'],
        }[status];

        return send(
            recipient.email,
            copy[0],
            layout(`${copy[0]}`, `<p>Hi ${escapeHtml(displayName(recipient))}, ${copy[1]}</p>${bookingSummary(booking)}`, { label: 'Open dashboard', href: `${appUrl}/dashboard` }),
        );
    },

    sendPaymentStatus: (recipient: EmailUser, booking: BookingEmailData, status: 'succeeded' | 'failed' | 'refunded'): Promise<void> => {
        const copy = {
            succeeded: ['Payment confirmed', 'Your payment was completed successfully.'],
            failed: ['Payment needs attention', 'Your payment could not be completed. Please try again from your dashboard.'],
            refunded: ['Payment refunded', 'Your payment has been refunded.'],
        }[status];

        return send(
            recipient.email,
            copy[0],
            layout(copy[0], `<p>Hi ${escapeHtml(displayName(recipient))}, ${copy[1]}</p>${bookingSummary(booking)}`, { label: 'View payment', href: `${appUrl}/dashboard` }),
        );
    },

    sendNewMessage: (recipient: EmailUser, sender: EmailUser, preview: string): Promise<void> => send(
        recipient.email,
        `New message from ${displayName(sender)}`,
        layout(
            'You have a new message',
            `<p>Hi ${escapeHtml(displayName(recipient))}, ${escapeHtml(displayName(sender))} sent you a message:</p><div style="background:#f3f4f6;border-radius:10px;padding:14px">${escapeHtml(preview).slice(0, 500)}</div>`,
            { label: 'Open messages', href: `${appUrl}/messages` },
        ),
    ),

    sendSupportUpdate: (recipient: EmailUser, request: SupportEmailData): Promise<void> => send(
        recipient.email,
        request.adminResponse ? 'Support has responded to your request' : 'Support request received',
        layout(
            request.adminResponse ? 'Support responded to your request' : 'Your support request was received',
            `<p>Hi ${escapeHtml(displayName(recipient))},</p><p><strong>${escapeHtml(request.subject)}</strong></p><p>${escapeHtml(request.adminResponse || 'Our support team will review your request and get back to you.')}</p><p>Status: <strong>${escapeHtml(request.status)}</strong></p>`,
            { label: 'Open support', href: `${appUrl}/dashboard` },
        ),
    ),
};
