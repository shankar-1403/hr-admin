import { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, db, isRealtimeDatabaseConfigured } from '../firebase';
import { ref, onValue } from 'firebase/database';
import AddEmployeeModal from '../components/AddEmployeeModal';
import logo from '../assets/logo.png';
import './Dashboard.css';

export default function DashboardLayout() {
  const { logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  /** Kept for child tables after delete/add; the Realtime listener usually updates first. */
  const fetchEmployees = useCallback(async () => {
    setFetchError('');
  }, []);

  useEffect(() => {
    if (!isRealtimeDatabaseConfigured) {
      setFetchError(
        'Realtime Database URL is missing. Add VITE_FIREBASE_DATABASE_URL to frontend/.env (Firebase console → Realtime Database).'
      );
      setEmployees([]);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    let unsubEmployees;

    (async () => {
      try {
        await auth.authStateReady();
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setFetchError(e?.message || 'Firebase Auth failed to initialize.');
          setLoading(false);
        }
        return;
      }
      if (cancelled) return;
      if (!auth.currentUser) {
        setEmployees([]);
        setLoading(false);
        return;
      }

      setFetchError('');
      setLoading(true);
      const empRef = ref(db, 'employees');
      unsubEmployees = onValue(
        empRef,
        (snap) => {
          if (cancelled) return;
          const val = snap.val() || {};
          const list = Object.entries(val).map(([id, data]) => ({ id, ...data }));
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setEmployees(list);
          setFetchError('');
          setLoading(false);
        },
        (err) => {
          if (cancelled) return;
          console.error(err);
          const code = err?.code || '';
          const hint =
            code === 'PERMISSION_DENIED'
              ? ' Deploy database.rules.json (see repo root) with: firebase deploy --only database, or update Rules in the Firebase console so signed-in users can read /employees.'
              : '';
          setFetchError(
            (err?.message || 'Could not read employees from Realtime Database.') + hint
          );
          setEmployees([]);
          setLoading(false);
        }
      );
    })();

    return () => {
      cancelled = true;
      if (typeof unsubEmployees === 'function') unsubEmployees();
    };
  }, []);

  function handleSaved() {
    setModalOpen(false);
    setEditingEmployee(null);
    fetchEmployees();
  }

  function handleExport() {
    if (!employees.length) return;
    const headers = [
      'Name',
      'Father Name',
      'Spouse Name',
      'Blood Group',
      'Office Address',
      'Home Address',
      'Emergency Contact No',
      'Website',
    ];
    const rows = employees.map((e) => [
      e.name || '',
      e.fatherName || '',
      e.spouseName || '',
      e.bloodGroup || '',
      e.officeAddress || '',
      e.homeAddress || '',
      e.emergencyContactNo || '',
      e.website || '',
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
    a.download = 'employees.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const outletContext = {
    employees,
    loading,
    fetchEmployees,
    handleExport,
    openAddModal: () => {
      setEditingEmployee(null);
      setModalOpen(true);
    },
    openEditModal: (emp) => {
      setEditingEmployee(emp);
      setModalOpen(true);
    },
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-main">
          <NavLink to="/" className="dashboard-brand-link" end title="Home">
            <img src={logo} alt="PCRED" className="dashboard-logo" />
          </NavLink>
          <nav className="dashboard-nav" aria-label="Main">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `dashboard-nav-link${isActive ? ' dashboard-nav-link--active' : ''}`
              }
            >
              Employees
            </NavLink>
            <NavLink
              to="/management"
              className={({ isActive }) =>
                `dashboard-nav-link${isActive ? ' dashboard-nav-link--active' : ''}`
              }
            >
              Management
            </NavLink>
          </nav>
        </div>
        <button type="button" className="btn-logout" onClick={logout}>
          Logout
        </button>
      </header>
      <main className="dashboard-main">
        {fetchError && (
          <div className="dashboard-fetch-error" role="alert">
            <strong>Database:</strong> {fetchError}
          </div>
        )}
        <Outlet context={outletContext} />
      </main>
      {modalOpen && (
        <AddEmployeeModal
          onClose={() => {
            setModalOpen(false);
            setEditingEmployee(null);
          }}
          onAdded={handleSaved}
          employee={editingEmployee}
        />
      )}
    </div>
  );
}
