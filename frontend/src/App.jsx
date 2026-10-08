import { useEffect, useState } from 'react'

import { getOpenCriticStatus } from './services/gamesApi'

import Collection from './components/Collection'
import Administration from './components/Administration'
import Platforms from './components/Platforms'
import Genres from './components/Genres'

function App() {

    const [section, setSection] = useState('collection')
    const [showOpenCriticStatus, setShowOpenCriticStatus] = useState(false)
    const [openCriticStatus, setOpenCriticStatus] = useState(null)

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
                <div class="app-header-buttons">
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


            {showOpenCriticStatus && (
                <div className="opencriticusage-overlay">
                    <div className="opencriticusage-modal">
                        <div className="opencriticusage-modal-header">
                            <h2>OpenCritic Quota</h2>
                        </div>

                        {openCriticStatus ? (
                            <div className="opencriticusage-status">
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