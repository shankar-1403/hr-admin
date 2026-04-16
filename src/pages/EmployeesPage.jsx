import { useOutletContext } from 'react-router-dom';
import EmployeeTable from '../components/EmployeeTable';

export default function EmployeesPage() {
  const {
    employees,
    loading,
    fetchEmployees,
    handleExport,
    openAddModal,
    openEditModal,
  } = useOutletContext();

  return (
    <>
      <div className="dashboard-toolbar">
        <h1>Employees</h1>
        <div className="dashboard-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleExport}
            disabled={!employees.length}
          >
            Export CSV
          </button>
          <button type="button" className="btn-primary" onClick={openAddModal}>
            Add Employee
          </button>
        </div>
      </div>
      {loading ? (
        <p className="dashboard-loading">Loading employees...</p>
      ) : (
        <EmployeeTable
          employees={employees}
          onRefresh={fetchEmployees}
          onEdit={openEditModal}
          publicLinkDisplay="text"
          linkVariant="default"
        />
      )}
    </>
  );
}
