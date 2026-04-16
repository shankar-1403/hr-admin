import { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { db } from '../firebase';
import { ref, remove } from 'firebase/database';
import './EmployeeTable.css';

/**
 * @param {'none' | 'text' | 'qr'} publicLinkDisplay — QR column: hidden, text link, or QR + link
 * @param {'default' | 'alt' | 'management'} linkVariant — `management` appends `?view=management` (management scan card); `alt` is legacy `?view=alt`
 */
export default function EmployeeTable({
  employees,
  onRefresh,
  onEdit,
  publicLinkDisplay = 'text',
  linkVariant = 'default',
}) {
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const showLinkColumn = publicLinkDisplay !== 'none';
  const colCount = showLinkColumn ? 7 : 6;

  async function handleDelete(id) {
    if (!window.confirm('Delete this employee?')) return;
    setDeletingId(id);
    try {
      await remove(ref(db, `employees/${id}`));
      onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  const baseUrl = window.location.origin;

  function publicCardUrl(empId) {
    const path = `${baseUrl}/employee/${empId}`;
    if (linkVariant === 'alt') return `${path}?view=alt`;
    if (linkVariant === 'management') return `${path}?view=management`;
    return path;
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return employees;
    return employees.filter((e) => {
      const fields = [
        e.name,
        e.fatherName,
        e.spouseName,
        e.bloodGroup,
        e.emergencyContactNo,
        e.officeAddress,
        e.homeAddress,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return fields.includes(term);
    });
  }, [employees, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  const linkColumnHeader =
    publicLinkDisplay === 'text'
      ? 'View card'
      : linkVariant === 'management'
        ? 'Management'
        : 'QR Code';

  return (
    <div className="employee-table-wrap">
      <div className="employee-table-toolbar">
        <input
          type="text"
          className="employee-search"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <div className="employee-toolbar-right">
          <label className="employee-page-size-label">
            Rows per page:
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
          <span className="employee-count">
            {filtered.length} employee{filtered.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>
      <table className="employee-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Father&apos;s Name</th>
            <th>Spouse Name</th>
            <th>Blood Group</th>
            <th>Emergency Contact</th>
            {showLinkColumn && <th>{linkColumnHeader}</th>}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="empty-cell">
                No employees found.
              </td>
            </tr>
          ) : (
            visible.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.name}</td>
                <td>{emp.fatherName || '—'}</td>
                <td>{emp.spouseName || '—'}</td>
                <td>{emp.bloodGroup}</td>
                <td>{emp.emergencyContactNo}</td>
                {showLinkColumn && (
                  <td>
                    <div className="qr-cell">
                      {publicLinkDisplay === 'qr' ? (
                        <a
                          href={publicCardUrl(emp.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="qr-link"
                          title="Open public card"
                        >
                          <QRCodeSVG
                            value={publicCardUrl(emp.id)}
                            size={72}
                            level="M"
                            className="qr-svg"
                          />
                          <span className="qr-link-label">View card</span>
                        </a>
                      ) : (
                        <a
                          href={publicCardUrl(emp.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="qr-link qr-link--textonly"
                        >
                          View card
                        </a>
                      )}
                    </div>
                  </td>
                )}
                <td>
                  <div className="actions-cell">
                    <button
                      type="button"
                      className="btn-edit"
                      onClick={() => onEdit && onEdit(emp)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() => handleDelete(emp.id)}
                      disabled={deletingId === emp.id}
                    >
                      {deletingId === emp.id ? '…' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="employee-pagination">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
