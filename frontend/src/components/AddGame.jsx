import { useEffect, useState } from 'react'
import './AddGame.css'
import { getGenres, getPlatforms } from '../services/gamesApi'

function AddGame({ onBack }) {


    const [genres, setGenres] = useState([])
    const [platforms, setPlatforms] = useState([])
    const [formData, setFormData] = useState({
        title: '',
        developer: '',
        publisher: '',
        opencritic_score: ''
    })

    useEffect(() => {
        getGenres().then(setGenres)
        getPlatforms().then(setPlatforms)
    }, [])

    const handleChange = (event) => {
        const { name, value } = event.target

        setFormData({
            ...formData,
            [name]: value
        })
    }


    return (
        <div className="add-game">
            <div className="add-game-back">
                <button onClick={onBack}>← Back</button>
            </div>

            <h1>Add Game</h1>

            <div className="add-game-section">
                <h2>Game information</h2>

                <div className="add-game-row">
                    <label>
                        Title
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </label>
                </div>

                <div className="add-game-row">
                    <label>
                        Developer
                        <input
                            type="text"
                            name="developer"
                            value={formData.developer}
                            onChange={handleChange}
                        />
                    </label>

                    <label>
                        Publisher
                        <input
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
                            min="0"
                            max="100"
                            value={formData.opencritic_score}
                            onChange={handleChange}
                        />
                    </label>
                </div>
            </div>
        </div>
    )
}

export default AddGame