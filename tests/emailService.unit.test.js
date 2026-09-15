const {
  sendQueryNotification,
  recipientsFromEnv,
  buildMailBody,
  FALLBACK_RECIPIENTS,
} = require('../src/services/emailService');

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

const nodemailer = require('nodemailer');

const query = {
  name: 'Jane Shopper',
  email: 'jane@example.com',
  subject: 'Order query',
  message: 'Where is my order?',
  createdAt: '2026-09-16T09:00:00.000Z',
};

describe('recipientsFromEnv', () => {
  test('defaults to the four team inboxes', () => {
    expect(recipientsFromEnv({})).toEqual(FALLBACK_RECIPIENTS);
    expect(FALLBACK_RECIPIENTS).toHaveLength(4);
  });

  test('QUERY_NOTIFY_LIST overrides the defaults and trims whitespace', () => {
    const recipients = recipientsFromEnv({
      QUERY_NOTIFY_LIST: ' a@example.com , b@example.com ',
    });
    expect(recipients).toEqual(['a@example.com', 'b@example.com']);
  });

  test('a blank override falls back to the team inboxes', () => {
    expect(recipientsFromEnv({ QUERY_NOTIFY_LIST: '  , ' })).toEqual(FALLBACK_RECIPIENTS);
  });
});

describe('buildMailBody', () => {
  test('addresses every team inbox', () => {
    const mail = buildMailBody(query, {});
    expect(mail.to).toBe(FALLBACK_RECIPIENTS.join(', '));
  });

  test('carries the query through the plain-text body', () => {
    const mail = buildMailBody(query, {});
    expect(mail.subject).toContain(query.name);
    expect(mail.text).toContain(query.email);
    expect(mail.text).toContain(query.subject);
    expect(mail.text).toContain(query.message);
  });
});

describe('sendQueryNotification', () => {
  test('skips quietly when SMTP is not configured', async () => {
    const result = await sendQueryNotification(query, { env: {} });
    expect(result.sent).toBe(false);
    expect(result.reason).toBe('smtp-not-configured');
    expect(nodemailer.createTransport).not.toHaveBeenCalled();
  });

  test('sends to the team inboxes and resolves the transport info', async () => {
    const sendMail = jest.fn().mockResolvedValue({ messageId: 'abc' });
    const transporter = { sendMail };

    const result = await sendQueryNotification(query, { transporter });

    expect(result.sent).toBe(true);
    expect(result.info.messageId).toBe('abc');
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail.mock.calls[0][0].to).toBe(FALLBACK_RECIPIENTS.join(', '));
  });

  test('a failed send resolves with a reason rather than throwing', async () => {
    const transporter = {
      sendMail: jest.fn().mockRejectedValue(new Error('connection refused')),
    };

    const result = await sendQueryNotification(query, { transporter });

    expect(result.sent).toBe(false);
    expect(result.reason).toBe('connection refused');
  });
});