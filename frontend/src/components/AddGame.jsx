import { useEffect, useState } from 'react'
import './AddGame.css'
import { getGenres, getPlatforms, createCollection, searchOpenCriticGames } from '../services/gamesApi'

function AddGame({ onBack, onGameCreated }) {


    const [showOpenCriticModal, setShowOpenCriticModal] = useState(false)
    const [opencriticResults, setOpencriticResults] = useState([])
    const [opencriticGame, setOpencriticGame] = useState(null)
    const [opencriticLoading, setOpencriticLoading] = useState(false)


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
        purchase_date: ''
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
        try {
            const results = await searchOpenCriticGames(formData.title)
            console.log('OpenCritic results:', results)
            setOpencriticResults(results)
        } catch (error) {
            console.error(error)
        }
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

        </div>
    )
}

export default AddGame