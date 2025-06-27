# TVWS Geolocation App

A comprehensive TV White Space (TVWS) geolocation system for managing and querying UHF channel availability across Nigerian states and locations.

## Features

### Frontend (React + TypeScript)

- 🔐 **Authentication System** - Role-based access (Admin/User)
- 🗺️ **Interactive Query Interface** - State/location selection with real-time results
- 📊 **Data Visualization** - Charts, maps, and color-coded channel status
- 👨‍💼 **Admin Panel** - Upload measurements, manage states/locations
- 📱 **Responsive Design** - Mobile-first with Tailwind CSS
- 📈 **Export Functionality** - CSV export of query results

### Backend (FastAPI + MongoDB)

- 🚀 **RESTful API** - Complete CRUD operations
- 🔒 **JWT Authentication** - Secure token-based auth
- 📊 **Real-time Processing** - Signal strength analysis (-97 dBm threshold)
- 🗄️ **MongoDB Integration** - Scalable data storage
- 📝 **Data Validation** - Pydantic models with type checking
- 🌐 **CORS Support** - Cross-origin resource sharing

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- MongoDB 4.4+

### Installation

1. **Clone and setup frontend:**

```bash
npm install
npm run dev
```

2. **Setup backend:**

```bash
cd backend
pip install -r requirements.txt
python main.py   # Starts the FastAPI server
```

### Default Credentials

- **Admin:** admin@tvws.ng / admin123
- **User:** user@tvws.ng / user123

## API Endpoints

### Authentication

- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Data Management

- `GET /states` - List all states
- `POST /states` - Create new state (admin)
- `GET /locations/{state}` - Get locations by state
- `POST /locations` - Create new location (admin)

### TVWS Operations

- `POST /query-tvws` - Query channel availability
- `POST /upload-measurements` - Upload signal measurements (admin)

## Database Schema

### States Collection

```json
{
  "_id": "ObjectId",
  "name": "Edo"
}
```

### Locations Collection

```json
{
  "_id": "ObjectId",
  "state": "Edo",
  "name": "Benin",
  "coordinates": { "lat": 6.33918, "lon": 5.61744 }
}
```

### Measurements Collection

```json
{
  "_id": "ObjectId",
  "state": "Edo",
  "location": "Benin",
  "timestamp": "2025-01-20T14:30:00Z",
  "readings": [
    {
      "channel": 55,
      "frequency_mhz": 743.25,
      "signal_strength_dbm": -84,
      "status": "occupied"
    }
  ]
}
```

## Technical Specifications

### UHF TV Channels

- **Frequency Range:** 470-870 MHz
- **Channels:** 21-69
- **Bandwidth:** 8 MHz per channel
- **Threshold:** < -97 dBm = Free, ≥ -97 dBm = Occupied

### Sample States & Locations

- **Edo:** Benin, Auchi, Ogbona
- **Lagos:** Ikeja, Yaba, Ikorodu
- **Enugu:** Nsukka, Enugu North, Abakpa
- **Kano:** Kano Metropolitan, Wudil, Gwarzo
- **Rivers:** Port Harcourt, Obio-Akpor, Eleme

## Development

### Frontend Development

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run lint    # Run ESLint
```

### Backend Development

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Environment Variables

```env
# Backend
MONGODB_URL=mongodb://localhost:27017
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256

# Frontend
VITE_API_BASE_URL=http://localhost:8000
```

## Architecture

```
Frontend (React/TypeScript)
    ↓ HTTP/REST API
Backend (FastAPI/Python)
    ↓ Motor (Async Driver)
Database (MongoDB)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For support and questions:

- Create an issue on GitHub
- Email: ahuekweprinceugo@gmail.com
- Documentation: [API Docs](https://tvws-geolocation-api.onrender.com/docs)
