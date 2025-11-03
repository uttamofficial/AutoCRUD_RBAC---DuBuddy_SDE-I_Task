import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '3rem 2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#333' }}>
        Welcome to AutoCRUD-RBAC
      </h1>
      <p style={{ 
        fontSize: '1.25rem', 
        color: '#666', 
        marginBottom: '3rem',
        maxWidth: '800px',
        margin: '0 auto 3rem'
      }}>
        A powerful dynamic model builder with automatic CRUD operations and role-based access control.
        Create, manage, and version your data models with ease.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginTop: '3rem'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <h2 style={{ color: '#333', marginBottom: '1rem' }}>Manage Models</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Create and manage your data models dynamically. Define fields, relationships, and validation rules.
          </p>
          <Link to="/models" style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: '500'
          }}>
            View Models →
          </Link>
        </div>

        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h2 style={{ color: '#333', marginBottom: '1rem' }}>Admin Panel</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Configure RBAC permissions, manage user roles, and test your access control rules.
          </p>
          <Link to="/admin" style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: '#28a745',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: '500'
          }}>
            Open Admin →
          </Link>
        </div>

        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📜</div>
          <h2 style={{ color: '#333', marginBottom: '1rem' }}>Audit Logs</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Track all changes and operations performed on your models with detailed audit trails.
          </p>
          <Link to="/audit-logs" style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: '#6c757d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: '500'
          }}>
            View Logs →
          </Link>
        </div>
      </div>

      <div style={{ 
        marginTop: '4rem', 
        padding: '2rem', 
        background: '#f8f9fa', 
        borderRadius: '8px' 
      }}>
        <h3 style={{ color: '#333', marginBottom: '1rem' }}>Key Features</h3>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0, 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          textAlign: 'left'
        }}>
          <li style={{ color: '#666' }}>✓ Dynamic model creation</li>
          <li style={{ color: '#666' }}>✓ Automatic CRUD operations</li>
          <li style={{ color: '#666' }}>✓ Role-based access control</li>
          <li style={{ color: '#666' }}>✓ Model versioning</li>
          <li style={{ color: '#666' }}>✓ Hot reload support</li>
          <li style={{ color: '#666' }}>✓ Comprehensive audit logs</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
