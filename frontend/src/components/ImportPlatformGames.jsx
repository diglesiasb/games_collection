
import { useEffect, useState } from 'react'

import ConfirmModal from './ConfirmModal'
import InfoModal from './InfoModal'

import {
    getPlatforms,
    previewGameImport,
    importGameCollection,
} from '../services/gamesApi'

import './ImportPlatformGames.css'

function ImportPlatformGames({ onBack, onImportComplete }) {
    const [platforms, setPlatforms] = useState([])
    const [selectedPlatform, setSelectedPlatform] = useState('')
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [error, setError] = useState('')
    const [loadingPlatforms, setLoadingPlatforms] = useState(true)
    const [loadingPreview, setLoadingPreview] = useState(false)
    const [loadingImport, setLoadingImport] = useState(false)
    const [confirmModal, setConfirmModal] = useState(false)
    const [infoModal, setInfoModal] = useState(null)

    useEffect(() => {
        async function loadPlatforms() {
            try {
                const data = await getPlatforms()
                setPlatforms(data)
            } catch (error) {
                console.error('Error loading platforms:', error)
                setError('Could not load platforms.')
            } finally {
                setLoadingPlatforms(false)
            }
        }

        loadPlatforms()
    }, [])

    function handlePlatformChange(event) {
        setSelectedPlatform(event.target.value)
        setPreview(null)
        setError('')
    }

    function handleFileChange(event) {
        setFile(event.target.files?.[0] ?? null)
        setPreview(null)
        setError('')
    }

    async function handlePreview() {
        if (!selectedPlatform || !file) {
            setError('Please select a platform and a text file.')
            return
        }

        setLoadingPreview(true)
        setError('')
        setPreview(null)

        try {
            const data = await previewGameImport(
                Number(selectedPlatform),
                file
            )
            setPreview(data)
        } catch (error) {
            console.error('Error previewing game import:', error)
            setError(error.message || 'Could not preview the import.')
        } finally {
            setLoadingPreview(false)
        }
    }

    function handleImport() {
        if (!preview || !file || !selectedPlatform || loadingImport) {
            return
        }

        setConfirmModal(true)
    }

    async function confirmImport() {
        setConfirmModal(false)
        setLoadingImport(true)
        setError('')

        try {
            const result = await importGameCollection(
                Number(selectedPlatform),
                file
            )

            const summary = result.summary

            setInfoModal({
                title: 'Import completed',
                message:
                    `Platform: ${result.platform_name}\n\n` +
                    `New games: ${summary.new_games}\n` +
                    `Added to collection: ${summary.add_to_collection}\n` +
                    `Already in collection: ${summary.already_in_collection}\n` +
                    `Duplicate lines skipped: ${summary.duplicate_in_file}\n\n` +
                    `Total lines processed: ${summary.total}`,
            })
        } catch (error) {
            console.error('Error importing games:', error)
            setError(error.message || 'Could not import the games.')
        } finally {
            setLoadingImport(false)
        }
    }


    return (
        <div className="import-platform-games">
            <button
                className="administration-back"
                onClick={onBack}
                disabled={loadingImport}
            >
                ← Back
            </button>

            <h2>Import Platform Games</h2>

            <div className="import-platform-games-form">
                <label htmlFor="import-platform">
                    Platform
                </label>

                <select
                    id="import-platform"
                    value={selectedPlatform}
                    onChange={handlePlatformChange}
                    disabled={loadingPlatforms || loadingImport}
                >
                    <option value="">
                        {loadingPlatforms
                            ? 'Loading platforms...'
                            : 'Select a platform'}
                    </option>

                    {platforms.map(platform => (
                        <option
                            key={platform.id_game_platform}
                            value={platform.id_game_platform}
                        >
                            {platform.name}
                        </option>
                    ))}
                </select>

                <label htmlFor="import-file">
                    Games file (.txt)
                </label>

                <input
                    id="import-file"
                    type="file"
                    accept=".txt,text/plain"
                    onChange={handleFileChange}
                    disabled={loadingImport}
                />

                <button
                    onClick={handlePreview}
                    disabled={
                        loadingPlatforms ||
                        loadingPreview ||
                        loadingImport ||
                        !selectedPlatform ||
                        !file
                    }
                >
                    {loadingPreview ? 'Previewing...' : 'Preview'}
                </button>
            </div>

            {error && (
                <p className="import-platform-games-error" role="alert">
                    {error}
                </p>
            )}

            {preview && (
                <div className="import-platform-games-preview">
                    <h3>Preview: {preview.platform_name}</h3>

                    <div className="import-platform-games-summary">
                        {Object.entries(preview.summary ?? {}).map(
                            ([key, value]) => (
                                <div
                                    className="import-platform-games-summary-item"
                                    key={key}
                                >
                                    <span>
                                        {key
                                            .replaceAll('_', ' ')
                                            .replace(/\b\w/g, char =>
                                                char.toUpperCase()
                                            )}
                                    </span>
                                    <strong>{String(value)}</strong>
                                </div>
                            )
                        )}
                    </div>

                    <div className="import-platform-games-table-container">
                        <table className="import-platform-games-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Title</th>
                                    <th>Finished</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {preview.items.map(item => (
                                    <tr key={item.line_number}>
                                        <td>{item.line_number}</td>
                                        <td>{item.title}</td>
                                        <td>
                                            {item.finished ? 'Yes' : 'No'}
                                        </td>
                                        <td
                                            title={item.reason}
                                            className={`import-status import-status-${item.status}`}
                                        >
                                            {item.status.replaceAll('_', ' ')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="import-platform-games-actions">
                        <button
                            onClick={handleImport}
                            disabled={loadingImport || loadingPreview}
                        >
                            {loadingImport ? 'Importing...' : 'Import'}
                        </button>
                    </div>
                </div>
            )}


            {confirmModal && (
                <ConfirmModal
                    title="Please confirm the action"
                    message={
                        `Are you sure you want to import the games ` +
                        `from this file into ${preview.platform_name}?\n\n` +
                        `The operation will create new games and collection ` +
                        `entries where necessary. Games already in the selected ` +
                        `platform and duplicate lines will be skipped.`
                    }
                    confirmText="Confirm"
                    onConfirm={confirmImport}
                    onCancel={() => setConfirmModal(false)}
                />
            )}

            {infoModal && (
                <InfoModal
                    title={infoModal.title}
                    message={infoModal.message}
                    onClose={() => {
                        setInfoModal(null)
                        onImportComplete()
                    }}
                />
            )}


        </div>
    )
}

export default ImportPlatformGames
