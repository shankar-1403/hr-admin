import { useState, useEffect, useCallback, useRef } from 'react';
import { auth, db, isRealtimeDatabaseConfigured } from '../firebase';
import { ref, onValue, set } from 'firebase/database';
import { RTDB_MANAGEMENT_ITEMS  } from '../constants/rtdbPaths';
import ManagementTable from '../components/ManagementTable';
import AddManagementModal from '../components/AddManagementModal';
import './Dashboard.css';

export default function ManagementPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const refreshList = useCallback(() => Promise.resolve(), []);

  useEffect(() => {
    if (!isRealtimeDatabaseConfigured) {
      setFetchError(
        'Realtime Database URL is missing. Add VITE_FIREBASE_DATABASE_URL to frontend/.env.'
      );
      setItems([]);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    let unsub;

    (async () => {
      try {
        await auth.authStateReady();
      } catch (e) {
        if (!cancelled) {
          setFetchError(e?.message || 'Auth failed to initialize.');
          setLoading(false);
        }
        return;
      }
      if (cancelled) return;
      if (!auth.currentUser) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setFetchError('');
      const r = ref(db, RTDB_MANAGEMENT_ITEMS);
      unsub = onValue(
        r,
        (snap) => {
          if (cancelled) return;
          const val = snap.val() || {};
          const list = Object.entries(val).map(([id, data]) => ({ id, ...data }));
          // Oldest first: first added stays at top, newer entries follow.
          list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
          setItems(list);
          setFetchError('');
          setLoading(false);
        },
        (err) => {
          if (cancelled) return;
          const code = err?.code || '';
          const hint =
            code === 'PERMISSION_DENIED'
              ? ' Update Realtime Database rules for `managementItems` (see database.rules.json in the repo).'
              : '';
          setFetchError((err?.message || 'Could not load management records.') + hint);
          setItems([]);
          setLoading(false);
        }
      );
    })();

    return () => {
      cancelled = true;
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  function handleExport() {
    if (!items.length) return;
    const headers = [
      'Full name',
      'Job title',
      'Company',
      'Bio',
      'Mobile',
      'Email',
      'WhatsApp',
      'Twitter',
      'LinkedIn',
      'Facebook',
      'Instagram',
      'Work address',
      'Website',
      'Education',
      'Experience',
    ];
    const rows = items.map((r) => [
      r.fullName || r.title || '',
      r.jobTitle || r.subtitle || '',
      r.companyName || '',
      (r.bio || r.details || '').replace(/\r?\n/g, ' '),
      r.mobilePhone || '',
      r.email || '',
      r.whatsapp || '',
      r.twitterUrl || '',
      r.linkedinUrl || '',
      r.facebookUrl || '',
      r.instagramUrl || '',
      (r.workAddress || '').replace(/\r?\n/g, ' '),
      r.websiteUrl || '',
      (r.education || '').replace(/\r?\n/g, ' '),
      (r.experience || '').replace(/\r?\n/g, ' '),
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => {
            const value = String(cell ?? '');
            const needsQuotes = /[",\n]/.test(value);
            const escaped = value.replace(/"/g, '""');
            return needsQuotes ? `"${escaped}"` : escaped;
          })
          .join(',')
      )
      .join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'management-records.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleSaved() {
    setModalOpen(false);
    setEditingItem(null);
  }

  return (
    <>
      <div className="dashboard-toolbar">
        <h1>Management</h1>
        <div className="dashboard-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleExport}
            disabled={!items.length}
          >
            Export CSV
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
          >
            Add digital card
          </button>
        </div>
      </div>
      {fetchError && (
        <div className="dashboard-fetch-error" role="alert">
          <strong>Database:</strong> {fetchError}
        </div>
      )}
      {loading ? (
        <p className="dashboard-loading">Loading management records…</p>
      ) : (
        <ManagementTable
          items={items}
          onRefresh={refreshList}
          onEdit={(row) => {
            setEditingItem(row);
            setModalOpen(true);
          }}
        />
      )}
      {modalOpen && (
        <AddManagementModal
          onClose={() => {
            setModalOpen(false);
            setEditingItem(null);
          }}
          onAdded={handleSaved}
          item={editingItem}
        />
      )}
    </>
  );
}
