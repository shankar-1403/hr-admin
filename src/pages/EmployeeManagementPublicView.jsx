import logo from '../assets/logo.png';
import './EmployeeManagementPublicView.css';

/**
 * Public card shown when opening an employee with ?view=management (or legacy ?view=alt).
 * Same employee record as the standard card; compact layout for scans from Management QR.
 */
export default function EmployeeManagementPublicView({ employee }) {
  const tel = employee.emergencyContactNo
    ? String(employee.emergencyContactNo).replace(/\s/g, '')
    : '';

  return (
    <div className="employee-mgmt-public-wrap">
      <article className="employee-mgmt-card">
        <div className="employee-mgmt-top">
          <img src={logo} alt="PCRED" className="employee-mgmt-logo" />
          <div className="employee-mgmt-avatar-block">
            {employee.profileImageUrl ? (
              <img
                src={employee.profileImageUrl}
                alt={employee.name}
                className="employee-mgmt-avatar"
              />
            ) : (
              <div className="employee-mgmt-avatar employee-mgmt-avatar--ph">
                {employee.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h1 className="employee-mgmt-name">{employee.name}</h1>
          {employee.fatherName && (
            <p className="employee-mgmt-sub">Parent: {employee.fatherName}</p>
          )}
        </div>
        <ul className="employee-mgmt-facts">
          {employee.bloodGroup && (
            <li>
              <span className="employee-mgmt-k">Blood</span>
              <span className="employee-mgmt-v employee-mgmt-blood">
                {employee.bloodGroup}
              </span>
            </li>
          )}
          {employee.emergencyContactNo && (
            <li>
              <span className="employee-mgmt-k">Emergency</span>
              <span className="employee-mgmt-v">
                {tel ? (
                  <a href={`tel:${tel}`} className="employee-mgmt-tel">
                    {employee.emergencyContactNo}
                  </a>
                ) : (
                  employee.emergencyContactNo
                )}
              </span>
            </li>
          )}
          {employee.spouseName && (
            <li>
              <span className="employee-mgmt-k">Spouse</span>
              <span className="employee-mgmt-v">{employee.spouseName}</span>
            </li>
          )}
        </ul>
        {(employee.officeAddress || employee.homeAddress) && (
          <div className="employee-mgmt-addresses">
            {employee.officeAddress && (
              <p>
                <strong>Office</strong>
                <br />
                {employee.officeAddress}
              </p>
            )}
            {employee.homeAddress && (
              <p>
                <strong>Home</strong>
                <br />
                {employee.homeAddress}
              </p>
            )}
          </div>
        )}
        {employee.website && (
          <a
            href={employee.website}
            target="_blank"
            rel="noopener noreferrer"
            className="employee-mgmt-web"
          >
            Website
          </a>
        )}
      </article>
    </div>
  );
}
