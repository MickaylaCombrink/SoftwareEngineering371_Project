const nodemailer = require('nodemailer');

// Team inboxes notified whenever the contact page receives a message.
// Override any time via QUERY_NOTIFY_LIST (comma-separated).
const FALLBACK_RECIPIENTS = [
  '577480@student.belgiumcampus.ac.za',
  '603087@student.belgiumcampus.ac.za',
  '602923@student.belgiumcampus.ac.za',
  '602059@student.belgiumcampus.ac.za',
];

function recipientsFromEnv(env = process.env) {
  const configured = (env.QUERY_NOTIFY_LIST || '')
    .split(',')
    .map((address) => address.trim())
    .filter(Boolean);

  return configured.length ? configured : FALLBACK_RECIPIENTS;
}

// Null when SMTP is not configured: notifications are an add-on, the API
// must still work (and the query is already saved) without email.
function createTransporter(env = process.env) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = env;

  if (!SMTP_HOST) return null;

  const port = Number(SMTP_PORT) || 587;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
}

function buildMailBody(query, env = process.env) {
  const recipients = recipientsFromEnv(env).join(', ');
  const subject = `New boutique enquiry from ${query.name}`;

  const text = [
    'A visitor left a message on the Scentigue contact page.',
    '',
    `Name:    ${query.name}`,
    `Email:   ${query.email}`,
    `Subject: ${query.subject}`,
    '',
    'Message:',
    query.message,
    '',
    `Sent:    ${new Date(query.createdAt).toLocaleString()}`,
  ].join('\n');

  const rows = [
    ['Name', query.name],
    ['Email', query.email],
    ['Subject', query.subject],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:0.4rem 1rem 0.4rem 0;color:#7d6e52;white-space:nowrap;vertical-align:top;">${label}</td><td style="padding:0.4rem 0;color:#d9bc7e;">${value}</td></tr>`
    )
    .join('');

  const html = `
    <div style="background:#2a2623;color:#d9bc7e;font-family:Georgia,serif;padding:2rem;">
      <h2 style="margin:0 0 1rem;font-weight:400;">A message from the boutique</h2>
      <table style="border-top:1px solid #453e37;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">${rows}</table>
      <p style="border-top:1px solid #453e37;padding:1rem 0 0;white-space:pre-wrap;margin:1rem 0 0;">${query.message}</p>
      <p style="color:#a79263;font-size:12px;margin-top:1.5rem;">Sent via the Scentigue contact page · ${new Date(query.createdAt).toLocaleString()}</p>
    </div>`;

  return {
    from: env.EMAIL_FROM || 'Scentigue Concierge <no-reply@scentigue.local>',
    to: recipients,
    subject,
    text,
    html,
  };
}

// Best-effort fire-and-forget: never throws. The response to the visitor and
// the saved query are the source of truth; a failed email is only logged.
async function sendQueryNotification(query, options = {}) {
  const transporter = options.transporter ?? createTransporter(options.env ?? process.env);

  try {
    if (!transporter) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn('Query notification email skipped: SMTP_HOST is not set.');
      }
      return { sent: false, reason: 'smtp-not-configured' };
    }

    const mail = buildMailBody(query, options.env ?? process.env);
    const info = await transporter.sendMail(mail);

    return { sent: true, info };
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Query notification email failed:', err.message);
    }
    return { sent: false, reason: err.message };
  }
}

module.exports = {
  sendQueryNotification,
  recipientsFromEnv,
  createTransporter,
  buildMailBody,
  FALLBACK_RECIPIENTS,
};