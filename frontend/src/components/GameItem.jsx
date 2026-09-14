import './GameItem.css'

function GameItem({ game, onClick }) {
    
    const finished = game.collection_items.some(
        item => item.finished
    )

    return (
        <article
            className="game-card"
            onClick={() => onClick(game.id_game)}
        >
            <div className="game-card-image">
                <img
                    src={`http://192.168.0.54:8000/games/${game.id_game}/image`}
                    alt={game.title}
                />

                {finished && (
                    <div className="game-card-finished"></div>
                )}

                <div className="game-card-score">
                    {game.opencritic_score ?? 'N/A'}
                </div>
            </div>

            <div className="game-card-content">
                <h2>{game.title}</h2>

                <p className="game-card-developer">
                    {game.developer}
                </p>

                <div className="game-card-platforms">
                    {game.platforms.map(platform => (
                        <span key={platform.id_game_platform}>
                            {platform.name}
                        </span>
                    ))}
                </div>
            </div>
        </article>
    )
}

export default GameItem