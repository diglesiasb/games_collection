const API_URL = 'http://localhost:8000'

export async function getGames() {
  const response = await fetch(`${API_URL}/games`)

  if (!response.ok) {
    throw new Error('Error loading games')
  }

  return await response.json()
}

export async function getGame(idGame) {
  const response = await fetch(`${API_URL}/games/${idGame}`)

  if (!response.ok) {
    throw new Error('Error loading game')
  }

  return await response.json()
}