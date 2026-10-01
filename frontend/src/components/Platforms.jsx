import { useEffect, useState } from 'react'
import {
    getPlatforms,
    deletePlatform,
    createPlatform,
    updatePlatform,
    getOpenCriticPlatforms,
    linkOpenCriticPlatform,
    unlinkOpenCriticPlatform
} from '../services/gamesApi'
import ConfirmModal from './ConfirmModal'
import InfoModal from './InfoModal'
import './Platforms.css'

function Platforms({ onBack }) {

    const [platforms, setPlatforms] = useState([])
    const [confirmModal, setConfirmModal] = useState(null)
    const [infoModal, setInfoModal] = useState(null)

    const [showAddForm, setShowAddForm] = useState(false)
    const [newPlatformName, setNewPlatformName] = useState('')
    const [newPlatformReleaseDate, setNewPlatformReleaseDate] = useState('')
    const [newPlatformPurchaseDate, setNewPlatformPurchaseDate] = useState('')

    const [editingPlatform, setEditingPlatform] = useState(null)
    const [editPlatform, setEditPlatform] = useState(null)

    const [addError, setAddError] = useState('')
    const [editError, setEditError] = useState('')


    const [opencriticPlatforms, setOpencriticPlatforms] = useState([])
    const [linkingPlatform, setLinkingPlatform] = useState(null)
    const [selectedOpencriticPlatform, setSelectedOpencriticPlatform] = useState('')
    const [linkError, setLinkError] = useState('')
    const [opencriticInfoPlatform, setOpencriticInfoPlatform] = useState(null)



    useEffect(() => {
        loadPlatforms()
        loadOpenCriticPlatforms()
    }, [])


    async function loadPlatforms() {
        try {
            const data = await getPlatforms()
            setPlatforms(data)
        } catch (error) {
            console.error(error)
        }
    }

    async function loadOpenCriticPlatforms() {
        try {
            const data = await getOpenCriticPlatforms()
            setOpencriticPlatforms(data)
        } catch (error) {
            console.error(error)
        }
    }


    async function openOpenCriticLink(platform) {

        setLinkError('')
        setSelectedOpencriticPlatform('')

        await loadOpenCriticPlatforms()

        setLinkingPlatform(platform)
    }


    function getAvailableOpenCriticPlatforms() {

        const linkedIds = new Set(
            platforms
                .filter(platform => platform.id_opencritic !== null)
                .map(platform => platform.id_opencritic)
        )

        return opencriticPlatforms.filter(
            platform => !linkedIds.has(platform.id)
        )
    }

    function getOpenCriticPlatformName(idOpenCritic) {
        const platform = opencriticPlatforms.find(
            platform => platform.id === idOpenCritic
        )

        return platform?.name ?? `ID ${idOpenCritic}`
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

            onConfirm: async () => {

                try {

                    await deletePlatform(platform.id_game_platform)

                    setConfirmModal(null)

                    await loadPlatforms()

                } catch (error) {

                    console.error(error)

                }
            }
        })
    }


    function openAddForm() {

        setAddError('')

        setNewPlatformName('')
        setNewPlatformReleaseDate('')
        setNewPlatformPurchaseDate('')

        setShowAddForm(true)
    }


    function closeAddForm() {

        setShowAddForm(false)
        setAddError('')

        setNewPlatformName('')
        setNewPlatformReleaseDate('')
        setNewPlatformPurchaseDate('')
    }


    function openEdit(platform) {

        setEditingPlatform(platform.id_game_platform)
        setEditPlatform({ ...platform })
        setEditError('')
    }


    function closeEdit() {

        setEditingPlatform(null)
        setEditPlatform(null)
        setEditError('')
    }


    async function handleAdd() {

        setAddError('')

        const name = newPlatformName.trim()

        if (!name) {
            setAddError('Platform name is required.')
            return
        }

        if (!newPlatformReleaseDate) {
            setAddError('Release date is required.')
            return
        }

        const exists = platforms.some(
            platform =>
                platform.name.trim().toLowerCase() === name.toLowerCase()
        )

        if (exists) {
            setAddError('A platform with this name already exists.')
            return
        }

        try {

            await createPlatform(
                name,
                newPlatformReleaseDate,
                newPlatformPurchaseDate
            )

            await loadPlatforms()

            closeAddForm()

        } catch (error) {

            console.error(error)
            setAddError('Error creating the platform.')

        }
    }


    async function handleEdit() {

        setEditError('')

        const name = editPlatform.name.trim()

        if (!name) {
            setEditError('Platform name is required.')
            return
        }

        if (!editPlatform.release_date) {
            setEditError('Release date is required.')
            return
        }

        const exists = platforms.some(
            platform =>
                platform.id_game_platform !== editPlatform.id_game_platform &&
                platform.name.trim().toLowerCase() === name.toLowerCase()
        )

        if (exists) {
            setEditError('A platform with this name already exists.')
            return
        }

        try {

            await updatePlatform(
                editPlatform.id_game_platform,
                name,
                editPlatform.release_date,
                editPlatform.purchase_date
            )

            await loadPlatforms()

            closeEdit()

        } catch (error) {

            console.error(error)
            setEditError('Error updating platform.')

        }
    }

    async function handleLinkOpenCritic() {

        if (!selectedOpencriticPlatform) {
            setLinkError('Select an OpenCritic platform.')
            return
        }

        try {

            await linkOpenCriticPlatform(
                linkingPlatform.id_game_platform,
                Number(selectedOpencriticPlatform)
            )

            setLinkingPlatform(null)
            setSelectedOpencriticPlatform('')
            setLinkError('')

            await loadPlatforms()

        } catch (error) {

            console.error(error)

            setLinkError(error.message)
        }
    }

    function handleUnlinkOpenCritic(platform) {

        setConfirmModal({
            title: 'Unlink OpenCritic',
            message: `Are you sure you want to unlink OpenCritic from ${platform.name}?`,

            onConfirm: async () => {

                try {

                    await unlinkOpenCriticPlatform(
                        platform.id_game_platform
                    )

                    setConfirmModal(null)

                    await loadPlatforms()

                } catch (error) {

                    console.error(error)

                    setConfirmModal({
                        title: 'Unlink error',
                        message: error.message,
                        onConfirm: () => setConfirmModal(null)
                    })
                }
            }
        })
    }


    return (
        <div className="platforms">

            <div className="platforms-top-actions">

                <button
                    className="platforms-back"
                    onClick={onBack}
                >
                    ← Back
                </button>


                <button
                    className="platforms-add"
                    onClick={openAddForm}
                >
                    + Add Platform
                </button>
            </div>

            {
                showAddForm && (
                    <div className="platform-form">

                        <div className="platform-form-field">

                            <label>
                                Platform name

                                <input
                                    type="text"
                                    value={newPlatformName}
                                    onChange={event =>
                                        setNewPlatformName(event.target.value)
                                    }
                                />
                            </label>

                        </div>


                        <div className="platform-form-field">

                            <label>
                                Release date

                                <input
                                    type="date"
                                    value={newPlatformReleaseDate}
                                    onChange={event =>
                                        setNewPlatformReleaseDate(event.target.value)
                                    }
                                />
                            </label>

                        </div>


                        <div className="platform-form-field">

                            <label>
                                Purchase date

                                <input
                                    type="date"
                                    value={newPlatformPurchaseDate}
                                    onChange={event =>
                                        setNewPlatformPurchaseDate(event.target.value)
                                    }
                                />
                            </label>

                        </div>


                        {addError && (
                            <div className="platform-form-error">
                                {addError}
                            </div>
                        )}


                        <div className="platform-form-actions">

                            <button
                                className="platform-cancel"
                                onClick={closeAddForm}
                            >
                                Cancel
                            </button>

                            <button
                                className="platform-save"
                                onClick={handleAdd}
                            >
                                Add
                            </button>

                        </div>

                    </div>
                )
            }


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

                            {editingPlatform === platform.id_game_platform ? (

                                <div className="platform-edit-form">

                                    <div className="platform-info">

                                        <label>
                                            Platform name

                                            <input
                                                type="text"
                                                value={editPlatform.name}
                                                onChange={event => {
                                                    setEditPlatform({
                                                        ...editPlatform,
                                                        name: event.target.value
                                                    })
                                                }}
                                            />
                                        </label>


                                        <label>
                                            Release date

                                            <input
                                                type="date"
                                                value={editPlatform.release_date}
                                                onChange={event => {
                                                    setEditPlatform({
                                                        ...editPlatform,
                                                        release_date: event.target.value
                                                    })
                                                }}
                                            />
                                        </label>


                                        <label>
                                            Purchase date

                                            <input
                                                type="date"
                                                value={editPlatform.purchase_date ?? ''}
                                                onChange={event => {
                                                    setEditPlatform({
                                                        ...editPlatform,
                                                        purchase_date:
                                                            event.target.value || null
                                                    })
                                                }}
                                            />
                                        </label>

                                    </div>


                                    {editError && (
                                        <div className="platform-form-error">
                                            {editError}
                                        </div>
                                    )}


                                    <div className="platform-form-actions">

                                        <button
                                            className="platform-cancel"
                                            onClick={closeEdit}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            className="platform-save"
                                            onClick={handleEdit}
                                        >
                                            Save
                                        </button>

                                    </div>

                                </div>

                            ) : (

                                <>

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


                                    <div className="platform-item-actions">

                                        {platform.id_opencritic === null ? (
                                            <button
                                                className="platform-link-opencritic"
                                                onClick={() => openOpenCriticLink(platform)}
                                            >
                                                Link OpenCritic
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    className="platform-opencritic-info"
                                                    onClick={() => setOpencriticInfoPlatform(platform)}
                                                    title="OpenCritic platform information"
                                                >
                                                    ⓘ
                                                </button>

                                                <button
                                                    className="platform-unlink-opencritic"
                                                    onClick={() => handleUnlinkOpenCritic(platform)}
                                                >
                                                    Unlink OpenCritic
                                                </button>
                                            </>
                                        )}

                                        <button
                                            className="platform-edit"
                                            onClick={() => openEdit(platform)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="platform-delete"
                                            onClick={() => handleDelete(platform)}
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </>

                            )}

                        </div>

                    ))}

                </div>

            </section>


            {
                confirmModal && (
                    <ConfirmModal
                        title={confirmModal.title}
                        message={confirmModal.message}
                        onConfirm={confirmModal.onConfirm}
                        onCancel={() => setConfirmModal(null)}
                    />
                )
            }


            {
                infoModal && (
                    <InfoModal
                        title={infoModal.title}
                        message={infoModal.message}
                        onClose={() => setInfoModal(null)}
                    />
                )
            }

            {linkingPlatform && (
                <div className="platform-modal-overlay">

                    <div className="platform-modal">

                        <h3>
                            Link OpenCritic
                        </h3>

                        <p>
                            Local platform: <strong>{linkingPlatform.name}</strong>
                        </p>

                        <label>
                            OpenCritic platform

                            <select
                                value={selectedOpencriticPlatform}
                                onChange={event =>
                                    setSelectedOpencriticPlatform(event.target.value)
                                }
                            >
                                <option value="">
                                    Select platform
                                </option>

                                {getAvailableOpenCriticPlatforms().map(platform => (
                                    <option
                                        key={platform.id}
                                        value={platform.id}
                                    >
                                        {platform.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {linkError && (
                            <div className="platform-modal-error">
                                {linkError}
                            </div>
                        )}

                        <div className="platform-modal-actions">

                            <button
                                type="button"
                                onClick={() => {
                                    setLinkingPlatform(null)
                                    setSelectedOpencriticPlatform('')
                                    setLinkError('')
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleLinkOpenCritic}
                            >
                                Link
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {opencriticInfoPlatform && (
                <div className="platform-modal-overlay">
                    <div className="platform-modal">
                        <h3>
                            OpenCritic platform
                        </h3>

                        <p>
                            Local platform:{' '}
                            <strong>{opencriticInfoPlatform.name}</strong>
                        </p>

                        <p>
                            OpenCritic platform:{' '}
                            <strong>
                                {getOpenCriticPlatformName(
                                    opencriticInfoPlatform.id_opencritic
                                )}
                            </strong>
                        </p>

                        {/* <p>
                            OpenCritic ID:{' '}
                            <strong>{opencriticInfoPlatform.id_opencritic}</strong>
                        </p> */}

                        <div className="platform-modal-actions">
                            <button
                                type="button"
                                onClick={() => setOpencriticInfoPlatform(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div >
    )
}

export default Platforms