"""
Developer Portal API endpoints
"""

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional

from app.core.database import get_db
from app.core.portal_auth import get_portal_developer
from app.models import Developer
from app.schemas import (
    DeveloperSignup,
    DeveloperLogin,
    DeveloperResponse,
    DeveloperTokenResponse,
    ApplicationCreate,
    ApplicationResponse,
    ApplicationWithSecret,
    APIKeyCreate,
    APIKeyResponse,
    APIKeyWithPlaintext,
)
from app.services.developer import DeveloperAuthService
from app.services.application import application_service
from app.services.api_key_service import api_key_service
from app.services.user_management import user_management_service

router = APIRouter()
developer_auth_service = DeveloperAuthService()


@router.post(
    "/developers/signup",
    response_model=DeveloperResponse,
    status_code=status.HTTP_201_CREATED,
)
async def developer_signup(
    developer_data: DeveloperSignup, db: AsyncSession = Depends(get_db)
) -> DeveloperResponse:
    """Register a new developer"""
    developer = await developer_auth_service.signup(
        db=db, developer_data=developer_data
    )
    return developer


@router.post("/developers/login", response_model=DeveloperTokenResponse)
async def developer_login(
    credentials: DeveloperLogin, db: AsyncSession = Depends(get_db)
):
    """Login developer"""
    developer, access_token = await developer_auth_service.login(
        db=db, credentials=credentials
    )
    return DeveloperTokenResponse(access_token=access_token, developer=developer)


@router.get("/applications", response_model=list[ApplicationResponse])
async def list_applications(
    developer: Developer = Depends(get_portal_developer),
    db: AsyncSession = Depends(get_db),
):
    """List all applications for authenticated developer"""
    # For portal, we use a special token format - extract developer from token
    # For now, we'll need to adjust the middleware or create a portal-specific one
    # This is a simplified version - in production, you'd have separate portal auth
    applications = await application_service.list_applications(
        db=db, developer_id=developer.id
    )
    return applications


@router.post(
    "/applications",
    response_model=ApplicationWithSecret,
    status_code=status.HTTP_201_CREATED,
)
async def create_application(
    app_data: ApplicationCreate,
    developer: Developer = Depends(get_portal_developer),
    db: AsyncSession = Depends(get_db),
):
    """Create a new application"""
    application, app_secret = await application_service.create_application(
        db=db, developer_id=developer.id, app_data=app_data
    )
    return ApplicationWithSecret(**application.__dict__, app_secret=app_secret)


@router.delete("/applications/{app_id}", status_code=status.HTTP_200_OK)
async def delete_application(
    app_id: str,
    developer: Developer = Depends(get_portal_developer),
    db: AsyncSession = Depends(get_db),
):
    """Delete an application and all associated data"""
    await application_service.delete_application(
        db=db, developer_id=developer.id, app_id=app_id
    )
    return {"success": True}


@router.get("/applications/{app_id}/users", response_model=dict)
async def list_users(
    app_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    developer: Developer = Depends(get_portal_developer),
    db: AsyncSession = Depends(get_db),
):
    """List users for an application"""
    result = await user_management_service.list_users(
        db=db,
        app_id=app_id,
        developer_id=developer.id,
        page=page,
        limit=limit,
        search=search,
    )
    return result


@router.post(
    "/applications/{app_id}/api-keys",
    response_model=APIKeyWithPlaintext,
    status_code=status.HTTP_201_CREATED,
)
async def create_api_key(
    app_id: str,
    key_data: APIKeyCreate,
    developer: Developer = Depends(get_portal_developer),
    db: AsyncSession = Depends(get_db),
):
    """Create a new API key"""
    api_key, plaintext_key = await api_key_service.create_api_key(
        db=db, app_id=app_id, developer_id=developer.id, key_data=key_data
    )
    return APIKeyWithPlaintext(**api_key.__dict__, key=plaintext_key)


@router.get("/applications/{app_id}/api-keys", response_model=list[APIKeyResponse])
async def list_api_keys(
    app_id: str,
    developer: Developer = Depends(get_portal_developer),
    db: AsyncSession = Depends(get_db),
):
    """List API keys for an application"""
    api_keys = await api_key_service.list_api_keys(
        db=db, app_id=app_id, developer_id=developer.id
    )
    return api_keys


@router.delete(
    "/applications/{app_id}/api-keys/{key_id}", status_code=status.HTTP_200_OK
)
async def revoke_api_key(
    app_id: str,
    key_id: UUID,
    developer: Developer = Depends(get_portal_developer),
    db: AsyncSession = Depends(get_db),
):
    """Revoke an API key"""
    await api_key_service.revoke_api_key(
        db=db, app_id=app_id, key_id=key_id, developer_id=developer.id
    )
    return {"success": True}
