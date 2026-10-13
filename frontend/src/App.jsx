import { useEffect, useState } from 'react'

import { getOpenCriticStatus, isApiLoading } from './services/gamesApi'

import Collection from './components/Collection'
import Administration from './components/Administration'
import Platforms from './components/Platforms'
import Genres from './components/Genres'

function App() {

    const [section, setSection] = useState('collection')
    const [showOpenCriticStatus, setShowOpenCriticStatus] = useState(false)
    const [openCriticStatus, setOpenCriticStatus] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const quotaWarning = (() => {
        if (!openCriticStatus) {
            return null
        }

        const now = new Date()

        const searchesResetAt = openCriticStatus.searches_reset_at
            ? new Date(openCriticStatus.searches_reset_at)
            : null

        const requestsResetAt = openCriticStatus.requests_reset_at
            ? new Date(openCriticStatus.requests_reset_at)
            : null

        const searchesStale = searchesResetAt && searchesResetAt <= now
        const requestsStale = requestsResetAt && requestsResetAt <= now

        if (searchesStale || requestsStale) {
            return {
                type: 'stale',
                message: 'OpenCritic quota data may be outdated.',
            }
        }

        if (
            openCriticStatus.searches_remaining === 0 ||
            openCriticStatus.requests_remaining === 0
        ) {
            return {
                type: 'exhausted',
                message: 'OpenCritic quota exhausted.',
            }
        }

        if (
            openCriticStatus.searches_remaining <= 5 ||
            openCriticStatus.requests_remaining <= 5
        ) {
            return {
                type: 'low',
                message: 'OpenCritic quota is running low.',
            }
        }

        return null
    })()


    useEffect(() => {
        const handleApiLoading = (event) => {
            setIsLoading(event.detail.loading)
        }
        window.addEventListener('api-loading', handleApiLoading)
        setIsLoading(isApiLoading())
        return () => {
            window.removeEventListener('api-loading', handleApiLoading)
        }
    }, [])


    useEffect(() => {
        const handleOpenCriticStatusUpdated = (event) => {
            setOpenCriticStatus(event.detail)
        }

        window.addEventListener(
            'opencritic-status-updated',
            handleOpenCriticStatusUpdated
        )

        return () => {
            window.removeEventListener(
                'opencritic-status-updated',
                handleOpenCriticStatusUpdated
            )
        }
    }, [])

    useEffect(() => {
        if (!showOpenCriticStatus) {
            return
        }

        getOpenCriticStatus()
            .then(data => setOpenCriticStatus(data))
            .catch(error => {
                console.error('Error loading OpenCritic status:', error)
            })
    }, [showOpenCriticStatus])

    return (
        <main className="app">
            <div className="app-header">
                <h1>Games Collection</h1>
                <div className="app-header-buttons">
                    <button
                        className="opencriticusage-button"
                        onClick={() => setShowOpenCriticStatus(true)}
                        aria-label="OpenCritic status"
                    >
                        OC
                    </button>
                    <button
                        className="app-settings"
                        onClick={() => setSection('administration')}
                        aria-label="Administration"
                    >
                        ⚙
                    </button>
                </div>
            </div>


            {isLoading && (
                <div className="global-loading-overlay">
                    <div
                        className="global-loading-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Loading"
                    >
                        <div className="global-loading-spinner" />
                        <div className="global-loading-text">Loading...</div>
                    </div>
                </div>
            )}


            {quotaWarning && (
                <div className={`opencriticusage-banner opencriticusage-banner-${quotaWarning.type}`}>
                    {quotaWarning.message}
                </div>
            )}



            {showOpenCriticStatus && (
                <div className="opencriticusage-overlay">
                    <div className="opencriticusage-modal">
                        <div className="opencriticusage-modal-header">
                            <h2>OpenCritic Quota</h2>
                        </div>

                        {openCriticStatus ? (
                            <div className="opencriticusage-status">

                                {(
                                    (openCriticStatus.searches_reset_at &&
                                        new Date(openCriticStatus.searches_reset_at) < new Date()) ||
                                    (openCriticStatus.requests_reset_at &&
                                        new Date(openCriticStatus.requests_reset_at) < new Date())
                                ) && (
                                        <div className="opencriticusage-warning">
                                            ⚠️ Quota data may be outdated. Waiting for the next OpenCritic request to refresh it.
                                        </div>
                                    )}


                                <div className="opencriticusage-limit">
                                    <span>Searches</span>

                                    <strong>
                                        {openCriticStatus.searches_remaining} /{' '}
                                        {openCriticStatus.searches_limit}
                                    </strong>

                                    <small>
                                        Reset:{' '}
                                        {new Date(
                                            openCriticStatus.searches_reset_at
                                        ).toLocaleString()}
                                    </small>
                                </div>

                                <div className="opencriticusage-limit">
                                    <span>Requests</span>

                                    <strong>
                                        {openCriticStatus.requests_remaining} /{' '}
                                        {openCriticStatus.requests_limit}
                                    </strong>

                                    <small>
                                        Reset:{' '}
                                        {new Date(
                                            openCriticStatus.requests_reset_at
                                        ).toLocaleString()}
                                    </small>
                                </div>
                            </div>
                        ) : (
                            <p>Loading...</p>
                        )}

                        <div className="opencriticusage-modal-footer">
                            <button
                                onClick={() => setShowOpenCriticStatus(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}



            {section === 'collection' ? (
                <Collection />
            ) : section === 'administration' ? (
                <Administration
                    onBack={() => setSection('collection')}
                    onPlatforms={() => setSection('platforms')}
                    onGenres={() => setSection('genres')}
                />
            ) : section === 'platforms' ? (
                <Platforms
                    onBack={() => setSection('administration')}
                />
            ) : (
                <Genres
                    onBack={() => setSection('administration')}
                />
            )}
        </main>
    )
}

export default App