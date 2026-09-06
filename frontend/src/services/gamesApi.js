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

export async function deleteCollectionItem(idCollectionItem) {
  const response = await fetch(
    `${API_URL}/collection-items/${idCollectionItem}`,
    {
      method: 'DELETE'
    }
  )

  if (!response.ok) {
    throw new Error('Error deleting collection item')
  }
}

export async function updateCollectionItem(idCollectionItem, data) {
  const response = await fetch(
    `${API_URL}/collection-items/${idCollectionItem}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  )

  if (!response.ok) {
    const error = await response.json()

    console.error('API ERROR:', error)

    throw new Error(
      error.detail?.[0]?.msg ?? 'Error updating collection item'
    )
  }

  return await response.json()
}