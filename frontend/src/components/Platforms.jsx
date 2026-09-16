import { useEffect, useState } from 'react'
import { getPlatforms } from '../services/gamesApi'
import ConfirmModal from './ConfirmModal'
import InfoModal from './InfoModal'
import './Platforms.css'

function Platforms({ onBack }) {

    const [platforms, setPlatforms] = useState([])
    const [confirmModal, setConfirmModal] = useState(null)
    const [infoModal, setInfoModal] = useState(null)

    useEffect(() => {
        loadPlatforms()
    }, [])

    async function loadPlatforms() {
        try {
            const data = await getPlatforms()
            setPlatforms(data)
        } catch (error) {
            console.error(error)
        }
    }

    function handleDelete(platform) {

        if (platform.item_count > 0) {
            setInfoModal({
                title: 'Cannot delete platform',
                message: `${platform.name} has ${platform.item_count} collection items.`
            })

            return
        }

        setConfirmModal({
            title: 'Delete platform',
            message: `Are you sure you want to delete ${platform.name}?`,
            onConfirm: () => {
                console.log('Delete', platform.id_game_platform)
                setConfirmModal(null)
            }
        })
    }


    return (
        <div className="platforms">

            <button
                className="platforms-back"
                onClick={onBack}
            >
                ← Back
            </button>

            <section className="platforms-section">

                <div className="platforms-section-header">
                    <span>Platforms</span>
                </div>

                <div className="platforms-list">

                    {platforms.map(platform => (
                        <div
                            className="platform-item"
                            key={platform.id_game_platform}
                        >
                            <div className="platform-info">

                                <span className="platform-name">
                                    {platform.name}
                                </span>

                                <span className="platform-release-date">
                                    Released: {platform.release_date}
                                </span>

                                <span className="platform-release-date">
                                    Purchased: {platform.purchase_date ?? '-'}
                                </span>

                                <span className="platform-item-count">
                                    {platform.item_count} Items
                                </span>

                            </div>

                            <button
                                className="platform-delete"
                                onClick={() => handleDelete(platform)}
                            >
                                Delete
                            </button>

                        </div>
                    ))}

                </div>

            </section>

            {confirmModal && (
                <ConfirmModal
                    title={confirmModal.title}
                    message={confirmModal.message}
                    onConfirm={confirmModal.onConfirm}
                    onCancel={() => setConfirmModal(null)}
                />
            )}

            {infoModal && (
                <InfoModal
                    title={infoModal.title}
                    message={infoModal.message}
                    onClose={() => setInfoModal(null)}
                />
            )}

        </div>
    )
}

export default Platforms