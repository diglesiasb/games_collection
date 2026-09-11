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
    getGame
} from '../services/gamesApi'

function GameDetail({ game, onBack, onDeleteCollectionItem, onGameUpdated }) {

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showDeleteGameModal, setShowDeleteGameModal] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)
    const [editingGame, setEditingGame] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [addingCollectionItem, setAddingCollectionItem] = useState(false)

    return (
        <div className="game-detail">

            <div className="game-detail-back">
                <button onClick={onBack}>← Back</button>
            </div>

            <div className="game-detail-content">

                <div className="game-detail-image">
                    <img
                        src={`http://localhost:8000/games/${game.id_game}/image`}
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

                            <p className="game-detail-developer">
                                <strong>Developer:</strong> {game.developer}
                            </p>

                            <p className="game-detail-publisher">
                                <strong>Publisher:</strong> {game.publisher}
                            </p>

                            <div className="game-detail-score">
                                <span>OpenCritic Score:</span>
                                <strong>{game.opencritic_score ?? 'N/A'}</strong>
                            </div>

                            <div className="game-detail-actions">
                                <button onClick={() => setEditingGame(true)}>
                                    Edit
                                </button>

                                <button onClick={() => setShowDeleteGameModal(true)}>
                                    Delete
                                </button>
                            </div>
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
                                            <strong>{item.release_date}</strong>
                                        </div>

                                        {item.purchase_date && (
                                            <div>
                                                <span>Purchased</span>
                                                <strong>{item.purchase_date}</strong>
                                            </div>
                                        )}

                                        {(item.starting_date || item.finished) && (
                                            <div>
                                                <span>Started</span>
                                                <strong>
                                                    {item.starting_date ?? 'Unknown'}
                                                </strong>
                                            </div>
                                        )}

                                        {(item.finish_date || item.finished) && (
                                            <div>
                                                <span>Completed</span>
                                                <strong>
                                                    {item.finish_date ?? 'Unknown'}
                                                </strong>
                                            </div>
                                        )}
                                    </div>

                                    <div className="collection-item-footer">

                                        <div className="collection-item-status">
                                            {item.finished ? (
                                                item.starting_date ||
                                                    item.finish_date ||
                                                    item.total_hours !== null ? (
                                                    <span className="status finished">
                                                        {item.total_hours !== null
                                                            ? `${item.total_hours} h`
                                                            : '? Hours'}
                                                    </span>
                                                ) : (
                                                    <span className="status finished">
                                                        Finished
                                                    </span>
                                                )
                                            ) : (
                                                <span className="status">
                                                    Not finished
                                                </span>
                                            )}
                                        </div>

                                        <div className="collection-item-actions">
                                            <button
                                                onClick={() => setEditingItem(item)}
                                            >
                                                Edit
                                            </button>

                                            <button
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