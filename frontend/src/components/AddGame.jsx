// @ts-nocheck
import { useEffect, useState } from 'react'
import './AddGame.css'
import { getGenres, getPlatforms, createCollection, searchOpenCriticGames, getOpenCriticGame } from '../services/gamesApi'

function AddGame({ onBack, onGameCreated }) {


    const [showOpenCriticModal, setShowOpenCriticModal] = useState(false)
    const [opencriticResults, setOpencriticResults] = useState([])
    const [opencriticGame, setOpencriticGame] = useState(null)
    const [selectedOpencriticPlatform, setSelectedOpencriticPlatform] = useState(null)


    const [genres, setGenres] = useState([])
    const [platforms, setPlatforms] = useState([])
    const [formData, setFormData] = useState({
        title: '',
        developer: '',
        publisher: '',
        opencritic_score: '',
        genres: [],
        id_game_platform: '',
        edition: '',
        type: 'Physical',
        release_date: '',
        purchase_date: '',
        id_opencritic: null,
        image: null,
    })

    const [errors, setErrors] = useState({})

    const validateForm = () => {
        if (!formData.title.trim()) {
            setErrors({ title: 'Title is required' })
            return false
        }

        if (!formData.id_game_platform) {
            setErrors({ id_game_platform: 'Platform is required' })
            return false
        }

        if (!formData.edition.trim()) {
            setErrors({ edition: 'Edition is required' })
            return false
        }

        if (!formData.release_date) {
            setErrors({ release_date: 'Release date is required' })
            return false
        }

        setErrors({})
        return true
    }

    const toggleGenre = (idGenre) => {
        setFormData(prev => ({
            ...prev,
            genres: prev.genres.includes(idGenre)
                ? prev.genres.filter(id => id !== idGenre)
                : [...prev.genres, idGenre]
        }))
    }


    useEffect(() => {
        getGenres().then(setGenres)
        getPlatforms().then(setPlatforms)
    }, [])



    const handleOpenCriticSearch = async () => {
        const title = formData.title.trim()

        if (!title) {
            return
        }

        try {
            const results = await searchOpenCriticGames(title)

            setOpencriticResults(results)
            setShowOpenCriticModal(true)
        } catch (error) {
            console.error(error)
        }
    }

    const handleOpenCriticSelect = async (idOpenCritic) => {
        try {
            const game = await getOpenCriticGame(idOpenCritic)

            console.log('OpenCritic game:', game)

            setOpencriticGame(game)
        } catch (error) {
            console.error(error)
        }
    }


    const handleOpenCriticAccept = () => {
        if (!opencriticGame) {
            return
        }

        let localPlatform = null
        let selectedOpencriticPlatformData = null

        if (selectedOpencriticPlatform) {
            selectedOpencriticPlatformData =
                opencriticGame.platforms.find(
                    platform =>
                        platform.id_opencritic === selectedOpencriticPlatform
                )

            localPlatform = platforms.find(
                platform =>
                    platform.id_opencritic === selectedOpencriticPlatform
            )

            if (!localPlatform) {
                return
            }
        }

        const localGenreIds = opencriticGame.genres
            .map(opencriticGenre => {
                const localGenre = genres.find(
                    genre =>
                        genre.id_opencritic ===
                        opencriticGenre.id_opencritic
                )

                return localGenre?.id_genre
            })
            .filter(id => id !== undefined)

        setFormData(prev => ({
            ...prev,
            title: opencriticGame.title ?? '',
            developer: opencriticGame.developer ?? '',
            publisher: opencriticGame.publisher ?? '',
            opencritic_score:
                opencriticGame.opencritic_score ?? '',
            id_opencritic: opencriticGame.id_opencritic,
            genres: localGenreIds,
            image: opencriticGame.image ?? null,
            id_game_platform:
                localPlatform?.id_game_platform ?? prev.id_game_platform,
            release_date:
                selectedOpencriticPlatformData?.release_date ??
                prev.release_date
        }))

        setShowOpenCriticModal(false)
        setOpencriticGame(null)
        setSelectedOpencriticPlatform(null)
    }


    const getAvailableOpenCriticPlatforms = () => {
        if (!opencriticGame) {
            return []
        }

        const linkedOpenCriticIds = new Set(
            platforms
                .filter(platform => platform.id_opencritic !== null)
                .map(platform => platform.id_opencritic)
        )

        return opencriticGame.platforms.filter(platform =>
            linkedOpenCriticIds.has(platform.id_opencritic)
        )
    }


    const handleChange = (event) => {
        const { name, value } = event.target

        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            return
        }

        const data = {
            ...formData,
            id_game_platform: Number(formData.id_game_platform),
            purchase_date:
                formData.purchase_date === ''
                    ? null
                    : formData.purchase_date
        }

        try {
            await createCollection(data)
            onGameCreated()
        } catch (error) {
            setErrors({
                submit: error.message
            })
        }
    }

    return (
        <div className="add-game">
            <div className="add-game-back">
                <button onClick={onBack}>← Back</button>
            </div>

            {/* <h1>Add Game</h1>  */}

            <div className="add-game-section">
                <h2>Game information</h2>

                <div className="add-game-row">
                    <label>
                        Title
                        <input
                            className="add-game-input-title"
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </label>
                    <button
                        type="button"
                        onClick={handleOpenCriticSearch}
                    >
                        Search OpenCritic
                    </button>

                </div>

                <div className="add-game-row">
                    <label>
                        Developer
                        <input
                            className="add-game-input-small"
                            type="text"
                            name="developer"
                            value={formData.developer}
                            onChange={handleChange}
                        />
                    </label>

                    <label>
                        Publisher
                        <input
                            className="add-game-input-small"
                            type="text"
                            name="publisher"
                            value={formData.publisher}
                            onChange={handleChange}
                        />
                    </label>
                </div>

                <div className="add-game-row">
                    <label>
                        OpenCritic Score
                        <input
                            type="number"
                            className="add-game-input-disabled"
                            name="opencritic_score"
                            value={formData.opencritic_score}
                            disabled
                        />
                    </label>
                </div>

                <div className="add-game-row">
                    <label>
                        Genres

                        <div className="add-game-genres">
                            {genres.map(genre => (
                                <button
                                    type="button"
                                    key={genre.id_genre}
                                    className={
                                        formData.genres.includes(genre.id_genre)
                                            ? 'selected'
                                            : ''
                                    }
                                    onClick={() => toggleGenre(genre.id_genre)}
                                >
                                    {genre.genre}
                                </button>
                            ))}
                        </div>
                    </label>
                </div>


                <h2 className="add-game-h2-ci">Collection Item</h2>

                <div className="add-game-row">
                    <label>
                        Platform
                        <select
                            name="id_game_platform"
                            value={formData.id_game_platform}
                            onChange={handleChange}
                        >
                            <option value="">Select platform</option>

                            {platforms.map(platform => (
                                <option
                                    key={platform.id_game_platform}
                                    value={platform.id_game_platform}
                                >
                                    {platform.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Edition
                        <input
                            type="text"
                            className="add-game-input-small"
                            name="edition"
                            value={formData.edition}
                            onChange={handleChange}
                        />
                    </label>
                </div>

                <div className="add-game-row">
                    <label>
                        Type
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <option value="Physical">Physical</option>
                            <option value="Digital">Digital</option>
                        </select>
                    </label>

                    <label>
                        Release date
                        <input
                            type="date"
                            name="release_date"
                            value={formData.release_date}
                            onChange={handleChange}
                        />
                    </label>
                </div>

                <div className="add-game-row">
                    <label>
                        Purchase date
                        <input
                            type="date"
                            name="purchase_date"
                            value={formData.purchase_date}
                            onChange={handleChange}
                        />
                    </label>
                </div>

                <div className="add-game-actions">
                    <button
                        type="button"
                        className="add-game-cancel"
                        onClick={onBack}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="add-game-save"
                        onClick={handleSubmit}
                    >
                        Add Game
                    </button>
                </div>

                {Object.values(errors)[0] && (
                    <div className="add-game-errors">
                        {Object.values(errors)[0]}
                    </div>
                )}

            </div>

            {showOpenCriticModal && (
                <div className="opencritic-modal-overlay">
                    <div className="opencritic-modal">

                        {!opencriticGame ? (
                            <>
                                <div className="opencritic-results">
                                    {opencriticResults.length === 0 ? (
                                        <div className="opencritic-no-results">
                                            No games found.
                                        </div>
                                    ) : (
                                        opencriticResults.slice(0, 5).map(game => (
                                            <button
                                                type="button"
                                                key={game.id}
                                                className="opencritic-result"
                                                onClick={() => handleOpenCriticSelect(game.id)}
                                            >
                                                {game.name}
                                            </button>
                                        ))
                                    )}
                                </div>

                                <div className="opencritic-modal-actions">
                                    <button
                                        type="button"
                                        className="opencritic-modal-actions-cancel"
                                        onClick={() => setShowOpenCriticModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="opencritic-game-details">

                                    {opencriticGame.image && (
                                        <img
                                            src={opencriticGame.image}
                                            alt={opencriticGame.title}
                                            className="opencritic-game-image"
                                        />
                                    )}

                                    <h3>{opencriticGame.title}</h3>

                                    <div className="opencritic-game-info">

                                        <div className="opencritic-game-info-row">
                                            <span>Developer</span>
                                            <strong>{opencriticGame.developer ?? '-'}</strong>
                                        </div>

                                        <div className="opencritic-game-info-row">
                                            <span>Publisher</span>
                                            <strong>{opencriticGame.publisher ?? '-'}</strong>
                                        </div>

                                        <div className="opencritic-game-info-row">
                                            <span>OpenCritic Score</span>
                                            <strong>
                                                {opencriticGame.opencritic_score ?? '-'}
                                            </strong>
                                        </div>

                                    </div>

                                    {opencriticGame.genres.length > 0 && (
                                        <>
                                            <h4>Genres</h4>

                                            <div className="opencritic-genres">
                                                {opencriticGame.genres.map(genre => (
                                                    <span
                                                        key={genre.id_opencritic}
                                                        className="opencritic-genre"
                                                    >
                                                        {genre.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {getAvailableOpenCriticPlatforms().length > 0 && (
                                        <>
                                            <h4>Platform</h4>

                                            <div className="opencritic-platforms">
                                                {getAvailableOpenCriticPlatforms().map(platform => (
                                                    <label key={platform.id_opencritic}>
                                                        <input
                                                            type="radio"
                                                            name="opencritic-platform"
                                                            value={platform.id_opencritic}
                                                            checked={
                                                                selectedOpencriticPlatform ===
                                                                platform.id_opencritic
                                                            }
                                                            onChange={() =>
                                                                setSelectedOpencriticPlatform(
                                                                    platform.id_opencritic
                                                                )
                                                            }
                                                        />

                                                        <span>{platform.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                </div>

                                <div className="opencritic-modal-actions">

                                    <button
                                        type="button"
                                        className="opencritic-modal-actions-cancel"
                                        onClick={() => {
                                            setOpencriticGame(null)
                                            setSelectedOpencriticPlatform(null)
                                        }}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        className="opencritic-modal-actions-accept"
                                        onClick={handleOpenCriticAccept}
                                    >
                                        Accept
                                    </button>

                                </div>
                            </>
                        )}

                    </div>
                </div>
            )}

        </div>
    )
}

export default AddGame