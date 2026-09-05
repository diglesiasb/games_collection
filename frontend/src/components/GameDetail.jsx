import './GameDetail.css'

function GameDetail({ game, onBack }) {
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
                    <h1>{game.title}</h1>

                    <p className="game-detail-developer">
                        <strong>Developer:</strong> {game.developer}
                    </p>

                    <p className="game-detail-publisher">
                        <strong>Publisher:</strong> {game.publisher}
                    </p>

                    <div className="game-detail-score">
                        <span>OpenCritic</span>
                        <strong>{game.opencritic_score ?? 'N/A'}</strong>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default GameDetail