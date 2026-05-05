import { useMemo, useState } from 'react';
import { db } from '../firebase';
import { ref, remove } from 'firebase/database';
import { RTDB_MANAGEMENT_ITEMS } from '../constants/rtdbPaths';
import './EmployeeTable.css';

function publicMgmtUrl(itemId, fullName) {
  const slug = (fullName || '')
    .toLowerCase()
    .replace(/\s+/g, '-')        
    .replace(/[^a-z0-9-]/g, ''); 

  return `${window.location.origin}/${itemId}/${slug}`;
}

export default function ManagementTable({ items, onRefresh, onEdit }) {
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  async function handleDelete(id) {
    if (!window.confirm('Delete this management record?')) return;
    setDeletingId(id);
    try {
      await remove(ref(db, `${RTDB_MANAGEMENT_ITEMS}/${id}`));
      onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((row) => {
      const blob = [
        row.fullName,
        row.title,
        row.jobTitle,
        row.subtitle,
        row.companyName,
        row.bio,
        row.details,
        row.mobilePhone,
        row.email,
        row.whatsapp,
        row.twitterUrl,
        row.linkedinUrl,
        row.facebookUrl,
        row.instagramUrl,
        row.workAddress,
        row.websiteUrl,
        row.education,
        row.experience,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return blob.includes(term);
    });
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);
  const colCount = 6;

  return (
    <div className="employee-table-wrap">
      <div className="employee-table-toolbar">
        <input
          type="text"
          className="employee-search"
          placeholder="Search digital cards..."
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
            {filtered.length} record{filtered.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>
      <table className="employee-table">
        <thead>
          <tr>
            <th>Sr No.</th>
            <th>Name</th>
            <th>Job title</th>
            <th>Company</th>
            <th>View Card</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="empty-cell">
                No digital cards yet. Add one to generate a QR link.
              </td>
            </tr>
          ) : (
            visible.map((row,index) => (
              <tr key={row.id}>
                <td>{index+1}.</td>
                <td>{row.fullName || row.title || '-'}</td>
                <td>{row.jobTitle || row.subtitle || '-'}</td>
                <td>
                  {(() => {
                    const c = (row.companyName || '').trim();
                    if (!c) return '-';
                    return c.length > 72 ? `${c.slice(0, 72)}…` : c;
                  })()}
                </td>
                <td>
                  <div>
                    <a
                      href={publicMgmtUrl(row.id, row.fullName)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="qr-link"
                      title="Open public management page"
                    >
                      <span className="qr-link-label">View Card</span>
                    </a>
                  </div>
                </td>
                <td>
                  <div className="actions-cell">
                    <div>
                      <button type="button" className="btn-edit" onClick={() => onEdit && onEdit(row)}>Edit</button>
                    </div>
                    <div>
                      <button type="button" className="btn-delete" onClick={() => handleDelete(row.id)} disabled={deletingId === row.id}>{deletingId === row.id ? '…' : 'Delete'}</button>
                    </div>
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
