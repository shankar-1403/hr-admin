/**
 * Normalize RTDB management item (supports legacy title / subtitle / details).
 */
export function resolveManagementDisplay(record) {
  if (!record) return null;
  return {
    fullName: (record.fullName || record.title || '').trim() || 'Contact',
    jobTitle: (record.jobTitle || record.subtitle || '').trim(),
    companyName: (record.companyName || '').trim(),
    bio: (record.bio || record.details || '').trim(),
    profileImageUrl: (record.profileImageUrl || '').trim(),
    mobilePhone: (record.mobilePhone || '').trim(),
    email: (record.email || '').trim(),
    whatsapp: (record.whatsapp || '').trim(),
    twitterUrl: normalizeHttpUrl(record.twitterUrl),
    linkedinUrl: normalizeHttpUrl(record.linkedinUrl),
    facebookUrl: normalizeHttpUrl(record.facebookUrl),
    instagramUrl: normalizeHttpUrl(record.instagramUrl),
    workAddress: (record.workAddress || '').trim(),
    websiteUrl: normalizeHttpUrl(record.websiteUrl),
    education: (record.education || '').trim(),
    experience: (record.experience || '').trim(),
  };
}

function normalizeHttpUrl(url) {
  const u = (url || '').trim();
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u}`;
}

export function digitsOnly(s) {
  return String(s || '').replace(/\D/g, '');
}

export function buildVCard(d) {
  const noteParts = [];
  if (d.bio) noteParts.push(d.bio);
  if (d.workAddress) noteParts.push(`Work address:\n${d.workAddress}`);
  if (d.education) noteParts.push(`Education:\n${d.education}`);
  if (d.experience) noteParts.push(`Experience:\n${d.experience}`);

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCard(d.fullName)}`,
    d.companyName ? `ORG:${escapeVCard(d.companyName)}` : '',
    d.jobTitle ? `TITLE:${escapeVCard(d.jobTitle)}` : '',
    d.mobilePhone ? `TEL;TYPE=CELL:${escapeVCard(d.mobilePhone)}` : '',
    d.email ? `EMAIL;TYPE=INTERNET:${escapeVCard(d.email)}` : '',
    d.websiteUrl ? `URL:${escapeVCard(d.websiteUrl)}` : '',
    noteParts.length ? `NOTE:${escapeVCard(noteParts.join('\n\n'))}` : '',
    'END:VCARD',
  ].filter(Boolean);
  return lines.join('\r\n');
}

function escapeVCard(s) {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}
