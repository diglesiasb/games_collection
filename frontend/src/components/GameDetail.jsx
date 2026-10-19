import { useState } from 'react'
import './GameDetail.css'
import ConfirmModal from './ConfirmModal'
import CollectionItemForm from './CollectionItemForm'
import AddCollectionItemForm from './AddCollectionItemForm'
import GameEditForm from './GameEditForm'
import {
    updateCollectionItem,
    updateGame,
    deleteGame,
    createGameCollectionItem,
    getGame,
    searchOpenCriticGames,
    getOpenCriticGame,
    linkOpenCriticGame,
    unlinkOpenCriticGame,
    updateOpenCriticGame
} from '../services/gamesApi'

function GameDetail({ game, onBack, onDeleteCollectionItem, onGameUpdated }) {

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showDeleteGameModal, setShowDeleteGameModal] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)
    const [editingGame, setEditingGame] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [addingCollectionItem, setAddingCollectionItem] = useState(false)
    const [showOpenCriticModal, setShowOpenCriticModal] = useState(false)
    const [openCriticResults, setOpenCriticResults] = useState([])
    const [selectedOpenCriticGame, setSelectedOpenCriticGame] = useState(null)
    const [openCriticLoading, setOpenCriticLoading] = useState(false)
    const [openCriticError, setOpenCriticError] = useState(null)
    const [showUnlinkOpenCriticModal, setShowUnlinkOpenCriticModal] = useState(false)

    async function handleOpenCriticSearch() {
        setOpenCriticLoading(true)
        setOpenCriticError(null)
        setOpenCriticResults([])
        setSelectedOpenCriticGame(null)
        setShowOpenCriticModal(true)

        try {
            const results = await searchOpenCriticGames(game.title)
            setOpenCriticResults(results.slice(0, 5))
        } catch (error) {
            setOpenCriticError(error.message)
        } finally {
            setOpenCriticLoading(false)
        }
    }

    async function handleSelectOpenCriticGame(idOpenCritic) {
        setOpenCriticLoading(true)
        setOpenCriticError(null)

        try {
            const result = await getOpenCriticGame(idOpenCritic)
            setSelectedOpenCriticGame(result)
        } catch (error) {
            setOpenCriticError(error.message)
        } finally {
            setOpenCriticLoading(false)
        }
    }

    async function handleLinkOpenCritic() {
        if (!selectedOpenCriticGame) return

        setOpenCriticLoading(true)
        setOpenCriticError(null)

        try {
            await linkOpenCriticGame(
                game.id_game,
                selectedOpenCriticGame.id_opencritic
            )

            const updatedGame = await getGame(game.id_game)

            setShowOpenCriticModal(false)
            setSelectedOpenCriticGame(null)
            onGameUpdated(updatedGame)
        } catch (error) {
            setOpenCriticError(error.message)
        } finally {
            setOpenCriticLoading(false)
        }
    }

    async function handleUnlinkOpenCritic() {
        setOpenCriticLoading(true)
        setOpenCriticError(null)

        try {
            await unlinkOpenCriticGame(game.id_game)

            const updatedGame = await getGame(game.id_game)
            onGameUpdated(updatedGame)
        } catch (error) {
            setOpenCriticError(error.message)
        } finally {
            setOpenCriticLoading(false)
        }
    }

    async function handleUpdateOpenCritic() {
        setOpenCriticLoading(true)
        setOpenCriticError(null)

        try {
            await updateOpenCriticGame(game.id_game)

            const updatedGame = await getGame(game.id_game)
            onGameUpdated(updatedGame)
        } catch (error) {
            setOpenCriticError(error.message)
        } finally {
            setOpenCriticLoading(false)
        }
    }


    return (
        <div className="game-detail">

            <div className="game-detail-back">
                <button onClick={onBack}>← Back</button>
            </div>

            <div className="game-detail-content">

                <div className="game-detail-image">
                    <img
                        src={`http://192.168.0.54:8000/games/${game.id_game}/image`}
                        alt={game.title}
                    />
                </div>

                <div className="game-detail-info">
                    {editingGame ? (
                        <GameEditForm
                            game={game}
                            onCancel={() => setEditingGame(false)}
                            onSave={async (data) => {
                                await updateGame(game.id_game, data)

                                const updatedGame = await getGame(game.id_game)

                                setEditingGame(false)
                                onGameUpdated(updatedGame)
                            }}
                        />
                    ) : (
                        <>
                            <h1>{game.title}</h1>

                            {game.developer && (
                                <p className="game-detail-developer">
                                    <strong>Developer:</strong> {game.developer}
                                </p>
                            )}

                            {game.publisher && (
                                <p className="game-detail-publisher">
                                    <strong>Publisher:</strong> {game.publisher}
                                </p>
                            )}

                            {game.genres?.length > 0 && (

                                <div className="game-detail-genres">
                                    <strong>Genres:</strong>

                                    <div className="game-detail-genre-tags">
                                        {game.genres.map(genre => (
                                            <span key={genre.id_genre}>
                                                {genre.genre}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}


                            {game.id_opencritic != null && (
                                <div className="game-detail-score">
                                    <span>OpenCritic Score:</span>
                                    <strong>{game.opencritic_score ?? 'N/A'}</strong>



                                    {game.opencritic_updated_at && (
                                        <span>
                                            (Last update: {new Date(`${game.opencritic_updated_at}Z`).toLocaleString()})
                                        </span>
                                    )}
                                </div>
                            )}



                            <div className="game-detail-actions">
                                <button
                                    className="btn-edit"
                                    onClick={() => setEditingGame(true)}
                                >
                                    Edit
                                </button>

                                {game.id_opencritic == null ? (
                                    <button
                                        className="btn-opencritic"
                                        onClick={handleOpenCriticSearch}
                                        disabled={openCriticLoading}
                                    >
                                        Link OpenCritic
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            className="btn-opencritic"
                                            onClick={handleUpdateOpenCritic}
                                            disabled={openCriticLoading}
                                        >
                                            Update OpenCritic
                                        </button>

                                        <button
                                            className="btn-unlink"
                                            onClick={() => {
                                                setOpenCriticError(null)
                                                setShowUnlinkOpenCriticModal(true)
                                            }}
                                            disabled={openCriticLoading}
                                        >
                                            Unlink OpenCritic
                                        </button>
                                    </>
                                )}

                                <button
                                    className="btn-delete"
                                    onClick={() => setShowDeleteGameModal(true)}
                                    disabled={openCriticLoading}
                                >
                                    Delete
                                </button>
                            </div>


                            {openCriticError && !showOpenCriticModal && (
                                <p className="opencritic-error" role="alert">
                                    {openCriticError}
                                </p>
                            )}

                        </>
                    )}
                </div>

            </div>



            <div className="collection-items-header">
                {!addingCollectionItem && (
                    <button onClick={() => setAddingCollectionItem(true)}>
                        + Add Collection Item
                    </button>
                )}
            </div>

            {addingCollectionItem ? (
                <div className="collection-items">
                    <AddCollectionItemForm
                        onCancel={() => setAddingCollectionItem(false)}
                        onSave={async (data) => {
                            await createGameCollectionItem(
                                game.id_game,
                                data
                            )

                            const updatedGame = await getGame(game.id_game)

                            setAddingCollectionItem(false)

                            onGameUpdated(updatedGame)
                        }}
                    />
                </div>
            ) : game.collection_items.length === 0 ? (
                <p>No collection items.</p>
            ) : (
                <div className="collection-items">
                    {

                        game.collection_items.map(item => (
                            editingItem?.id_collection_item === item.id_collection_item ? (
                                <CollectionItemForm
                                    key={item.id_collection_item}
                                    item={item}
                                    onCancel={() => setEditingItem(null)}
                                    onSave={async (data) => {
                                        const updateData = {
                                            ...data,
                                            id_game: game.id_game,
                                            id_game_platform: item.platform.id_game_platform,

                                            purchase_date: data.purchase_date === ''
                                                ? null
                                                : data.purchase_date,

                                            starting_date: data.starting_date === ''
                                                ? null
                                                : data.starting_date,

                                            finish_date: data.finish_date === ''
                                                ? null
                                                : data.finish_date,

                                            total_hours: data.total_hours === ''
                                                ? null
                                                : Number(data.total_hours)
                                        }

                                        await updateCollectionItem(
                                            item.id_collection_item,
                                            updateData
                                        )

                                        const updatedGame = await getGame(game.id_game)

                                        setEditingItem(null)

                                        onGameUpdated(updatedGame)
                                    }}
                                />
                            ) : (
                                <article
                                    key={item.id_collection_item}
                                    className="collection-item"
                                >
                                    <div className="collection-item-header">
                                        <h3>{item.platform.name}</h3>
                                    </div>

                                    <div className="collection-item-tags">
                                        <span>{item.edition}</span>
                                        <span>{item.type}</span>
                                    </div>

                                    <div className="collection-item-dates">
                                        <div>
                                            <span>Released</span>                                            
                                            <strong>{new Date(`${item.release_date}`).toLocaleDateString()}</strong>
                                        </div>

                                        {item.purchase_date && (
                                            <div>
                                                <span>Purchased</span>
                                                <strong>{new Date(`${item.purchase_date}`).toLocaleDateString()}</strong>                                              
                                            </div>
                                        )}

                                        {(item.starting_date) && (
                                            <div>
                                                <span>Started</span>
                                                <strong>
                                                    {new Date(`${item.starting_date}`).toLocaleDateString() ?? 'Unknown'}
                                                </strong>
                                            </div>
                                        )}

                                        {(item.finish_date) && (
                                            <div>
                                                <span>Completed</span>
                                                <strong>
                                                    {new Date(`${item.finish_date}`).toLocaleDateString() ?? 'Unknown'}
                                                </strong>
                                            </div>
                                        )}
                                    </div>

                                    <div className="collection-item-footer">

                                        <div className="collection-item-status">
                                            {item.finished ? (                                                
                                                item.total_hours !== null ? (
                                                    <span className="status finished">
                                                        {item.total_hours !== null
                                                            ? `Finished in ${item.total_hours} h`
                                                            : '? Hours'}
                                                    </span>
                                                ) : (
                                                    <span className="status finished">
                                                        [Finished]
                                                    </span>
                                                )
                                            ) : (
                                                <span className="status finished">
                                                    [Not finished]
                                                </span>
                                            )}
                                        </div>

                                        <div className="collection-item-actions">
                                            <button
                                                className="btn-edit"
                                                onClick={() => setEditingItem(item)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="btn-delete"
                                                onClick={() => {
                                                    setItemToDelete(item)
                                                    setShowDeleteModal(true)
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            )
                        ))


                    }
                </div>
            )}



            {showOpenCriticModal && (
                <div className="opencritic-modal-overlay">
                    <div className="opencritic-modal">
                        <h2>Link OpenCritic</h2>

                        <p className="opencritic-modal-subtitle">
                            Select the OpenCritic game matching "{game.title}".
                        </p>

                        {openCriticLoading && (
                            <p className="opencritic-loading">Loading...</p>
                        )}

                        {openCriticError && (
                            <p className="opencritic-error" role="alert">
                                {openCriticError}
                            </p>
                        )}

                        {!selectedOpenCriticGame && !openCriticLoading && (
                            <div className="opencritic-results">
                                {openCriticResults.length === 0 ? (
                                    <p>No results found.</p>
                                ) : (
                                    openCriticResults.map(result => (
                                        <button
                                            key={result.id}
                                            className="opencritic-result"
                                            onClick={() =>
                                                handleSelectOpenCriticGame(result.id)
                                            }
                                        >
                                            {result.name}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                        {selectedOpenCriticGame && (
                            <div className="opencritic-selected-game">
                                <h3>{selectedOpenCriticGame.title}</h3>

                                <p>
                                    <strong>Developer:</strong>{' '}
                                    {selectedOpenCriticGame.developer ?? 'Unknown'}
                                </p>

                                <p>
                                    <strong>Publisher:</strong>{' '}
                                    {selectedOpenCriticGame.publisher ?? 'Unknown'}
                                </p>

                                <p>
                                    <strong>OpenCritic Score:</strong>{' '}
                                    {selectedOpenCriticGame.opencritic_score ?? 'N/A'}
                                </p>

                                <div className="opencritic-modal-actions">
                                    <button
                                        onClick={() => {
                                            setSelectedOpenCriticGame(null)
                                            setOpenCriticError(null)
                                        }}
                                        disabled={openCriticLoading}
                                    >
                                        Back
                                    </button>

                                    <button
                                        onClick={handleLinkOpenCritic}
                                        disabled={openCriticLoading}
                                    >
                                        Confirm Link
                                    </button>


                                </div>
                            </div>
                        )}

                        <div className="opencritic-modal-footer">
                            <button
                                onClick={() => {
                                    setShowOpenCriticModal(false)
                                    setSelectedOpenCriticGame(null)
                                    setOpenCriticError(null)
                                }}
                                disabled={openCriticLoading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}




            {showUnlinkOpenCriticModal && (
                <ConfirmModal
                    title="Unlink OpenCritic"
                    message={`Are you sure you want to unlink "${game.title}" from OpenCritic? The OpenCritic score and synchronization date will be cleared.`}
                    confirmText="Unlink"
                    onCancel={() => setShowUnlinkOpenCriticModal(false)}
                    onConfirm={async () => {
                        const success = await handleUnlinkOpenCritic()

                        if (success) {
                            setShowUnlinkOpenCriticModal(false)
                        }
                    }}
                />
            )}



            {showDeleteGameModal && (
                <ConfirmModal
                    title="Delete game"
                    message={`Are you sure you want to delete "${game.title}"? This will also delete all collection items associated with this game. This action cannot be undone.`}
                    onCancel={() => setShowDeleteGameModal(false)}
                    onConfirm={async () => {
                        await deleteGame(game.id_game)
                        setShowDeleteGameModal(false)
                        onBack()
                    }}
                />
            )}

            {showDeleteModal && (
                <ConfirmModal
                    title="Delete collection item"
                    message={`Are you sure you want to delete ${itemToDelete.platform.name}?`}
                    onCancel={() => {
                        setShowDeleteModal(false)
                        setItemToDelete(null)
                    }}
                    onConfirm={async () => {
                        await onDeleteCollectionItem(itemToDelete.id_collection_item)
                        setShowDeleteModal(false)
                        setItemToDelete(null)
                    }}
                />
            )}

        </div>
    )
}

export default GameDetail