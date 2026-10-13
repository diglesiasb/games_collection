import { useState } from 'react'
import './GameItem.css'

function GameItem({ game, onClick }) {
    const [imageError, setImageError] = useState(false)

    const finished = game.collection_items.some(
        item => item.finished
    )

    return (
        <article
            className="game-card"
            onClick={() => onClick(game.id_game)}
        >
            <div className="game-card-image">
                {!imageError ? (
                    <img
                        src={`http://192.168.0.54:8000/games/${game.id_game}/image`}
                        alt={game.title}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="game-card-placeholder">

                        <svg
                            viewBox="0 0 100 100"
                            aria-hidden="true"
                        >
                            {/* Halo pixelado de fondo
                            <path
                                d="M20 18h8v8h-8z M72 12h6v6h-6z M78 70h8v8h-8z M14 66h6v6h-6z"
                                fill="#52677d"
                                opacity="0.65"
                            /> */}

                            {/* Cuerpo de la máquina arcade */}
                            <path
                                d="M30 15h40l8 9v48l-8 9H30l-8-9V24z"
                                fill="#303944"
                                stroke="#596575"
                                strokeWidth="2"
                                strokeLinejoin="round"
                            />

                            {/* Pantalla */}
                            <path
                                d="M32 27h36v28H32z"
                                fill="#111820"
                                stroke="#64768a"
                                strokeWidth="2"
                            />

                            {/* Estrellas pixeladas */}
                            <path
                                d="M39 33h4v4h-4z M59 31h4v4h-4z M62 45h3v3h-3z"
                                fill="#a9c6e8"
                            />

                            {/* Nave pixel art */}
                            <path
                                d="M47 32h6v5h5v6h-5v5h-6v-5h-5v-6h5z"
                                fill="#55b8ff"
                            />
                            <path
                                d="M49 29h2v3h-2z M49 48h2v4h-2z"
                                fill="#8bd4ff"
                            />

                            {/* Panel de control */}
                            <path
                                d="M32 62h36v8H32z"
                                fill="#202832"
                                stroke="#596575"
                                strokeWidth="1.5"
                            />

                            {/* Joystick */}
                            <path
                                d="M39 59v7"
                                stroke="#8d9bab"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                            <circle cx="39" cy="57" r="3" fill="#55b8ff" />

                            {/* Botones */}
                            <circle cx="57" cy="66" r="2.5" fill="#55b8ff" />
                            <circle cx="64" cy="66" r="2.5" fill="#7c8796" />

                            {/* Ranura inferior */}
                            <path
                                d="M43 74h14"
                                stroke="#657589"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                )}

                {finished && (
                    <div className="game-card-finished"></div>
                )}

                {game.opencritic_score != null && (
                    <div className="game-card-score">
                        {game.opencritic_score}
                    </div>
                )}
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