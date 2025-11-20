"""
Background job scheduler using APScheduler
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.services.cleanup import cleanup_service
import logging
import os

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


def start_scheduler():
    """Start the background job scheduler"""
    if os.getenv("DISABLE_SCHEDULER") == "1":
        logger.info("Scheduler start skipped (DISABLE_SCHEDULER=1)")
        return
    if scheduler.running:
        logger.info("Scheduler already running")
        return
    # Run cleanup jobs daily at 2 AM UTC
    scheduler.add_job(
        cleanup_service.run_all_cleanups,
        trigger=CronTrigger(hour=2, minute=0),
        id="daily_cleanup",
        name="Daily cleanup of expired tokens and old sessions",
        replace_existing=True,
    )

    scheduler.start()
    logger.info("Background job scheduler started")


def shutdown_scheduler():
    """Shutdown the scheduler"""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Background job scheduler stopped")
