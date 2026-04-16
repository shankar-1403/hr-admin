import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from '../firebase';
import { ref, get } from 'firebase/database';
import { RTDB_MANAGEMENT_ITEMS } from '../constants/rtdbPaths';
import {
  resolveManagementDisplay,
  buildVCard,
  digitsOnly,
} from '../utils/managementRecord';
import './ManagementItemPublicView.css';

function IconPhone() {
  return (
    <svg className="mgmt-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
      />
    </svg>
  );
}

function IconEmail() {
  return (
    <svg className="mgmt-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
      />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg className="mgmt-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.984.982-3.648-.214-.375a9.86 9.86 0 01-1.514-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
      />
    </svg>
  );
}

function IconTwitter() {
  return (
    <svg className="mgmt-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg className="mgmt-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
      />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg className="mgmt-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.04c-5.52 0-10 4.48-10 10 0 5 3.66 9.13 8.44 9.88v-6.99H7.9v-2.88h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.88h-2.33v6.99c4.78-.75 8.44-4.88 8.44-9.88 0-5.52-4.5-10-10-10z"
      />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg className="mgmt-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.402 3.616 1.385.983.983 1.323 2.25 1.385 3.616.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.402 2.633-1.385 3.616-.983.983-2.25 1.323-3.616 1.385-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.402-3.616-1.385-.983-.983-1.323-2.25-1.385-3.616-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.402-2.633 1.385-3.616.983-.983 2.25-1.323 3.616-1.385 1.266-.058 1.646-.07 4.85-.07zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 11-2.881 0 1.44 1.44 0 012.881 0z"
      />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg className="mgmt-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
      />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg className="mgmt-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
      />
    </svg>
  );
}

function IconGradCap() {
  return (
    <svg className="mgmt-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"
      />
    </svg>
  );
}

function IconAward() {
  return (
    <svg className="mgmt-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.66 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.66 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"
      />
    </svg>
  );
}

function TileLink({ href, label, gradClass, children }) {
  return (
    <a
      href={href}
      className={`mgmt-tile mgmt-tile--${gradClass}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="mgmt-tile-icon">{children}</span>
      <span className="mgmt-tile-label">{label}</span>
    </a>
  );
}

function TileButton({ label, gradClass, children, onClick }) {
  return (
    <button type="button" className={`mgmt-tile mgmt-tile--${gradClass}`} onClick={onClick}>
      <span className="mgmt-tile-icon">{children}</span>
      <span className="mgmt-tile-label">{label}</span>
    </button>
  );
}

function sanitizeFilename(name) {
  return String(name)
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-') || 'contact';
}

export default function ManagementItemPublicView() {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareHint, setShareHint] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await get(ref(db, `${RTDB_MANAGEMENT_ITEMS}/${id}`));
        if (!snap.exists()) {
          if (!cancelled) setError('Record not found');
        } else if (!cancelled) {
          setRecord({ id, ...snap.val() });
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load record');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const d = useMemo(() => resolveManagementDisplay(record), [record]);

  const downloadVCard = useCallback(() => {
    if (!d) return;
    const blob = new Blob([buildVCard(d)], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizeFilename(d.fullName)}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [d]);

  const shareContact = useCallback(async () => {
    const url = window.location.href;
    setShareHint('');
    try {
      if (navigator.share) {
        await navigator.share({
          title: d?.fullName || 'Contact',
          text: d?.fullName ? `Contact: ${d.fullName}` : 'Shared contact card',
          url,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareHint('Link copied to clipboard.');
        window.setTimeout(() => setShareHint(''), 3500);
      } else {
        setShareHint(url);
      }
    } catch (e) {
      if (e?.name !== 'AbortError') {
        setShareHint('Could not share. Try copying the address from the browser bar.');
      }
    }
  }, [d]);

  if (loading) {
    return (
      <div className="mgmt-card-page mgmt-card-page--loading">
        <div className="mgmt-page-loading">Loading…</div>
      </div>
    );
  }

  if (error || !record || !d) {
    return (
      <div className="mgmt-card-page">
        <div className="mgmt-page-error">
          <p>{error || 'Record not found'}</p>
        </div>
      </div>
    );
  }

  const waDigits = digitsOnly(d.whatsapp || d.mobilePhone);
  const waHref = waDigits ? `https://wa.me/${waDigits}` : '';
  const hasContact = Boolean(d.mobilePhone || d.email || waHref);
  const hasSocial = Boolean(
    d.twitterUrl ||
      d.linkedinUrl ||
      d.facebookUrl ||
      d.instagramUrl ||
      d.websiteUrl
  );

  return (
    <div className="mgmt-card-page">
      <div className="mgmt-shell">
        <header className="mgmt-hero">
          <div className="mgmt-avatar-ring">
            {d.profileImageUrl ? (
              <img src={d.profileImageUrl} alt="" className="mgmt-avatar-img" />
            ) : (
              <div className="mgmt-avatar-ph" aria-hidden="true">
                {d.fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="mgmt-hero-panel">
            <h1 className="mgmt-hero-name">{d.fullName}</h1>
            {d.jobTitle && <p className="mgmt-hero-role">{d.jobTitle}</p>}
            {d.companyName && <p className="mgmt-hero-org">{d.companyName}</p>}
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-4">
          <div>
            <button type="button" className="mgmt-btn-primary" onClick={downloadVCard}>
              Download Contact
            </button>
          </div>
          <button type="button" className="mgmt-btn-ghost" onClick={shareContact}>
            Share your Contact
          </button>
        </div>
        {shareHint && <p className="mgmt-share-hint">{shareHint}</p>}

        {d.bio && (
          <section className="mgmt-bio-block">
            <h2 className="mgmt-bio-heading">Bio</h2>
            <div className="mgmt-bio-text">
              {d.bio.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>
        )}

        {(d.education || d.experience) && (
          <section className="mgmt-section">
            <h2 className="mgmt-section-title">Other information</h2>
            <div className="mgmt-info-cards">
              {d.education && (
                <div className="mgmt-info-card">
                  <div className="mgmt-info-card-head">
                    <span className="mgmt-tile-icon-wrap mgmt-tile--green">
                      <IconGradCap />
                    </span>
                    <span className="mgmt-info-card-title">Education</span>
                  </div>
                  <p className="mgmt-info-card-body">{d.education}</p>
                </div>
              )}
              {d.experience && (
                <div className="mgmt-info-card">
                  <div className="mgmt-info-card-head">
                    <span className="mgmt-tile-icon-wrap mgmt-tile--green">
                      <IconAward />
                    </span>
                    <span className="mgmt-info-card-title">Experience</span>
                  </div>
                  <p className="mgmt-info-card-body">{d.experience}</p>
                </div>
              )}
            </div>
          </section>
        )}

        <div className="flex flex-col gap-3">
          {hasContact && (
            <section className="mgmt-section">
              <h2 className="mgmt-section-title">Contact details</h2>
              <div className="mgmt-tile-row">
                {d.mobilePhone && (
                  <TileLink href={`tel:${digitsOnly(d.mobilePhone)}`} label="Mobile" gradClass="green">
                    <IconPhone />
                  </TileLink>
                )}
                {d.email && (
                  <TileLink href={`mailto:${d.email}`} label="Email" gradClass="sky">
                    <IconEmail />
                  </TileLink>
                )}
                {waHref && (
                  <TileLink href={waHref} label="WhatsApp" gradClass="green">
                    <IconWhatsApp />
                  </TileLink>
                )}
              </div>
            </section>
          )}

          {hasSocial && (
            <section className="mgmt-section">
              <h2 className="mgmt-section-title">Social media</h2>
              <div className="mgmt-tile-row">
                {d.twitterUrl && (
                  <TileLink href={d.twitterUrl} label="Twitter / X" gradClass="black">
                    <IconTwitter />
                  </TileLink>
                )}
                {d.linkedinUrl && (
                  <TileLink href={d.linkedinUrl} label="LinkedIn" gradClass="blue">
                    <IconLinkedIn />
                  </TileLink>
                )}
                {d.facebookUrl && (
                  <TileLink href={d.facebookUrl} label="Facebook" gradClass="blue">
                    <IconFacebook />
                  </TileLink>
                )}
                {d.instagramUrl && (
                  <TileLink href={d.instagramUrl} label="Instagram" gradClass="pink">
                    <IconInstagram />
                  </TileLink>
                )}
              </div>
            </section>
          )}
        </div>

        {d.workAddress && (
          <section className="mgmt-section">
            <h2 className="mgmt-section-title">Address</h2>
            <div className="flex justify-center">
              <TileButton
                label="Work"
                gradClass="amber"
                onClick={() => {
                  const q = encodeURIComponent(d.workAddress);
                  window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
                }}
              >
                <IconMapPin />
              </TileButton>
            </div>
          </section>
        )}
        {d.websiteUrl && (
          <section className="mgmt-section">
            <h2 className="mgmt-section-title">Website</h2>
            <div className="flex justify-center">
              <TileButton
                label="Website"
                gradClass="sky"
                onClick={() => {
                  window.open(d.websiteUrl, '_blank');
                }}
              >
                <IconGlobe />
              </TileButton>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
