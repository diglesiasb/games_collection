import { useEffect, useState } from 'react'
import './CollectionItemForm.css'
import { getPlatforms } from '../services/gamesApi'

function AddCollectionItemForm({ onCancel, onSave }) {

    const [platforms, setPlatforms] = useState([])

    const [formData, setFormData] = useState({
        id_game_platform: '',
        edition: '',
        type: 'Physical',
        release_date: '',
        purchase_date: ''
    })

    const [error, setError] = useState(null)

    useEffect(() => {
        getPlatforms()
            .then(setPlatforms)
            .catch(error => setError(error.message))
    }, [])

    const validateForm = () => {

        if (!formData.id_game_platform) {
            return 'Platform is required'
        }

        if (!formData.edition.trim()) {
            return 'Edition is required'
        }

        if (!formData.release_date) {
            return 'Release date is required'
        }

        return null
    }

    const handleChange = (event) => {
        const { name, value } = event.target

        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        setError(null)

        const validationError = validateForm()

        if (validationError) {
            setError(validationError)
            return
        }

        try {
            await onSave({
                ...formData,
                id_game_platform: Number(formData.id_game_platform),
                purchase_date:
                    formData.purchase_date === ''
                        ? null
                        : formData.purchase_date
            })
        } catch (error) {
            setError(error.message)
        }
    }

    return (
        <form
            className="collection-item-form add-collection-item-form"
            onSubmit={handleSubmit}
        >

            <h3>Add Collection Item</h3>

            <div className="collection-item-form-row">

                <label>
                    Platform
                    <select
                        name="id_game_platform"
                        value={formData.id_game_platform}
                        onChange={handleChange}
                    >
                        <option value="">
                            Select platform
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
                </label>


            </div>

            <div className="collection-item-form-row">

                <label>
                    Edition
                    <input
                        type="text"
                        name="edition"
                        value={formData.edition}
                        onChange={handleChange}
                    />
                </label>

                <label>
                    Type
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                    >
                        <option value="Physical">
                            Physical
                        </option>

                        <option value="Digital">
                            Digital
                        </option>
                    </select>
                </label>



            </div>

            <div className="collection-item-form-row">


                <label>
                    Released
                    <input
                        type="date"
                        name="release_date"
                        value={formData.release_date}
                        onChange={handleChange}
                    />
                </label>

                <label>
                    Purchased
                    <input
                        type="date"
                        name="purchase_date"
                        value={formData.purchase_date}
                        onChange={handleChange}
                    />
                </label>

            </div>

            <div className="collection-item-form-actions">

                <button
                    type="button"
                    onClick={onCancel}
                >
                    Cancel
                </button>

                <button type="submit">
                    Add
                </button>

            </div>

            {error && (
                <div className="collection-item-form-error">
                    {error}
                </div>
            )}

        </form>
    )
}

export default AddCollectionItemForm