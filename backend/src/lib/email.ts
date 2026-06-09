// G-4: Email sending via Resend. Falls back to console log when RESEND_API_KEY is not set.

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function send(opts: EmailOptions): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[email] No RESEND_API_KEY — would send to ${opts.to}: ${opts.subject}`);
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'noreply@tollfreeforwarding.app',
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[email] Resend error ${res.status}: ${body}`);
  }
}

// Named exports for direct import convenience
export const sendWelcome = (to: string, firstName: string) => emailService.sendWelcome(to, firstName);
export const sendPasswordReset = (to: string, _name: string, resetLink: string) => emailService.sendPasswordReset(to, resetLink);
export const sendMissedCallAlert = (to: string, _name: string, callerNumber: string, virtualNumber: string) => emailService.sendMissedCallAlert(to, callerNumber, virtualNumber);
export const sendVoicemailAlert = (to: string, _name: string, callerNumber: string, recordingUrl: string) => emailService.sendVoicemailAlert(to, callerNumber, '', recordingUrl);
export const sendLowMinutesWarning = (to: string, _name: string, minutesUsed: number, minuteLimit: number, plan: string) => emailService.sendLowMinutesWarning(to, minuteLimit - minutesUsed, plan);

export const emailService = {
  async sendPasswordReset(to: string, resetLink: string) {
    await send({
      to,
      subject: 'Reset your TollFreeForwarding password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#6366f1">Password Reset</h2>
          <p>Click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetLink}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">Reset Password</a>
          <p style="color:#666;font-size:13px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
        </div>`,
    });
  },

  async sendWelcome(to: string, firstName: string) {
    await send({
      to,
      subject: 'Welcome to TollFreeForwarding',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#6366f1">Welcome, ${firstName}!</h2>
          <p>Your account is ready. Start by provisioning your first virtual number and configuring call routing.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">Go to Dashboard</a>
        </div>`,
    });
  },

  async sendMissedCallAlert(to: string, callerNumber: string, virtualNumber: string) {
    await send({
      to,
      subject: `Missed call from ${callerNumber}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#f59e0b">Missed Call</h2>
          <p>You missed a call from <strong>${callerNumber}</strong> to your number <strong>${virtualNumber}</strong>.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/logs" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">View Call Logs</a>
        </div>`,
    });
  },

  async sendVoicemailAlert(to: string, callerNumber: string, virtualNumber: string, recordingUrl?: string) {
    await send({
      to,
      subject: `New voicemail from ${callerNumber}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#6366f1">New Voicemail</h2>
          <p>You have a new voicemail from <strong>${callerNumber}</strong> on <strong>${virtualNumber}</strong>.</p>
          ${recordingUrl ? `<a href="${recordingUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">Listen to Voicemail</a>` : ''}
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/logs" style="display:inline-block;background:#f3f4f6;color:#111;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin-left:8px">View in Dashboard</a>
        </div>`,
    });
  },

  async sendLowMinutesWarning(to: string, minutesLeft: number, plan: string) {
    await send({
      to,
      subject: `Low minutes warning — ${minutesLeft} minutes remaining`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#ef4444">Low Minutes Warning</h2>
          <p>Your <strong>${plan}</strong> plan has only <strong>${minutesLeft} minutes</strong> remaining this billing period.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings/billing" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">Upgrade Plan</a>
        </div>`,
    });
  },
};
