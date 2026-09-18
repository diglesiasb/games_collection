import { useEffect, useState } from 'react'
import {
    getGenres,
    deleteGenre,
    createGenre,
    updateGenre
} from '../services/gamesApi'
import ConfirmModal from './ConfirmModal'
import InfoModal from './InfoModal'
import './Genres.css'

function Genres({ onBack }) {

    const [genres, setGenres] = useState([])
    const [confirmModal, setConfirmModal] = useState(null)
    const [infoModal, setInfoModal] = useState(null)

    const [showAddForm, setShowAddForm] = useState(false)
    const [newGenreName, setNewGenreName] = useState('')

    const [editingGenre, setEditingGenre] = useState(null)
    const [editGenre, setEditGenre] = useState(null)

    const [addError, setAddError] = useState('')
    const [editError, setEditError] = useState('')


    useEffect(() => {
        loadGenres()
    }, [])


    async function loadGenres() {

        try {

            const data = await getGenres()
            setGenres(data)

        } catch (error) {

            console.error(error)

        }
    }


    function handleDelete(genre) {

        if (genre.game_count > 0) {

            setInfoModal({
                title: 'Cannot delete genre',
                message: `${genre.genre} is used by ${genre.game_count} games.`
            })

            return
        }

        setConfirmModal({
            title: 'Delete genre',
            message: `Are you sure you want to delete ${genre.genre}?`,

            onConfirm: async () => {

                try {

                    await deleteGenre(genre.id_genre)

                    setConfirmModal(null)

                    await loadGenres()

                } catch (error) {

                    console.error(error)

                }
            }
        })
    }


    function openAddForm() {

        setAddError('')
        setNewGenreName('')
        setShowAddForm(true)
    }


    function closeAddForm() {

        setShowAddForm(false)
        setAddError('')
        setNewGenreName('')
    }


    function openEdit(genre) {

        setEditingGenre(genre.id_genre)

        setEditGenre({
            ...genre
        })

        setEditError('')
    }


    function closeEdit() {

        setEditingGenre(null)
        setEditGenre(null)
        setEditError('')
    }


    async function handleAdd() {

        setAddError('')

        const genre = newGenreName.trim()

        if (!genre) {
            setAddError('Genre name is required.')
            return
        }

        const exists = genres.some(
            item =>
                item.genre.trim().toLowerCase() === genre.toLowerCase()
        )

        if (exists) {
            setAddError('A genre with this name already exists.')
            return
        }

        try {

            await createGenre(genre)

            await loadGenres()

            closeAddForm()

        } catch (error) {

            console.error(error)

            setAddError('Error creating the genre.')

        }
    }


    async function handleEdit() {

        setEditError('')

        const genre = editGenre.genre.trim()

        if (!genre) {
            setEditError('Genre name is required.')
            return
        }

        const exists = genres.some(
            item =>
                item.id_genre !== editGenre.id_genre &&
                item.genre.trim().toLowerCase() === genre.toLowerCase()
        )

        if (exists) {
            setEditError('A genre with this name already exists.')
            return
        }

        try {

            await updateGenre(
                editGenre.id_genre,
                genre
            )

            await loadGenres()

            closeEdit()

        } catch (error) {

            console.error(error)

            setEditError('Error updating genre.')

        }
    }


    return (
        <div className="genres">

            <div className="genres-top-actions">

                <button
                    className="genres-back"
                    onClick={onBack}
                >
                    ← Back
                </button>

                <button
                    className="genres-add"
                    onClick={openAddForm}
                >
                    Add Genre
                </button>

            </div>


            {showAddForm && (
                <div className="genre-form">

                    <div className="genre-form-field">

                        <label>
                            Genre name

                            <input
                                type="text"
                                value={newGenreName}
                                onChange={event =>
                                    setNewGenreName(event.target.value)
                                }
                            />
                        </label>

                    </div>


                    {addError && (
                        <div className="genre-form-error">
                            {addError}
                        </div>
                    )}


                    <div className="genre-form-actions">

                        <button
                            className="genre-cancel"
                            onClick={closeAddForm}
                        >
                            Cancel
                        </button>

                        <button
                            className="genre-save"
                            onClick={handleAdd}
                        >
                            Add
                        </button>

                    </div>

                </div>
            )}


            <section className="genres-section">

                <div className="genres-section-header">
                    <span>Genres</span>
                </div>


                <div className="genres-list">

                    {genres.map(genre => (

                        <div
                            className="genre-item"
                            key={genre.id_genre}
                        >

                            {editingGenre === genre.id_genre ? (

                                <div className="genre-edit-form">

                                    <div className="genre-info">

                                        <label>
                                            Genre name

                                            <input
                                                type="text"
                                                value={editGenre.genre}
                                                onChange={event => {
                                                    setEditGenre({
                                                        ...editGenre,
                                                        genre: event.target.value
                                                    })
                                                }}
                                            />
                                        </label>


                                        <span className="genre-item-count">
                                            {editGenre.game_count} Games
                                        </span>

                                    </div>


                                    {editError && (
                                        <div className="genre-form-error">
                                            {editError}
                                        </div>
                                    )}


                                    <div className="genre-form-actions">

                                        <button
                                            className="genre-cancel"
                                            onClick={closeEdit}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            className="genre-save"
                                            onClick={handleEdit}
                                        >
                                            Save
                                        </button>

                                    </div>

                                </div>

                            ) : (

                                <>

                                    <div className="genre-info">

                                        <span className="genre-name">
                                            {genre.genre}
                                        </span>

                                        <span className="genre-item-count">
                                            {genre.game_count} Games
                                        </span>

                                    </div>


                                    <div className="genre-item-actions">

                                        <button
                                            className="genre-edit"
                                            onClick={() => openEdit(genre)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="genre-delete"
                                            onClick={() => handleDelete(genre)}
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </>

                            )}

                        </div>

                    ))}

                </div>

            </section>


            {confirmModal && (
                <ConfirmModal
                    title={confirmModal.title}
                    message={confirmModal.message}
                    onConfirm={confirmModal.onConfirm}
                    onCancel={() => setConfirmModal(null)}
                />
            )}


            {infoModal && (
                <InfoModal
                    title={infoModal.title}
                    message={infoModal.message}
                    onClose={() => setInfoModal(null)}
                />
            )}

        </div>
    )
}

export default Genres