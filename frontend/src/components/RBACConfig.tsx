import React from 'react';

interface RBACConfigProps {
  config: { [role: string]: string[] };
  onUpdate: (role: string, permissions: string[]) => void;
}

const RBACConfig: React.FC<RBACConfigProps> = ({ config, onUpdate }) => {
  const allPermissions = ['create', 'read', 'update', 'delete'];
  const roles = Object.keys(config);

  const handlePermissionToggle = (role: string, permission: string) => {
    const currentPermissions = config[role];
    
    // If 'all' is toggled
    if (permission === 'all') {
      if (currentPermissions.includes('all')) {
        onUpdate(role, []);
      } else {
        onUpdate(role, ['all']);
      }
      return;
    }

    // If specific permission is toggled
    let newPermissions: string[];
    
    if (currentPermissions.includes('all')) {
      // If 'all' is currently selected, replace it with all except the unchecked one
      newPermissions = allPermissions.filter((p: string) => p !== permission);
    } else if (currentPermissions.includes(permission)) {
      // Remove the permission
      newPermissions = currentPermissions.filter((p: string) => p !== permission);
    } else {
      // Add the permission
      newPermissions = [...currentPermissions, permission];
      
      // If all individual permissions are selected, replace with 'all'
      if (newPermissions.length === allPermissions.length) {
        newPermissions = ['all'];
      }
    }
    
    onUpdate(role, newPermissions);
  };

  const isPermissionChecked = (role: string, permission: string): boolean => {
    const permissions = config[role];
    return permissions.includes('all') || permissions.includes(permission);
  };

  return (
    <div className="rbac-config">
      {roles.map((role) => (
        <div key={role} className="rbac-role">
          <h3 className="role-name">{role}</h3>
          <div className="permissions-grid">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config[role].includes('all')}
                onChange={() => handlePermissionToggle(role, 'all')}
              />
              <span className="permission-name">All Permissions</span>
            </label>
            
            <div className="permission-divider">or individually:</div>
            
            {allPermissions.map((permission) => (
              <label key={permission} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isPermissionChecked(role, permission)}
                  onChange={() => handlePermissionToggle(role, permission)}
                  disabled={config[role].includes('all')}
                />
                <span className="permission-name">{permission}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RBACConfig;
