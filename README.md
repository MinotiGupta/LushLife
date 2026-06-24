# 🌿 LushLife

**LushLife** is a full-stack salon discovery and booking platform for Hyderabad. It lets users find, explore, and book appointments at curated salons — guided by an AI-powered quiz and a smart chatbot that recommends the best match for their hair type, occasion, and budget.

---

## ✨ Features

- **AI-Powered Salon Matching** — A 4-step quiz (hair type → occasion → budget → locality) scores and ranks salons using a weighted algorithm, surfacing the best fit with a personalized match reason.
- **Smart Chatbot** — An in-app assistant answers natural-language questions about services, pricing, timings, and availability, both globally and per-salon.
- **Salon Discovery** — Browse and filter salons by category, locality, and price band across popular Hyderabad neighbourhoods.
- **Detailed Salon Profiles** — View services, pricing, stylist profiles, customer sentiment, ratings, and hours.
- **Booking Flow** — Select a service, stylist, and time slot; receive instant booking confirmation.
- **Owner Dashboard** — A separate view for salon owners to manage their listing and bookings.
- **User Profiles** — Authenticated users can view their booking history and manage their account.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite 8 | UI framework & dev server |
| React Router DOM v7 | Client-side routing |
| TanStack Query v5 | Server state & data fetching |
| shadcn/ui + Radix UI | Accessible component primitives |
| Tailwind CSS v4 | Utility-first styling |
| Geist Variable Font | Typography |
| Lucide React | Icon library |
| Sonner | Toast notifications |
| Zod | Runtime schema validation |
| canvas-confetti | Booking confirmation animation |

### Backend
| Technology | Purpose |
|---|---|
| Python + FastAPI | REST API server |
| Motor (AsyncIO) | Asynchronous MongoDB driver |
| MongoDB | NoSQL database |
| Uvicorn | ASGI server |
| Google Gemini / Ollama | LLM integration for AI Match Chatbot |

---

## 📁 Project Structure

```
LushLife/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # MongoDB connection setup
│   ├── models.py            # Pydantic models for data validation
│   ├── seed.py              # Database seeding scripts
│   ├── fetch_salons_osm.py  # Script to fetch real salons from OpenStreetMap
│   ├── routers/             # API endpoint definitions (salons, bookings, owner, ai)
│   └── requirements.txt     # Python dependencies
│
├── src/
│   ├── ai/
│   │   └── matchSalons.js   # AI quiz logic, scoring algorithm & chatbot responses
│   ├── components/
│   │   ├── home/            # Homepage-specific components
│   │   ├── layout/          # Navbar, Footer
│   │   ├── search/          # Search filters and result cards
│   │   └── ui/              # Reusable shadcn/ui components
│   ├── context/
│   │   └── AuthContext.jsx  # Global authentication state
│   ├── data/
│   │   ├── salons.js        # Salon seed data (services, pricing, tags, stylists)
│   │   └── bookings.js      # Mock bookings data
│   ├── pages/
│   │   ├── LandingPage.jsx  # Root landing page (/)
│   │   ├── HomePage.jsx     # Post-auth home (/home)
│   │   ├── SearchPage.jsx   # Salon search & filter (/search)
│   │   ├── SalonProfilePage.jsx  # Individual salon view (/salon/:id)
│   │   ├── BookingPage.jsx  # Booking flow (/booking/:id)
│   │   ├── OwnerDashboard.jsx    # Salon owner portal (/dashboard)
│   │   ├── ProfilePage.jsx  # User profile & history (/profile)
│   │   └── AIChatbotPage.jsx     # AI Match Chatbot (/ai-match)
│   ├── App.jsx              # Root component with routing
│   └── index.css            # Global styles & design tokens
│
├── .env                     # Frontend environment variables (VITE_GEMINI_API_KEY)
├── index.html
├── vite.config.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- **Python** 3.10+

---

### Frontend Setup

```bash
# Install dependencies
npm install

# Start the development server (runs on http://localhost:5173)
npm run dev
```

Other scripts:
```bash
npm run build    # Production build
npm run preview  # Preview the production build
npm run lint     # Run ESLint
```

---

### Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Setup Environment Variables
# Create a .env file inside the `backend` folder and add:
# MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/

# Start the FastAPI server (runs on http://localhost:8000)
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`. You can view auto-generated docs at `http://localhost:8000/docs`.

> **Note:** The frontend Vite dev server is pre-configured with CORS to communicate with the backend on port `8000`.

---

## 🔗 Routes

| Path | Page | Description |
|---|---|---|
| `/` | Landing Page | Hero, auth entry point |
| `/home` | Home | Personalised feed post-login |
| `/search` | Search | Browse & filter all salons |
| `/salon/:id` | Salon Profile | Full salon detail + reviews |
| `/booking/:id` | Booking | Service & time slot selection |
| `/dashboard` | Owner Dashboard | Salon owner management view |
| `/profile` | Profile | User account & booking history |
| `/ai-match` | AI Match | Chatbot interface connected to Gemini/Ollama |

---

## 📄 License

This project is private and not currently licensed for public distribution.
