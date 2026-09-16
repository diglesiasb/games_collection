import './InfoModal.css'

function InfoModal({ title, message, onClose }) {
    return (
        <div className="info-modal-overlay">
            <div className="info-modal">
                <h2>{title}</h2>

                <p>{message}</p>

                <div className="info-modal-actions">
                    <button
                        className="info-modal-close"
                        onClick={onClose}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    )
}

export default InfoModal