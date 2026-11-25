// Hidden "website" spam trap shared by the public forms.
//
// Browser autofill (Chrome especially) ignores autocomplete="off" and will put a
// name, email or address into the hidden box, which made real people look like
// robots: offers failed with "Please try again." and waitlist signups were
// silently dropped. Robots that fill a "website" box almost always put a link in
// it, so only treat it as spam when it looks like a URL or a domain.
export function isSpamTrap(value: unknown): boolean {
  if (typeof value !== 'string') return false
  const v = value.trim().toLowerCase()
  if (!v) return false
  if (v.includes('@')) return false // autofilled email
  return /https?:\/\/|www\.|\.(com|net|org|info|biz|ru|cn|xyz|top|io|co)(\/|$)/.test(v)
}
