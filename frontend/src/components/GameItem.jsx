import './GameItem.css'

function GameItem({ game, onClick }) {
    return (
        <article className="game-card" onClick={() => onClick(game.id_game)}>
            <div className="game-card-image">
                <img
                    src={`http://localhost:8000/games/${game.id_game}/image`}
                    alt={game.title}
                />
            </div>

            <div className="game-card-content">
                <h2>{game.title}</h2>

                <p className="game-card-developer">
                    {game.developer}
                </p>

                <p className="game-card-publisher">
                    {game.publisher}
                </p>

                <div className="game-card-score">
                    <span>OpenCritic</span>
                    <strong>{game.opencritic_score ?? 'N/A'}</strong>
                </div>
            </div>
        </article>
    )
}

export default GameItem