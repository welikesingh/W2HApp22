# HepatoScan AI

A full-stack medical imaging analysis application using Django Admin for the backend and React for the frontend. The app uses Google's Gemini AI to analyze liver scans and general medical images, providing structured reports and patient advice.

## Features

- **Django Admin Panel**: Manage patients, scan reports, and analysis results
- **React Frontend**: Modern, responsive UI for uploading scans and viewing reports
- **AI-Powered Analysis**: Google Gemini API for medical image analysis
- **PostgreSQL Database**: Connected to Render cloud database
- **Patient Management**: Store and manage patient data with auto table creation

## Project Structure

```
HepatoScanAi/
├── backend/              # Django backend
│   ├── hepatoscan/      # Django project settings
│   ├── users/            # Users app with Patient model
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/             # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Database Configuration

The application is configured to use your Render PostgreSQL database:

- **Database**: hepatoscandb
- **Host**: dpg-d7rpvojeo5us73cc30bg-a.oregon-postgres.render.com
- **Port**: 5432
- **Username**: postgress

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example` and add your credentials.

5. Run migrations (auto table creation):
   ```bash
   python manage.py migrate
   ```

6. Create a superuser for Django Admin:
   ```bash
   python manage.py createsuperuser
   ```

7. Run the development server:
   ```bash
   python manage.py runserver
   ```

The admin panel will be available at: `http://localhost:8000/admin/`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at: `http://localhost:3000/`

## API Endpoints

- `GET/POST /api/patients/` - List/Create patients
- `GET/PUT/DELETE /api/patients/<id>/` - Patient details
- `POST /api/analyze/` - Analyze general medical scan
- `POST /api/advice/` - Get advice for general scan
- `POST /api/hepato-analyze/` - Analyze liver scan
- `POST /api/hepato-advice/` - Get liver-specific advice
- `GET /api/health/` - Health check

## Environment Variables

Create a `.env` file in the backend directory with:

```
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True
GEMINI_API_KEY=your-gemini-api-key
DB_NAME=hepatoscandb
DB_USER=postgress
DB_PASSWORD=your-password
DB_HOST=dpg-d7rpvojeo5us73cc30bg-a.oregon-postgres.render.com
DB_PORT=5432
```

## Admin Access

Django Admin is available at `/admin/` with full management capabilities for:
- **Patients**: View, add, edit, delete patient records
- **Scan Reports**: Manage all scan reports
- **Analysis Results**: View AI-generated analysis results

## Tech Stack

- **Backend**: Django 5.0, Django REST Framework, PostgreSQL
- **Frontend**: React 18, CSS3
- **AI**: Google Gemini API
- **Database**: Render PostgreSQL

## License

This project is for educational purposes. Always consult qualified healthcare providers for medical decisions.
