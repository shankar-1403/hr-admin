import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, push, set } from 'firebase/database';
import { RTDB_MANAGEMENT_ITEMS } from '../constants/rtdbPaths';
import './AddEmployeeModal.css';
import './AddManagementModal.css';

const initialForm = {
  fullName: '',
  jobTitle: '',
  companyName: '',
  bio: '',
  profileImageUrl: '',
  mobilePhone: '',
  email: '',
  whatsapp: '',
  twitterUrl: '',
  linkedinUrl: '',
  facebookUrl: '',
  instagramUrl: '',
  workAddress: '',
  websiteUrl: '',
  education: '',
  experience: '',
};

function getInitialForm(item) {
  if (!item) return initialForm;
  return {
    fullName: item.fullName || item.title || '',
    jobTitle: item.jobTitle || item.subtitle || '',
    companyName: item.companyName || '',
    bio: item.bio || item.details || '',
    profileImageUrl: item.profileImageUrl || '',
    mobilePhone: item.mobilePhone || '',
    email: item.email || '',
    whatsapp: item.whatsapp || '',
    twitterUrl: item.twitterUrl || '',
    linkedinUrl: item.linkedinUrl || '',
    facebookUrl: item.facebookUrl || '',
    instagramUrl: item.instagramUrl || '',
    workAddress: item.workAddress || '',
    websiteUrl: item.websiteUrl || '',
    education: item.education || '',
    experience: item.experience || '',
  };
}

export default function AddManagementModal({ onClose, onAdded, item }) {
  const [form, setForm] = useState(() => getInitialForm(item));
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(getInitialForm(item));
    setProfileImageFile(null);
  }, [item]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const fullName = form.fullName.trim();
    if (!fullName) {
      setError('Full name is required.');
      return;
    }
    setSubmitting(true);
    try {
      let profileImageUrl = form.profileImageUrl || '';
      if (profileImageFile) {
        profileImageUrl = await readFileAsDataUrl(profileImageFile);
      }

      const now = Date.now();
      const dataToSave = {
        fullName,
        jobTitle: form.jobTitle.trim(),
        companyName: form.companyName.trim(),
        bio: form.bio.trim(),
        profileImageUrl,
        mobilePhone: form.mobilePhone.trim(),
        email: form.email.trim(),
        whatsapp: form.whatsapp.trim(),
        twitterUrl: form.twitterUrl.trim(),
        linkedinUrl: form.linkedinUrl.trim(),
        facebookUrl: form.facebookUrl.trim(),
        instagramUrl: form.instagramUrl.trim(),
        workAddress: form.workAddress.trim(),
        websiteUrl: form.websiteUrl.trim(),
        education: form.education.trim(),
        experience: form.experience.trim(),
        createdAt: item?.createdAt || now,
        updatedAt: now,
      };

      if (item?.id) {
        await set(ref(db, `${RTDB_MANAGEMENT_ITEMS}/${item.id}`), dataToSave);
      } else {
        const newRef = push(ref(db, RTDB_MANAGEMENT_ITEMS));
        await set(newRef, dataToSave);
      }
      onAdded();
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card mgmt-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item ? 'Edit digital card' : 'Add digital card'}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error">{error}</div>}

          <fieldset>
            <legend>Profile</legend>
            <label>
              Full name <span className="required">*</span>
              <input
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                required
                placeholder="e.g. Vijay Kumar Sharma"
              />
            </label>
            <div className="form-row-2">
              <label>
                Job title
                <input
                  value={form.jobTitle}
                  onChange={(e) => update('jobTitle', e.target.value)}
                  placeholder="e.g. Founder"
                />
              </label>
              <label>
                Company
                <input
                  value={form.companyName}
                  onChange={(e) => update('companyName', e.target.value)}
                  placeholder="e.g. Pcred venture Pvt Ltd"
                />
              </label>
            </div>
            <label>
              Profile photo
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setProfileImageFile(e.target.files?.[0] || null);
                }}
              />
            </label>
            <label>
              Bio
              <textarea
                value={form.bio}
                onChange={(e) => update('bio', e.target.value)}
                rows={4}
                placeholder="Professional summary"
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>Contact</legend>
            <div className="form-row-2">
              <label>
                Mobile
                <input
                  value={form.mobilePhone}
                  onChange={(e) => update('mobilePhone', e.target.value)}
                  placeholder="+91 …"
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="name@company.com"
                />
              </label>
            </div>
            <label>
              WhatsApp (number)
              <input
                value={form.whatsapp}
                onChange={(e) => update('whatsapp', e.target.value)}
                placeholder="Same as mobile or business WhatsApp"
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>Social &amp; web</legend>
            <div className="form-row-2">
              <label>
                Twitter / X URL
                <input
                  value={form.twitterUrl}
                  onChange={(e) => update('twitterUrl', e.target.value)}
                  placeholder="https://twitter.com/…"
                />
              </label>
              <label>
                LinkedIn URL
                <input
                  value={form.linkedinUrl}
                  onChange={(e) => update('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/in/…"
                />
              </label>
            </div>
            <div className="form-row-2">
              <label>
                Facebook URL
                <input
                  value={form.facebookUrl}
                  onChange={(e) => update('facebookUrl', e.target.value)}
                  placeholder="https://facebook.com/…"
                />
              </label>
              <label>
                Instagram URL
                <input
                  value={form.instagramUrl}
                  onChange={(e) => update('instagramUrl', e.target.value)}
                  placeholder="https://instagram.com/…"
                />
              </label>
            </div>
            <label>
              Website
              <input
                value={form.websiteUrl}
                onChange={(e) => update('websiteUrl', e.target.value)}
                placeholder="https://…"
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>Location &amp; more</legend>
            <label>
              Work address
              <textarea
                value={form.workAddress}
                onChange={(e) => update('workAddress', e.target.value)}
                rows={2}
                placeholder="Office address or map link"
              />
            </label>
            <label>
              Education
              <textarea
                value={form.education}
                onChange={(e) => update('education', e.target.value)}
                rows={2}
                placeholder="Degrees, institutions"
              />
            </label>
            <label>
              Experience
              <textarea
                value={form.experience}
                onChange={(e) => update('experience', e.target.value)}
                rows={2}
                placeholder="Roles, highlights"
              />
            </label>
          </fieldset>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : item ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
