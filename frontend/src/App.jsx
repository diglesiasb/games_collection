import { useEffect, useState } from 'react'

import { getGames, getGame, deleteCollectionItem } from './services/gamesApi'

import GameItem from './components/GameItem'
import GameList from './components/GameList'
import GameDetail from './components/GameDetail'
import AddGame from './components/AddGame'

function App() {
  const [games, setGames] = useState([])
  const [selectedGame, setSelectedGame] = useState(null)
  const [addingGame, setAddingGame] = useState(false)

  const handleBack = async () => {
    const data = await getGames()
    setGames(data)
    setSelectedGame(null)
  }

  const handleGameClick = async (idGame) => {
    const game = await getGame(idGame)
    setSelectedGame(game)
  }

  const handleDeleteCollectionItem = async (idCollectionItem) => {
    await deleteCollectionItem(idCollectionItem)

    if (selectedGame) {
      const updatedGame = await getGame(selectedGame.id_game)
      setSelectedGame(updatedGame)
    }
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

      {!selectedGame && !addingGame && (
        <button onClick={() => setAddingGame(true)}>
          + Add Game
        </button>
      )}

      {addingGame ? (
        <AddGame
          onBack={() => setAddingGame(false)}
        />
      ) : selectedGame ? (
        <GameDetail
          game={selectedGame}
          onBack={handleBack}
          onDeleteCollectionItem={handleDeleteCollectionItem}
          onGameUpdated={setSelectedGame}
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