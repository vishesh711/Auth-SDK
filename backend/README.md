# DevAuth Backend

FastAPI-based REST API for the DevAuth authentication platform.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables (copy from `.env.example`)

3. Run database migrations:
```bash
alembic upgrade head
```

4. Start the development server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## Project Structure

```
backend/
├── app/
│   ├── api/          # API route handlers
│   ├── core/         # Core configuration (database, settings)
│   ├── models/       # SQLAlchemy database models
│   ├── schemas/      # Pydantic request/response models
│   ├── services/     # Business logic services
│   └── utils/        # Utility functions
├── alembic/          # Database migrations
├── main.py           # FastAPI application entry point
└── requirements.txt  # Python dependencies
```

