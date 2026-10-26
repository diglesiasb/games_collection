import './Administration.css'

function Administration({ onBack, onPlatforms, onGenres, onImportPlatformGames }) {
    return (
        <div className="administration">
            <button
                className="administration-back"
                onClick={onBack}
            >
                ← Back
            </button>
            <button
                className="administration-option"
                onClick={onPlatforms}
            >
                <span className="administration-option-title">
                    Platforms
                </span>

                <span className="administration-option-description">
                    Manage platforms
                </span>
            </button>
            <button
                className="administration-option"
                onClick={onGenres}
            >
                <span className="administration-option-title">
                    Genres
                </span>

                <span className="administration-option-description">
                    Manage genres
                </span>
            </button>
            <button
                className="administration-option"
                onClick={onImportPlatformGames}
            >
                <span className="administration-option-title">
                    Import Platform Games
                </span>

                <span className="administration-option-description">
                    Import games from a text file
                </span>
            </button>
        </div>
    )
}

export default Administration