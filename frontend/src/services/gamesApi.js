const API_URL = "http://192.168.0.54:8000";

//#region Games

export async function getGames() {
  const response = await fetch(`${API_URL}/games`);

  if (!response.ok) {
    throw new Error("Error loading games");
  }

  return await response.json();
}

/**
 * @param {number} idGame
 */
export async function getGame(idGame) {
  const response = await fetch(`${API_URL}/games/${idGame}`);

  if (!response.ok) {
    throw new Error("Error loading game");
  }

  return await response.json();
}

export async function updateGame(idGame, data) {
  const response = await fetch(`${API_URL}/games/${idGame}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("API ERROR:", error);

    throw new Error(
      error.detail?.[0]?.msg ?? error.detail ?? "Error updating game",
    );
  }

  return await response.json();
}

export async function deleteGame(idGame) {
  const response = await fetch(`${API_URL}/games/${idGame}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail?.[0]?.msg ?? error.detail ?? "Error deleting game",
    );
  }
}

export async function createGameCollectionItem(idGame, data) {
  const response = await fetch(`${API_URL}/games/${idGame}/collection-items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail?.[0]?.msg ?? error.detail ?? "Error adding collection item",
    );
  }

  return await response.json();
}

//#endregion

//#region Collection

export async function createCollection(data) {
  const response = await fetch(`${API_URL}/collection`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.detail?.[0]?.msg ?? "Error creating game");
  }

  return await response.json();
}

//#endregion

//#region Collection Items

export async function deleteCollectionItem(idCollectionItem) {
  const response = await fetch(
    `${API_URL}/collection-items/${idCollectionItem}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("Error deleting collection item");
  }
}

export async function updateCollectionItem(idCollectionItem, data) {
  const response = await fetch(
    `${API_URL}/collection-items/${idCollectionItem}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const error = await response.json();

    console.error("API ERROR:", error);

    throw new Error(error.detail?.[0]?.msg ?? "Error updating collection item");
  }

  return await response.json();
}

//#endregion

//#region Administration

export async function getGenres() {
    const response = await fetch(`${API_URL}/genres`)

    if (!response.ok) {
        throw new Error('Error loading genres')
    }

    return response.json()
}

export async function createGenre(genre) {
    const response = await fetch(`${API_URL}/genres`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            genre: genre
        })
    })

    if (!response.ok) {
        throw new Error('Error creating genre')
    }

    return response.json()
}


export async function updateGenre(id, genre) {
    const response = await fetch(`${API_URL}/genres/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            genre: genre
        })
    })

    if (!response.ok) {
        throw new Error('Error updating genre')
    }

    return response.json()
}


export async function deleteGenre(id) {
    const response = await fetch(`${API_URL}/genres/${id}`, {
        method: 'DELETE'
    })

    if (!response.ok) {
        throw new Error('Error deleting genre')
    }

    return response.json()
}


export async function getPlatforms() {
  const response = await fetch(`${API_URL}/platforms`);

  if (!response.ok) {
    throw new Error("Error loading platforms");
  }

  return await response.json();
}

export async function deletePlatform(id) {
    const response = await fetch(`${API_URL}/platforms/${id}`, {
        method: 'DELETE'
    })

    if (!response.ok) {
        throw new Error('Error deleting game platform')
    }

    return response.json()
}

export async function createPlatform(name, releaseDate, purchaseDate) {
    const response = await fetch(`${API_URL}/platforms`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            release_date: releaseDate,
            purchase_date: purchaseDate || null
        })
    })

    if (!response.ok) {
        throw new Error('Error creating platform')
    }

    return response.json()
}

export async function updatePlatform(id, name, releaseDate, purchaseDate) {
    const response = await fetch(`${API_URL}/platforms/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            release_date: releaseDate,
            purchase_date: purchaseDate || null
        })
    })

    if (!response.ok) {
        throw new Error('Error updating platform')
    }

    return response.json()
}

//#endregion

//#region OpenCritic

export async function searchOpenCriticGames(criteria) {
  const response = await fetch(
    `${API_URL}/opencritic/games/search?criteria=${encodeURIComponent(criteria)}`
  );

  if (!response.ok) {
    throw new Error("Error searching OpenCritic games");
  }

  return await response.json();
}

//#endregion


