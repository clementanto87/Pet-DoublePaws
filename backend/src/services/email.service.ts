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
const appUrl = (process.env.EMAIL_APP_URL || 'https://doublepaws24.com').replace(/\/$/, '');

// Use a publicly accessible HTTPS URL so email clients can load the brand image.
const logoUrl = process.env.EMAIL_LOGO_URL || `${appUrl}/logo.jpg`;

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

const formatPrice = (value: number | string): string => {
    const amount = Number(value);
    return Number.isFinite(amount)
        ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' }).format(amount)
        : `EUR ${value}`;
};

const bookingSummary = (booking: BookingEmailData): string => `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;border:1px solid #e5e7eb;border-radius:8px;background:#fafafa;font-size:14px">
      <tr><td colspan="2" style="padding:16px 20px;border-bottom:1px solid #e5e7eb;font-weight:700;color:#172033">Booking details</td></tr>
      <tr><td style="padding:16px 20px 8px;color:#667085">Reference</td><td align="right" style="padding:16px 20px 8px;font-weight:700">${escapeHtml(bookingReference(booking.id))}</td></tr>
      <tr><td style="padding:8px 20px;color:#667085">Service</td><td align="right" style="padding:8px 20px">${escapeHtml(serviceLabel(booking.serviceType))}</td></tr>
      <tr><td style="padding:8px 20px;color:#667085">Dates</td><td align="right" style="padding:8px 20px">${escapeHtml(formatDate(booking.startDate))} &ndash; ${escapeHtml(formatDate(booking.endDate))}</td></tr>
      <tr><td style="padding:12px 20px 16px;font-weight:700">Booking total</td><td align="right" style="padding:12px 20px 16px;font-weight:700">${escapeHtml(formatPrice(booking.totalPrice))}</td></tr>
    </table>
`;

const layout = (title: string, content: string, action?: { label: string; href: string }): string => `
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} | Double Paws</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;color:#344054;font-family:Arial,Helvetica,sans-serif;line-height:1.6;-webkit-text-size-adjust:100%">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${escapeHtml(title)}. View your latest Double Paws account update.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f5f7">
    <tr><td align="center" style="padding:32px 12px">
      <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e4e7ec;border-top:4px solid #ff7417;border-radius:12px">
        <tr><td style="padding:24px;border-bottom:1px solid #eef0f3">
          <table role="presentation" cellspacing="0" cellpadding="0"><tr>
            <td width="64" valign="middle"><a href="${escapeHtml(appUrl)}" style="text-decoration:none"><img src="${escapeHtml(logoUrl)}" width="56" height="84" alt="Double Paws logo" style="display:block;border:0;border-radius:6px" /></a></td>
            <td valign="middle" style="padding-left:12px"><p style="margin:0;color:#172033;font-size:22px;font-weight:700">Double Paws</p><p style="margin:2px 0 0;color:#667085;font-size:13px">Care for your pets. Peace of mind for you.</p></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:28px 24px;font-size:16px;overflow-wrap:anywhere">
          <h1 style="margin:0 0 20px;font-size:24px;line-height:1.3;color:#172033;font-weight:700">${escapeHtml(title)}</h1>
          ${content}
          ${action ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0"><tr><td align="center" bgcolor="#b54708" style="border-radius:6px;mso-padding-alt:12px 24px"><a href="${escapeHtml(action.href)}" style="display:inline-block;border:1px solid #b54708;border-radius:6px;padding:12px 24px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none">${escapeHtml(action.label)}</a></td></tr></table><p style="margin:0 0 24px;color:#667085;font-size:12px;word-break:break-all">If the button does not work, open this link:<br /><a href="${escapeHtml(action.href)}" style="color:#b54708;text-decoration:underline">${escapeHtml(action.href)}</a></p>` : ''}
          <p style="margin:24px 0 0">Kind regards,<br /><strong style="color:#172033">The Double Paws team</strong></p>
        </td></tr>
        <tr><td style="padding:20px 24px;border-top:1px solid #eef0f3;background:#fafafa;color:#667085;font-size:12px">
          <p style="margin:0">This service email relates to activity on your Double Paws account.</p>
          <p style="margin:8px 0 0">Need help? ${replyTo ? `<a href="mailto:${escapeHtml(replyTo)}" style="color:#b54708">Contact our support team</a>.` : `<a href="${escapeHtml(appUrl)}/dashboard" style="color:#b54708">Visit your dashboard</a> to contact support.`}</p>
        </td></tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
  </table>
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
            '<p>Thank you for joining Double Paws. Your account is ready, and you can now create pet profiles, find trusted sitters, and manage bookings in one place.</p>',
            { label: 'Explore your dashboard', href: `${appUrl}/dashboard` },
        ),
    ),

    sendBookingCreated: (owner: EmailUser, sitter: EmailUser, booking: BookingEmailData): Promise<void> => Promise.all([
        send(
            owner.email,
            'Booking request sent',
            layout(
                'Your booking request was sent',
                `<p>Hi ${escapeHtml(displayName(owner))}, your request has been sent to ${escapeHtml(displayName(sitter))}.</p>${bookingSummary(booking)}<p>Your request is awaiting confirmation. We will notify you by email as soon as your sitter responds.</p>`,
                { label: 'View booking', href: `${appUrl}/dashboard` },
            ),
        ),
        send(
            sitter.email,
            'New booking request',
            layout(
                'You have a new booking request',
                `<p>Hi ${escapeHtml(displayName(sitter))}, ${escapeHtml(displayName(owner))} would like to book your service.</p>${bookingSummary(booking)}<p>Open your sitter dashboard to review the details and accept or decline the request.</p>`,
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
            `<p>Hi ${escapeHtml(displayName(recipient))}, ${escapeHtml(displayName(sender))} sent you a message:</p><div style="background:#f3f4f6;border-left:3px solid #ff7417;border-radius:6px;padding:16px;white-space:pre-wrap;overflow-wrap:anywhere">${escapeHtml(preview.slice(0, 500))}</div>`,
            { label: 'Open messages', href: `${appUrl}/messages` },
        ),
    ),

    sendSupportUpdate: (recipient: EmailUser, request: SupportEmailData): Promise<void> => send(
        recipient.email,
        request.adminResponse ? 'An update from Double Paws support' : 'Support request received',
        layout(
            request.adminResponse ? 'Your support request has an update' : 'Your support request was received',
            `<p>Hi ${escapeHtml(displayName(recipient))},</p><p><strong>${escapeHtml(request.subject)}</strong></p><p>${escapeHtml(request.adminResponse || 'Our support team will review your request and get back to you.')}</p><p>Status: <strong>${escapeHtml(request.status)}</strong></p>`,
            { label: 'Open support', href: `${appUrl}/dashboard` },
        ),
    ),
};
