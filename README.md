# 🎮 Games Collection

A personal web application to manage, organize, and explore a video game collection.

The goal is to keep track of the games I own, the platforms and editions in my collection, my gaming history, and useful information about each game — all in one place.

The project is approaching its first stable release, **version 1.0**, focused on reliable collection management and OpenCritic integration. Future versions may introduce collection statistics, richer game information, and an AI assistant.

---

## ✨ Current Features

### Game management

- Browse the game collection in a visual grid with game cover artwork.
- Create, edit, view, and delete games.
- Store game details such as title, developer, publisher, genres, and OpenCritic score.
- Manage genre associations without losing existing information during metadata synchronization.
- Display a fallback image when cover artwork is unavailable.

### Collection items

- Associate one game with one or more items in the personal collection.
- Track platform, edition, and item type.
- Store release and purchase dates.
- Record start and completion dates, completion status, and playing time.
- Manage collection items independently for each platform.

### Search, filtering, and sorting

- Search games by title.
- Filter the collection by platform, genre, and completion status.
- Sort games by title, OpenCritic score, or release date.
- Combine filters to find specific games in the collection.

### OpenCritic integration

- Search OpenCritic for games and inspect a selected result before linking it.
- Link an existing game in the collection to an OpenCritic entry.
- Update linked game metadata from OpenCritic.
- Unlink a game from OpenCritic.
- Fill in developer and publisher only when those fields are empty.
- Add matching genres that already exist in the local database, without removing existing genre associations or creating genres automatically.
- Keep the OpenCritic score managed by OpenCritic rather than editable as ordinary game metadata.
- Track when OpenCritic data was last synchronized.
- Cache game cover artwork locally and replace it with the OpenCritic image during synchronization when an image is available.

OpenCritic synchronization is designed to preserve manually maintained game details while updating the fields controlled by the integration.

### Bulk collection import

- Import game lists from `.txt` files for a selected platform.
- Preview the import before making changes to the collection.
- Identify new games, existing games that can be added to another platform, games already in the collection, and duplicate entries within the file.
- Use a trailing `*` to mark games as completed.
- Import games and collection items while avoiding duplicate entries.
- Review a summary of the import results.

---

## 🏗️ Architecture

```text
┌──────────────────────┐
│        React         │
│      Frontend        │
└──────────┬───────────┘
           │
           │ REST API
           ▼
┌──────────────────────┐
│       FastAPI        │
│       Backend        │
└───────┬────────┬─────┘
        │        │
        │        └──────────► OpenCritic API
        │
        ▼
┌──────────────────────┐
│     PostgreSQL       │
│       Database       │
└──────────────────────┘
```

### Technology stack

- **Frontend:** React
- **Frontend tooling:** Vite
- **Backend:** Python + FastAPI
- **ORM:** SQLAlchemy
- **Database:** PostgreSQL
- **Database hosting:** Docker / Docker Compose
- **Database migrations:** Alembic
- **External game data:** OpenCritic
- **Version control:** Git + GitHub
- **Development hardware:** Raspberry Pi 5
- **Intended home server:** Raspberry Pi 4

---

## 🎯 Project Scope

The first stable release focuses on the features needed to maintain and explore a personal video game collection.

### Game information

Depending on the available data, a game can store:

- Title
- Developer and publisher
- Genres
- OpenCritic identifier and score
- Cover artwork
- Associated platforms and collection items

### Gaming history

Collection items can track:

- Purchase date
- Start date
- Completion date
- Completion status
- Playing time

The application distinguishes between game metadata and individual collection items, allowing a single game to be associated with multiple platforms.

---

## 🧠 Future AI Assistant

A long-term goal is to integrate an AI assistant that can understand natural-language requests and interact with the collection.

Example requests:

> "I bought GTA 6 for PS5."

> "I started Metroid Prime today."

> "Which games have I completed this year?"

> "Show me games with an OpenCritic score above 85 that I haven't played yet."

The assistant should interpret the user's intent and use explicitly defined backend operations. It should not have unrestricted access to the database or execute arbitrary SQL.

A possible architecture:

```text
User request
    │
    ▼
AI assistant
    │
    │ Selects an approved operation
    ▼
FastAPI endpoint / application service
    │
    ▼
PostgreSQL
```

This feature is part of the future roadmap and is not yet implemented.

---

## 📱 Responsive Application

The frontend is built with React and is intended to support desktop and mobile screens. Further responsive improvements and a possible Progressive Web App (PWA) remain future work.

---

## 🐳 Development Environment

Development takes place on a Raspberry Pi 5. The intended deployment target is a Raspberry Pi 4 running as an always-on home server.

PostgreSQL runs in Docker, with Docker Compose used for service configuration. Alembic manages database schema migrations.

---

## 🚧 Development Roadmap

The project is developed incrementally. The checklist below distinguishes implemented functionality from remaining work and possible future additions.

### Foundation

- [x] Create GitHub repository and configure Git
- [x] Set up React with Vite
- [x] Run PostgreSQL with Docker Compose
- [x] Design the database schema
- [x] Set up SQLAlchemy models and relationships
- [x] Set up Alembic migrations
- [x] Set up FastAPI and connect it to PostgreSQL

### Backend and API

- [x] Implement game collection and detail endpoints
- [x] Implement game creation, editing, and deletion
- [x] Implement collection item management
- [x] Include genres, platforms, and collection items in game details
- [x] Integrate OpenCritic search and game lookup
- [x] Implement OpenCritic link, update, and unlink operations
- [x] Preserve manually maintained fields during OpenCritic synchronization
- [x] Track OpenCritic synchronization timestamps
- [x] Cache game artwork locally
- [x] Implement collection import preview and import operations
- [ ] Review API validation and error handling
- [ ] Expand automated backend tests

### Frontend

- [x] Connect React to the API
- [x] Implement the game collection and detail views
- [x] Implement game editing
- [x] Implement collection item management
- [x] Integrate OpenCritic linking and synchronization into game details
- [x] Implement search, filtering, and sorting
- [x] Implement platform game import with preview and confirmation
- [x] Add confirmation and result feedback for destructive and import operations
- [ ] Complete final visual and usability review
- [ ] Verify responsive layouts on desktop and mobile

### External data and maintenance

- [x] Integrate OpenCritic metadata
- [x] Store external game identifiers
- [x] Synchronize supported metadata and scores
- [x] Retrieve and cache cover artwork
- [x] Refresh displayed cover artwork after OpenCritic linking
- [ ] Review image caching and error handling
- [ ] Evaluate additional game data sources

### Version 1.0 release

- [ ] Test the main application workflows end to end
- [ ] Verify collection creation, editing, deletion, and import
- [ ] Verify OpenCritic linking, updating, and unlinking
- [ ] Review known issues and fix any remaining release blockers
- [ ] Verify backup and recovery procedures
- [ ] Tag the stable release as `v1.0.0`

### Future versions

- [ ] Add collection statistics and visualizations
- [ ] Add game descriptions and story summaries
- [ ] Explore richer gaming history and personal notes
- [ ] Consider additional collection status options
- [ ] Evaluate Progressive Web App (PWA) support
- [ ] Add an AI assistant with controlled application operations
- [ ] Add authentication if required
- [ ] Deploy to the Raspberry Pi 4
- [ ] Configure secure remote access
- [ ] Improve automated backups and operational monitoring

Future items are ideas rather than commitments for the first stable release.

---

## 💾 Backups

GitHub stores the version-controlled source code. Database contents are not stored in the Git repository.

Database backups must be handled separately so that the actual collection data can be recovered independently of the application code.

Secrets, credentials, and machine-specific configuration should not be committed to the repository.

---

## 🧪 Development Philosophy

Build one piece at a time. Test each meaningful change and commit working milestones before moving on.

```text
Build
  ↓
Test
  ↓
Commit
  ↓
Push
  ↓
Next feature
```

Small, focused changes make it easier to identify problems and return to a known-good version.

For the first stable release, the focus shifts from adding features to testing existing functionality, fixing defects, and polishing the user experience.

---

## 📌 Current Status

**Version 1.0 — Feature development complete; final testing and polish in progress.**

The application includes a React frontend, a FastAPI backend, a PostgreSQL database, collection item management, search and filtering, bulk platform game import, and OpenCritic integration for linking games, synchronizing metadata and scores, and updating cached cover artwork.

The immediate goal is to verify the existing workflows, resolve any remaining issues, and prepare a stable first release.

Collection statistics, richer game information, the AI assistant, and additional deployment improvements remain outside the initial release scope.

---

## 🎮 Why?

Because managing a physical game collection should be easier than remembering which of the approximately seventeen copies of Resident Evil I actually own.

And because building the application is half the fun.
