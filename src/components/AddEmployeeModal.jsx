import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, push, set } from 'firebase/database';
import './AddEmployeeModal.css';

const RELATION_OPTIONS = [
  { value: 'father', label: 'Father name' },
  { value: 'spouse', label: 'Spouse name' },
];

const initialForm = {
  name: '',
  relationType: 'father',
  fatherName: '',
  spouseName: '',
  bloodGroup: '',
  officeAddress: '',
  homeAddress: '',
  emergencyContactNo: '',
  website: '',
  profileImageUrl: '',
};

function getInitialForm(employee) {
  if (!employee) return initialForm;
  return {
    name: employee.name || '',
    relationType: 'father',
    fatherName: employee.fatherName || '',
    spouseName: employee.spouseName || '',
    bloodGroup: employee.bloodGroup || '',
    officeAddress: employee.officeAddress || '',
    homeAddress: employee.homeAddress || '',
    emergencyContactNo: employee.emergencyContactNo || '',
    website: employee.website || '',
    profileImageUrl: employee.profileImageUrl || '',
  };
}

export default function AddEmployeeModal({ onClose, onAdded, employee }) {
  const [form, setForm] = useState(() => getInitialForm(employee));
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(getInitialForm(employee));
  }, [employee]);

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
    const fatherName = (form.fatherName || '').trim();
    const spouseName = (form.spouseName || '').trim();
    setSubmitting(true);
    try {
      let profileImageUrl = form.profileImageUrl || '';
      if (profileImageFile) {
        profileImageUrl = await readFileAsDataUrl(profileImageFile);
      }

      let website = form.website.trim();
      if (website && !/^https?:\/\//i.test(website)) {
        website = `https://${website}`;
      }

      const payload = {
        name: form.name.trim(),
        bloodGroup: form.bloodGroup.trim(),
        officeAddress: form.officeAddress.trim(),
        homeAddress: form.homeAddress.trim(),
        emergencyContactNo: form.emergencyContactNo.trim(),
      };
      if (fatherName) payload.fatherName = fatherName;
      if (spouseName) payload.spouseName = spouseName;
      if (website) payload.website = website;
      if (profileImageUrl) payload.profileImageUrl = profileImageUrl;

      const now = Date.now();
      const dataToSave = {
        ...payload,
        createdAt: employee?.createdAt || now,
        updatedAt: now,
      };

      if (employee?.id) {
        const employeeRef = ref(db, `employees/${employee.id}`);
        await set(employeeRef, dataToSave);
      } else {
        const listRef = ref(db, 'employees');
        const newRef = push(listRef);
        await set(newRef, dataToSave);
      }
      onAdded();
    } catch (err) {
      setError(err.message || 'Failed to add employee');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{employee ? 'Edit Employee' : 'Add Employee'}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error">{error}</div>}
          <div className="form-row">
            <label>
              Name <span className="required">*</span>
              <input
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                required
                placeholder="e.g. Shankar Manjrekar"
              />
            </label>
            <label className="relation-field">
              Relation
              <select
                value={form.relationType}
                onChange={(e) => update('relationType', e.target.value)}
                className="relation-type-select"
              >
                {RELATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
            {form.relationType === 'father' ? (
              <>
                <label>
                  <span className="relation-label">Father&apos;s Name</span>
                  <input
                    value={form.fatherName}
                    onChange={(e) => update('fatherName', e.target.value)}
                    placeholder="e.g. Santosh Manjrekar"
                  />
                </label>
              </>
            ) : (
              <>
                <label>
                  <span className="relation-label">Spouse Name</span>
                  <input
                    value={form.spouseName}
                    onChange={(e) => update('spouseName', e.target.value)}
                    placeholder="e.g. Optional"
                  />
                </label>
              </>
            )}
          </div>
          
          
          <label>
            Blood Group <span className="required">*</span>
            <input
              value={form.bloodGroup}
              onChange={(e) => update('bloodGroup', e.target.value)}
              required
              placeholder="e.g. B+"
            />
          </label>
          <label>
            Office Address <span className="required">*</span>
            <textarea
              value={form.officeAddress}
              onChange={(e) => update('officeAddress', e.target.value)}
              required
              rows={2}
              placeholder="Full office address"
            />
          </label>
          <label>
            Home Address <span className="required">*</span>
            <textarea
              value={form.homeAddress}
              onChange={(e) => update('homeAddress', e.target.value)}
              required
              rows={2}
              placeholder="Full home address"
            />
          </label>
          <div className="form-row">
            <label>
              Emergency Contact No <span className="required">*</span>
              <input
                value={form.emergencyContactNo}
                onChange={(e) => update('emergencyContactNo', e.target.value)}
                required
                placeholder="e.g. 7715959321"
              />
            </label>
            <label>
              Website
              <input
                type="url"
                value={form.website}
                onChange={(e) => update('website', e.target.value)}
                placeholder="https://..."
              />
            </label>
          </div>
          <label>
            Profile Photo
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setProfileImageFile(file);
              }}
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (employee ? 'Saving...' : 'Adding...') : employee ? 'Save Changes' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
