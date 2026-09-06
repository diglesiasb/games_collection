import './ConfirmModal.css'

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <h2>{title}</h2>

        <p>{message}</p>

        <div className="confirm-modal-actions">
          <button
            className="confirm-modal-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="confirm-modal-confirm"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal