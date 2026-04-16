export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-box">
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="modal-title">{title}</h2>}
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}