import React from 'react';

export default function Toast({ toasts }) {
  return (
    <div className="toast-container" id="toastContainer" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.show ? 'show' : ''}`}>
          <span className="toast-icon">✓</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
