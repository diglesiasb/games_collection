import GameItem from './GameItem'

import './GameList.css'

function GameList({ games, onGameClick  }) {
    return (
        <div className="game-list">
            {games.map(game => (
                <GameItem
                    key={game.id_game}
                    game={game}
                    onClick={onGameClick}
                />
            ))}
        </div>
    )
}

export { GameList as default }