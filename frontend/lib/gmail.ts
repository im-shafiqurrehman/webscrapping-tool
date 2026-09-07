interface GmailDraft {
  to: string;
  subject: string;
  body: string;
}

export function gmailComposeUrl({ to, subject, body }: GmailDraft) {
  const query = new URLSearchParams({ view: 'cm', fs: '1', to, su: subject, body });
  return `https://mail.google.com/mail/?${query.toString()}`;
}
