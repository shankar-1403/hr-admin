/** RTDB stores arrays as objects keyed by index — coerce to a list. */
function coerceRolesList(roles) {
  if (!roles) return [];
  if (Array.isArray(roles)) return roles;
  if (typeof roles === 'object') {
    return Object.keys(roles)
      .sort((a, b) => {
        const na = Number(a);
        const nb = Number(b);
        if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
        return String(a).localeCompare(String(b));
      })
      .map((key) => roles[key])
      .filter((entry) => entry && typeof entry === 'object');
  }
  return [];
}

function normalizeRoleEntry(entry) {
  return {
    jobTitle: (entry?.jobTitle || entry?.title || '').trim(),
    companyName: (entry?.companyName || entry?.company || '').trim(),
  };
}

/**
 * @returns {{ jobTitle: string, companyName: string }[]}
 */
export function normalizeManagementRoles(record) {
  if (!record) return [];
  const fromRoles = coerceRolesList(record.roles)
    .map(normalizeRoleEntry)
    .filter((r) => r.jobTitle || r.companyName);
  if (fromRoles.length) return fromRoles;
  const jobTitle = (record.jobTitle || record.subtitle || '').trim();
  const companyName = (record.companyName || '').trim();
  if (jobTitle || companyName) return [{ jobTitle, companyName }];
  return [];
}

/**
 * Normalize RTDB management item (supports legacy title / subtitle / details).
 */
export function resolveManagementDisplay(record) {
  if (!record) return null;
  const roles = normalizeManagementRoles(record);
  const primary = roles[0] || { jobTitle: '', companyName: '' };
  return {
    fullName: (record.fullName || record.title || '').trim() || 'Contact',
    roles,
    jobTitle: primary.jobTitle,
    companyName: primary.companyName,
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

  const roles = d.roles?.length ? d.roles : [{ jobTitle: d.jobTitle, companyName: d.companyName }];
  const roleLines = roles
    .filter((r) => r.jobTitle || r.companyName)
    .map((r) => {
      const parts = [r.jobTitle, r.companyName].filter(Boolean);
      return parts.join(' — ');
    });
  if (roleLines.length > 1) {
    noteParts.unshift(`Roles:\n${roleLines.join('\n')}`);
  }

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
