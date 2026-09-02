# 🎮 Games Collection

A personal web application to manage and explore a video game collection.

The goal is simple: keep track of the games I own, what I am currently playing, what I have completed, and all the information surrounding my collection.

The interesting part? **I want to be able to manage the collection using natural language and AI.**

---

## 🤖 AI Assistant

The long-term goal is to have an AI assistant integrated into the application that can understand natural language and interact with the collection.

For example:

> **"I bought GTA 6 for PS5."**

The assistant should be able to identify the game, retrieve additional information and add it to the collection.

Or:

> **"I started GTA 6 today."**

It should automatically register the start date.

And:

> **"I finished GTA 6 yesterday."**

It should mark the game as completed and store the completion date.

The assistant should also be able to answer questions about the collection:

> **"What PS5 games do I still have to play?"**

> **"Which games have I completed this year?"**

> **"Show me games I own with an OpenCritic score above 85 that I haven't played yet."**

The objective is not simply to add a chatbot to the application. The AI should be able to **understand the user's intent and interact with the application's data through controlled operations.**

---

## 🏗️ Architecture

The application is being built progressively using:

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
        │        │ External APIs / AI
        │        ▼
        │   ┌───────────┐
        │   │    AI     │
        │   └───────────┘
        │
        ▼
┌──────────────────────┐
│     PostgreSQL       │
│       Database       │
└──────────────────────┘
```

### Technologies

* **Frontend:** React
* **Backend:** Python + FastAPI
* **Database:** PostgreSQL
* **Database hosting:** Docker
* **Version control:** Git + GitHub
* **Game information:** External game APIs
* **AI:** LLM with tool/function calling
* **Development:** Raspberry Pi 5
* **Production server:** Raspberry Pi 4

---

## 🎯 Project Goals

### Collection management

* Add games to the collection
* Edit game information
* Remove games
* Search and filter games
* Organize games by platform
* Track physical copies
* Track game status

### Game information

Store information such as:

* Title
* Platform
* Release date
* Developer
* Publisher
* Genre
* Critical score
* Cover artwork
* Purchase date
* Physical condition
* Notes

### Gaming history

Track:

* Start date
* Completion date
* Current status
* Playing time
* Personal notes

Possible statuses:

```text
Backlog
Playing
Completed
Dropped
On Hold
```

---

## 📱 Responsive Web Application

The application will be designed to work on both desktop and mobile devices.

The intention is to have a single responsive application that can be comfortably used from:

* Desktop
* Laptop
* Tablet
* Smartphone

A Progressive Web App (PWA) may be added later.

---

## 🧠 AI Architecture

The AI will not directly manipulate the database.

Instead, the backend will expose controlled operations such as:

```text
add_game()
update_game()
start_game()
complete_game()
search_games()
get_collection_stats()
```

The AI interprets the user's request and decides which operation is appropriate.

For example:

```text
User
  │
  │ "I started Metroid Prime today"
  ▼
AI
  │
  │ start_game(
  │   game="Metroid Prime",
  │   date="2026-09-01"
  │ )
  ▼
FastAPI
  │
  ▼
PostgreSQL
```

This keeps database access under the application's control instead of allowing the AI to generate arbitrary SQL commands.

---

## 🐳 Development Environment

The project is being developed on a Raspberry Pi 5.

The application is intended to eventually run on a Raspberry Pi 4 as a small always-on home server.

Docker will be used for services such as PostgreSQL and, where appropriate, other application components.

---

## 🚧 Development Roadmap

The project will be developed incrementally.

* [x] Create GitHub repository
* [x] Set up React
* [x] Set up Git
* [x] Connect project to GitHub
* [x] Set up PostgreSQL with Docker Compose
* [x] Design database schema
* [ ] Create FastAPI backend
* [ ] Connect FastAPI to PostgreSQL
* [ ] Create `GET /api/games`
* [ ] Connect React to the API
* [ ] Implement game CRUD
* [ ] Implement responsive UI
* [ ] Integrate external game information API
* [ ] Add game search
* [ ] Add AI assistant
* [ ] Implement AI tool/function calling
* [ ] Add authentication
* [ ] Deploy to Raspberry Pi 4
* [ ] Add remote access
* [ ] Add automated database backups

---

## 💾 Backups

GitHub is used to keep the source code safely backed up.

Application code and configuration are version controlled with Git.

Database data is **not** stored in the Git repository.

Database backups will be implemented separately to protect the actual collection data.

---

## 🧪 Development Philosophy

Build it one piece at a time.

Each major working milestone should be committed and pushed to GitHub.

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

If something inevitably explodes, we can return to the last known-good version.

Because apparently remembering the missing semicolon is not considered a valid backup strategy.

---

## 📌 Current Status

**Early development**

The project currently contains the initial React frontend and the basic project structure.

The next milestone is to introduce PostgreSQL and build the first FastAPI endpoint that retrieves games from the database.

---

## 🎮 Why?

Because managing a physical game collection should be easier than remembering which of the approximately seventeen copies of Resident Evil I actually own.

And because building the application is half the fun.
