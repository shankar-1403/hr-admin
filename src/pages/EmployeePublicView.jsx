import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { db } from '../firebase';
import { ref, get } from 'firebase/database';
import logo from '../assets/logo.png';
import EmployeeManagementPublicView from './EmployeeManagementPublicView';
import './EmployeePublicView.css';

export default function EmployeePublicView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  /** Compact “management” card after scan; `alt` kept for older printed QR codes. */
  const isManagementCardView = useMemo(() => {
    const v = (searchParams.get('view') || '').toLowerCase();
    return v === 'management' || v === 'alt';
  }, [searchParams]);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await get(ref(db, `employees/${id}`));
        if (!snap.exists()) {
          if (!cancelled) setError('Employee not found');
        } else if (!cancelled) {
          setEmployee({ id, ...snap.val() });
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Employee not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="employee-public-wrap">
        <div className="employee-public-loading">Loading...</div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="employee-public-wrap">
        <div className="employee-public-card employee-public-error">
          <p>{error || 'Employee not found'}</p>
        </div>
      </div>
    );
  }

  if (isManagementCardView) {
    return <EmployeeManagementPublicView employee={employee} />;
  }

  return (
    <div className="employee-public-wrap">
      <div className="employee-public-card">
        <header className="employee-card-header">
          <div className="employee-card-avatar-wrap">
            {employee.profileImageUrl ? (
              <img
                src={employee.profileImageUrl}
                alt={employee.name}
                className="employee-card-avatar"
              />
            ) : (
              <div className="employee-card-avatar-placeholder">
                {employee.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="employee-card-brand">
            <img src={logo} alt="PCRED" className="employee-card-logo" />
          </div>
        </header>

        <div className="employee-card-details">
          <dl className="employee-card-dl">
            <div className="employee-card-row">
              <dt>Name</dt>
              <dd>{employee.name}</dd>
            </div>
            {employee.fatherName && (
              <div className="employee-card-row">
                <dt>Father&apos;s Name</dt>
                <dd>{employee.fatherName}</dd>
              </div>
            )}
            {employee.spouseName && (
              <div className="employee-card-row">
                <dt>Spouse Name</dt>
                <dd>{employee.spouseName}</dd>
              </div>
            )}
            <div className="employee-card-row">
              <dt>Blood Group</dt>
              <dd>{employee.bloodGroup}</dd>
            </div>
            <div className="employee-card-row">
              <dt>Office Address</dt>
              <dd>{employee.officeAddress}</dd>
            </div>
            <div className="employee-card-row">
              <dt>Home Address</dt>
              <dd>{employee.homeAddress}</dd>
            </div>
            <div className="employee-card-row">
              <dt>Emergency Contact No</dt>
              <dd>{employee.emergencyContactNo}</dd>
            </div>
            <div className="employee-card-row">
              <dt>Website</dt>
              <dd>
                {employee.website ? (
                  <a
                    href={employee.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="employee-card-website-btn"
                  >
                    Visit Website
                  </a>
                ) : (
                  <span className="employee-card-no-website">—</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
