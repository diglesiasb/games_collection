import { useEffect, useState } from 'react'
import './GameEditForm.css'
import { getGenres } from '../services/gamesApi'

function GameEditForm({ game, onCancel, onSave }) {

    const [genres, setGenres] = useState([])

    const [formData, setFormData] = useState({
        title: game.title,
        developer: game.developer,
        publisher: game.publisher,
        opencritic_score: game.opencritic_score ?? '',
        genres: game.genres.map(genre => genre.id_genre)
    })

    const [errors, setErrors] = useState({})

    useEffect(() => {
        getGenres().then(setGenres)
    }, [])

    const validateForm = () => {

        if (!formData.title.trim()) {
            setErrors({ title: 'Title is required' })
            return false
        }

        if (!formData.developer.trim()) {
            setErrors({ developer: 'Developer is required' })
            return false
        }

        if (!formData.publisher.trim()) {
            setErrors({ publisher: 'Publisher is required' })
            return false
        }

        if (formData.opencritic_score !== '') {
            const score = Number(formData.opencritic_score)

            if (score < 0 || score > 100) {
                setErrors({
                    opencritic_score: 'Score must be between 0 and 100'
                })
                return false
            }
        }

        setErrors({})
        return true
    }

    const handleChange = (event) => {
        const { name, value } = event.target

        setFormData({
            ...formData,
            [name]: value
        })
    }

    const toggleGenre = (idGenre) => {
        setFormData(prev => ({
            ...prev,
            genres: prev.genres.includes(idGenre)
                ? prev.genres.filter(id => id !== idGenre)
                : [...prev.genres, idGenre]
        }))
    }

    const handleSubmit = async () => {

        if (!validateForm()) {
            return
        }

        const data = {
            title: formData.title,
            developer: formData.developer,
            publisher: formData.publisher,
            opencritic_score:
                formData.opencritic_score === ''
                    ? null
                    : Number(formData.opencritic_score),
            genres: formData.genres
        }

        try {
            await onSave(data)
        } catch (error) {
            setErrors({
                submit: error.message
            })
        }
    }

    return (
        <div className="game-edit-form">

            <div className="game-edit-section">

                <h2>Game information</h2>

                <div className="game-edit-row">
                    <label>
                        Title
                        <input
                            className="game-edit-input-title"
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </label>
                </div>

                <div className="game-edit-row">

                    <label>
                        Developer
                        <input
                            className="game-edit-input-small"
                            type="text"
                            name="developer"
                            value={formData.developer}
                            onChange={handleChange}
                        />
                    </label>

                    <label>
                        Publisher
                        <input
                            className="game-edit-input-small"
                            type="text"
                            name="publisher"
                            value={formData.publisher}
                            onChange={handleChange}
                        />
                    </label>

                </div>

                <div className="game-edit-row">

                    <label>
                        OpenCritic Score
                        <input
                            type="number"
                            name="opencritic_score"
                            min="0"
                            max="100"
                            value={formData.opencritic_score}
                            onChange={handleChange}
                        />
                    </label>

                </div>

                <div className="game-edit-row">

                    <label>
                        Genres

                        <div className="game-edit-genres">

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

                <div className="game-edit-actions">

                    <button
                        type="button"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                    >
                        Save
                    </button>

                </div>

                {Object.values(errors)[0] && (
                    <div className="game-edit-errors">
                        {Object.values(errors)[0]}
                    </div>
                )}

            </div>

        </div>
    )
}

export default GameEditForm