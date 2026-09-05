import { useEffect, useState } from 'react'

import { getGames, getGame } from './services/gamesApi'

import GameItem from './components/GameItem'
import GameList from './components/GameList'
import GameDetail from './components/GameDetail'

function App() {
  const [games, setGames] = useState([])
  const [selectedGame, setSelectedGame] = useState(null)

  const handleGameClick = async (idGame) => {
    const game = await getGame(idGame)
    setSelectedGame(game)
  }

  useEffect(() => {
    getGames()
      .then(data => {
        console.log('GAMES:', data)
        setGames(data)
      })
  }, [])

  return (
    <main className="app">
      <h1>Games Collection</h1>

      {selectedGame ? (
        <GameDetail
          game={selectedGame}
          onBack={() => setSelectedGame(null)}
        />
      ) : (
        <GameList
          games={games}
          onGameClick={handleGameClick}
        />
      )}
    </main>
  )
}



export default App