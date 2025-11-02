"""
Storage Service
Supabase Storage integration for file uploads
"""
from supabase import create_client, Client
from typing import Optional, BinaryIO
from PIL import Image
import io
from loguru import logger

from app.config import settings


class StorageService:
    """Service for file storage using Supabase"""
    
    def __init__(self):
        self.supabase: Optional[Client] = None
        self.bucket_name = settings.SUPABASE_BUCKET_NAME
        
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                self.supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                logger.info("Supabase client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
                self.supabase = None
        else:
            logger.warning("Supabase credentials not configured, storage service disabled")
    
    def optimize_image(
        self,
        image_data: bytes,
        max_width: int = 1920,
        max_height: int = 1080,
        quality: int = 85
    ) -> bytes:
        """
        Optimize image by resizing and compressing
        
        Args:
            image_data: Original image bytes
            max_width: Maximum width in pixels
            max_height: Maximum height in pixels
            quality: JPEG quality (1-100)
            
        Returns:
            Optimized image bytes
        """
        try:
            # Open image
            img = Image.open(io.BytesIO(image_data))
            
            # Convert RGBA to RGB if necessary
            if img.mode == 'RGBA':
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3])  # 3 is the alpha channel
                img = background
            
            # Resize if necessary
            if img.width > max_width or img.height > max_height:
                img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
            
            # Save to bytes
            output = io.BytesIO()
            img.save(output, format='JPEG', quality=quality, optimize=True)
            output.seek(0)
            
            optimized_data = output.getvalue()
            logger.info(f"Image optimized: {len(image_data)} -> {len(optimized_data)} bytes")
            
            return optimized_data
        
        except Exception as e:
            logger.error(f"Error optimizing image: {e}")
            return image_data  # Return original if optimization fails
    
    async def upload_file(
        self,
        file_path: str,
        file_data: bytes,
        content_type: str = "application/octet-stream",
        optimize: bool = True
    ) -> Optional[str]:
        """
        Upload file to Supabase Storage
        
        Args:
            file_path: Path in storage bucket (e.g., "blog/cover-image.jpg")
            file_data: File bytes
            content_type: MIME type
            optimize: Whether to optimize images
            
        Returns:
            Public URL of uploaded file or None if failed
        """
        if not self.supabase:
            logger.error("Supabase client not initialized")
            return None
        
        try:
            # Optimize images
            if optimize and content_type.startswith("image/"):
                file_data = self.optimize_image(file_data)
            
            # Upload to Supabase
            response = self.supabase.storage.from_(self.bucket_name).upload(
                file_path,
                file_data,
                {
                    "content-type": content_type,
                    "x-upsert": "true"  # Overwrite if exists
                }
            )
            
            # Get public URL
            public_url = self.supabase.storage.from_(self.bucket_name).get_public_url(file_path)
            
            logger.info(f"File uploaded successfully: {file_path}")
            return public_url
        
        except Exception as e:
            logger.error(f"Error uploading file to Supabase: {e}")
            return None
    
    async def delete_file(self, file_path: str) -> bool:
        """
        Delete file from Supabase Storage
        
        Args:
            file_path: Path in storage bucket
            
        Returns:
            True if deletion was successful
        """
        if not self.supabase:
            logger.error("Supabase client not initialized")
            return False
        
        try:
            self.supabase.storage.from_(self.bucket_name).remove([file_path])
            logger.info(f"File deleted successfully: {file_path}")
            return True
        
        except Exception as e:
            logger.error(f"Error deleting file from Supabase: {e}")
            return False
    
    async def get_file_url(self, file_path: str) -> Optional[str]:
        """
        Get public URL for a file
        
        Args:
            file_path: Path in storage bucket
            
        Returns:
            Public URL or None
        """
        if not self.supabase:
            return None
        
        try:
            return self.supabase.storage.from_(self.bucket_name).get_public_url(file_path)
        
        except Exception as e:
            logger.error(f"Error getting file URL: {e}")
            return None
    
    def validate_file(
        self,
        filename: str,
        file_size: int,
        allowed_extensions: Optional[list] = None
    ) -> tuple[bool, str]:
        """
        Validate file before upload
        
        Args:
            filename: File name
            file_size: File size in bytes
            allowed_extensions: List of allowed extensions
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if allowed_extensions is None:
            allowed_extensions = settings.ALLOWED_EXTENSIONS_LIST
        
        # Check file size
        if file_size > settings.MAX_UPLOAD_SIZE:
            max_mb = settings.MAX_UPLOAD_SIZE / (1024 * 1024)
            return False, f"File too large. Maximum size: {max_mb}MB"
        
        # Check file extension
        extension = filename.split(".")[-1].lower() if "." in filename else ""
        if extension not in allowed_extensions:
            return False, f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        
        return True, ""
