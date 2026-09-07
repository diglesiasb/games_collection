import { useState } from 'react'
import './CollectionItemForm.css'

function CollectionItemForm({ item, onCancel, onSave }) {
    const [formData, setFormData] = useState({
        edition: item.edition,
        type: item.type,
        release_date: item.release_date,
        purchase_date: item.purchase_date ?? '',
        starting_date: item.starting_date ?? '',
        finish_date: item.finish_date ?? '',
        finished: item.finished,
        total_hours: item.total_hours ?? ''
    })

    const [error, setError] = useState(null)

    const validateForm = () => {
        if (!formData.edition.trim()) {
            return 'Edition is required'
        }

        if (!formData.release_date) {
            return 'Release date is required'
        }

        if (formData.starting_date &&
            formData.starting_date < formData.release_date) {
            return 'Starting date cannot be before release date'
        }

        if (formData.finish_date &&
            formData.finish_date < formData.release_date) {
            return 'Finish date cannot be before release date'
        }

        if (formData.starting_date &&
            formData.finish_date &&
            formData.finish_date < formData.starting_date) {
            return 'Finish date cannot be before starting date'
        }

        if (!formData.finished && formData.finish_date) {
            return 'Finish date must be empty when finished is false'
        }

        if (
            formData.total_hours !== '' &&
            Number(formData.total_hours) < 0
        ) {
            return 'Total hours must be greater than or equal to 0'
        }

        return null
    }

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target

        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
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
            await onSave(formData)
        } catch (error) {
            setError(error.message)
        }
    }

    return (
        <form
            className="collection-item-form"
            onSubmit={handleSubmit}
        >

            <h3>{item.platform.name}</h3>

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
                        <option value="Physical">Physical</option>
                        <option value="Digital">Digital</option>
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

            <div className="collection-item-form-row">
                <label>
                    Starting date
                    <input
                        type="date"
                        name="starting_date"
                        value={formData.starting_date}
                        onChange={handleChange}
                    />
                </label>

                <label>
                    Finish date
                    <input
                        type="date"
                        name="finish_date"
                        value={formData.finish_date}
                        onChange={handleChange}
                    />
                </label>
            </div>

            <div className="collection-item-form-row">
                <label>
                    Total hours
                    <input
                        type="number"
                        name="total_hours"
                        min="0"
                        value={formData.total_hours}
                        onChange={handleChange}
                    />
                </label>

                <label className="collection-item-form-checkbox">
                    <input
                        type="checkbox"
                        name="finished"
                        checked={formData.finished}
                        onChange={handleChange}
                    />
                    Finished
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
                    Save
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

export default CollectionItemForm