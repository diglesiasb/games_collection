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
  const [showFilters, setShowFilters] = useState(false)

  const [search, setSearch] = useState('')

  const [platformFilter, setPlatformFilter] = useState([])
  const [genreFilter, setGenreFilter] = useState([])
  const [statusFilter, setStatusFilter] = useState([])

  const [sortBy, setSortBy] = useState('title')
  const [sortDirection, setSortDirection] = useState('asc')

  const clearFilters = () => {
    setSearch('')
    setPlatformFilter([])
    setGenreFilter([])
    setStatusFilter([])
  }

  const togglePlatformFilter = (platform) => {
    setPlatformFilter(current =>
      current.includes(platform)
        ? current.filter(item => item !== platform)
        : [...current, platform]
    )
  }

  const toggleGenreFilter = (genre) => {
    setGenreFilter(current =>
      current.includes(genre)
        ? current.filter(item => item !== genre)
        : [...current, genre]
    )
  }

  const toggleStatusFilter = (status) => {
    setStatusFilter(current =>
      current.includes(status)
        ? current.filter(item => item !== status)
        : [...current, status]
    )
  }

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

  const handleGameCreated = async () => {
    const data = await getGames()
    setGames(data)
    setAddingGame(false)
  }

  useEffect(() => {
    getGames()
      .then(data => {
        console.log('GAMES:', data)
        setGames(data)
      })
  }, [])

  const platforms = [...new Set(
    games.flatMap(game =>
      game.platforms.map(platform => platform.name)
    )
  )]

  const genres = [...new Set(
    games.flatMap(game =>
      game.genres.map(genre => genre.genre)
    )
  )]

  const filteredGames = games.filter(game => {
    const matchesSearch =
      game.title.toLowerCase().includes(search.toLowerCase())

    const matchesPlatform =
      platformFilter.length === 0 ||
      game.platforms.some(platform =>
        platformFilter.includes(platform.name)
      )

    const matchesGenre =
      genreFilter.length === 0 ||
      game.genres.some(genre =>
        genreFilter.includes(genre.genre)
      )

    const finished = game.collection_items.some(
      item => item.finished
    )

    const matchesStatus =
      statusFilter.length === 0 ||
      (statusFilter.includes('Finished') && finished) ||
      (statusFilter.includes('Unfinished') && !finished)

    return (
      matchesSearch &&
      matchesPlatform &&
      matchesGenre &&
      matchesStatus
    )
  })

  const visibleGames = [...filteredGames].sort((a, b) => {
    let comparison = 0

    if (sortBy === 'title') {
      comparison = a.title.localeCompare(
        b.title,
        undefined,
        { sensitivity: 'base' }
      )
    }

    if (sortBy === 'score') {
      const scoreA = a.opencritic_score ?? -1
      const scoreB = b.opencritic_score ?? -1

      comparison = scoreA - scoreB
    }

    if (sortBy === 'release_date') {
      const dateA = a.collection_items
        .map(item => item.release_date)
        .sort()[0] ?? ''

      const dateB = b.collection_items
        .map(item => item.release_date)
        .sort()[0] ?? ''

      comparison = dateA.localeCompare(dateB)
    }

    return sortDirection === 'asc'
      ? comparison
      : -comparison
  })

  const hasActiveFilters =
    search !== '' ||
    platformFilter.length > 0 ||
    genreFilter.length > 0 ||
    statusFilter.length > 0

  return (
    <main className="app">
      <div className="app-header">
        <h1>Games Collection</h1>

        {!selectedGame && !addingGame && (
          <div className="app-actions">
            <button
              className="app-addGame"
              onClick={() => setAddingGame(true)}
            >
              + Add Game
            </button>

            <button
              className="app-filter"
              onClick={() => setShowFilters(!showFilters)}
            >
              🔍 Search / Filter / Sort
            </button>
          </div>
        )}
      </div>

      {showFilters && !selectedGame && !addingGame && (
        <div className="game-filters">
          <input
            type="text"
            placeholder="Search games..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="game-filter-group">
            <div className="game-filter-options">
              {platforms.map(platform => (
                <button
                  key={platform}
                  className={
                    platformFilter.includes(platform)
                      ? 'selected'
                      : ''
                  }
                  onClick={() => togglePlatformFilter(platform)}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          <div className="game-filter-group">
            <div className="game-filter-options">
              {genres.map(genre => (
                <button
                  key={genre}
                  className={
                    genreFilter.includes(genre)
                      ? 'selected'
                      : ''
                  }
                  onClick={() => toggleGenreFilter(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div className="game-filter-group">
            <div className="game-filter-options">
              {['Finished', 'Unfinished'].map(status => (
                <button
                  key={status}
                  className={
                    statusFilter.includes(status)
                      ? 'selected'
                      : ''
                  }
                  onClick={() => toggleStatusFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <div className="game-filter-clear">
              <button onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}

          <div className="game-filter-group">
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="title">Title</option>
              <option value="score">OpenCritic Score</option>
              <option value="release_date">Release Date</option>
            </select>

            <select
              value={sortDirection}
              onChange={e => setSortDirection(e.target.value)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

        </div>
      )}

      {!selectedGame && !addingGame && (
        <p className="game-count">
          {visibleGames.length === 0
            ? 'No games found'
            : `${visibleGames.length} ${visibleGames.length === 1 ? 'Game' : 'Games'}`
          }
        </p>
      )}

      {addingGame ? (
        <AddGame
          onBack={() => setAddingGame(false)}
          onGameCreated={handleGameCreated}
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
          games={visibleGames}
          onGameClick={handleGameClick}
        />
      )}
    </main>
  )
}



export default App