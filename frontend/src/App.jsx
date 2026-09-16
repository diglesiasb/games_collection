import { useState } from 'react'

import Collection from './components/Collection'
import Administration from './components/Administration'
import Platforms from './components/Platforms'

function App() {

    const [section, setSection] = useState('collection')

    return (
        <main className="app">
            <div className="app-header">
                <h1>Games Collection</h1>
                <button
                    className="app-settings"
                    onClick={() => setSection('administration')}
                    aria-label="Administration"
                >
                    ⚙
                </button>
            </div>

            {section === 'collection' ? (
                <Collection
                    onAdministration={() => setSection('administration')}
                />
            ) : section === 'administration' ? (
                <Administration
                    onBack={() => setSection('collection')}
                    onPlatforms={() => setSection('platforms')}
                />
            ) : (
                <Platforms
                    onBack={() => setSection('administration')}
                />
            )}
        </main>
    )
}

export default App