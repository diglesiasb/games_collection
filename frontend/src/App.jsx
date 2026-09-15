import { useState } from 'react'

import Collection from './components/Collection'
import Administration from './components/Administration'

function App() {

    const [section, setSection] = useState('collection')

    return (
        <main className="app">
            <div className="app-header">
                <h1>Games Collection</h1>
                <nav className="app-navigation">
                    <button
                        className={section === 'collection' ? 'active' : ''}
                        onClick={() => setSection('collection')}
                    >
                        Collection
                    </button>

                    <button
                        className={section === 'administration' ? 'active' : ''}
                        onClick={() => setSection('administration')}
                    >
                        Administration
                    </button>
                </nav>
            </div>

            {section === 'collection' ? (
                <Collection />
            ) : (
                <Administration />
            )}
        </main>
    )
}

export default App