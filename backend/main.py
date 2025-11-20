"""
DevAuth API Backend
Main FastAPI application entry point
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import engine, Base
from app.core.logging_config import setup_logging, RequestLoggingMiddleware
from app.core.exceptions import DevAuthException
from app.core.scheduler import start_scheduler, shutdown_scheduler
from app.api.v1 import auth, portal, introspect
from app.schemas import ErrorResponse, ErrorDetail

# Setup logging
logger = setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup: Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Start background scheduler
    start_scheduler()
    
    yield
    
    # Shutdown: Stop scheduler and close database connections
    shutdown_scheduler()
    await engine.dispose()


app = FastAPI(
    title="DevAuth API",
    description="Multi-tenant Authentication-as-a-Service Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Request logging middleware
app.add_middleware(RequestLoggingMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handlers
@app.exception_handler(DevAuthException)
async def devauth_exception_handler(request: Request, exc: DevAuthException):
    """Handle DevAuth custom exceptions"""
    logger.error(f"DevAuthException: {exc.detail}", extra={
        "request_id": getattr(request.state, "request_id", None)
    })
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    logger.error(f"Validation error: {exc.errors()}", extra={
        "request_id": getattr(request.state, "request_id", None)
    })
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Request validation failed",
                "details": exc.errors()
            }
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions"""
    logger.exception("Unhandled exception", exc_info=exc, extra={
        "request_id": getattr(request.state, "request_id", None)
    })
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An internal error occurred"
            }
        }
    )


# Include routers
app.include_router(auth.router, prefix="/v1/auth", tags=["authentication"])
app.include_router(portal.router, prefix="/v1/portal", tags=["developer-portal"])
app.include_router(introspect.router, prefix="/v1/auth", tags=["token-introspection"])


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "DevAuth API",
        "version": "1.0.0",
        "docs": "/docs"
    }

