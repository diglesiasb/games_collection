# 🎮 Games Collection

A personal web application to manage, organize, and explore a video game collection.

The goal is to keep track of the games I own, the platforms and editions in my collection, my gaming history, and useful information about each game — all in one place.

The project is being built incrementally, with a long-term goal of adding an AI assistant that can understand natural-language requests and interact with the collection through controlled application operations.

---

## ✨ Current Features

### Game management

- Browse the game collection.
- Create, edit, view, and delete games.
- Store game details such as title, developer, publisher, genres, and OpenCritic score.
- Manage genre associations without losing existing information during metadata synchronization.

### Collection items

- Associate one game with one or more items in the personal collection.
- Track platform, edition, and item type.
- Store release and purchase dates.
- Record start and completion dates, completion status, and playing time.

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

## 🎯 Project Goals

### Collection management

- Manage games and their associated collection items.
- Organize owned games by platform, edition, and type.
- Search and filter the collection.
- Keep game metadata editable while respecting fields managed by external services.

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

Possible future additions include personal notes, richer status tracking, and collection statistics.

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

The frontend is built with React and is intended to support desktop and mobile screens. Responsive improvements and a possible Progressive Web App (PWA) remain future work.

---

## 🐳 Development Environment

Development takes place on a Raspberry Pi 5. The intended deployment target is a Raspberry Pi 4 running as an always-on home server.

PostgreSQL runs in Docker, with Docker Compose used for service configuration. Alembic manages database schema migrations.

---

## 🚧 Development Roadmap

The project is developed incrementally. The checklist below distinguishes existing functionality from planned work.

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
- [ ] Review and expand API validation, error handling, and automated tests

### Frontend

- [x] Connect React to the API
- [x] Implement the game collection and detail views
- [x] Implement game editing
- [x] Implement collection item management
- [x] Integrate OpenCritic linking and synchronization into game details
- [ ] Refine the visual design and interaction feedback
- [ ] Improve responsive layouts
- [ ] Add search and filtering improvements

### External data and maintenance

- [x] Integrate OpenCritic metadata
- [x] Store external game identifiers
- [x] Synchronize supported metadata and scores
- [x] Retrieve and cache cover artwork
- [ ] Improve cache maintenance and image error handling
- [ ] Add collection import and bulk metadata lookup
- [ ] Evaluate additional game data sources

### AI assistant

- [ ] Add an AI assistant
- [ ] Implement tool/function calling
- [ ] Define controlled game and collection operations
- [ ] Support natural-language collection queries

### Security, deployment, and reliability

- [ ] Add authentication
- [ ] Deploy to the Raspberry Pi 4
- [ ] Configure secure remote access
- [ ] Implement automated database backups
- [ ] Add automated tests and operational monitoring

### Future improvements

- [ ] Add collection statistics and advanced filters
- [ ] Improve gaming history and personal notes
- [ ] Evaluate PWA support

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

---

## 📌 Current Status

**Active development — core collection management and OpenCritic integration implemented.**

The application has a React frontend, a FastAPI backend, a PostgreSQL database, collection item management, and OpenCritic integration for linking games, synchronizing metadata and scores, and updating cached cover artwork.

The next focus is to refine the interface and continue improving reliability. The AI assistant, authentication, deployment hardening, and automated database backups remain future milestones.

---

## 🎮 Why?

Because managing a physical game collection should be easier than remembering which of the approximately seventeen copies of Resident Evil I actually own.

And because building the application is half the fun.
