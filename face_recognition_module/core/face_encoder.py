"""
GPU-Optimized Face Encoder for Campus Management System
Supports RTX 3050 and higher GPUs
"""

import numpy as np
import cv2
import insightface
import time
import logging
from typing import Optional, List

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FaceEncoder:
    """
    GPU-accelerated face detection and embedding extraction
    Optimized for RTX 3050 and campus management systems
    """
    
    def __init__(self, gpu_memory_limit: int = 2048, detection_size: tuple = (640, 640)):
        """
        Initialize Face Encoder with GPU or CPU optimization
        
        Args:
            gpu_memory_limit: GPU memory limit in MB (default 2048 for GPU)
            detection_size: Detection resolution (default 640x640)
        """
        import os
        self.use_gpu = str(os.getenv("USE_GPU", "False")).lower() == "true"
        self.gpu_memory_limit = gpu_memory_limit * 1024 * 1024  # Convert to bytes
        self.detection_size = detection_size
        
        # Select provider based on environment setup
        if self.use_gpu:
            providers = ['CUDAExecutionProvider']
            provider_options = [{
                'device_id': 0, 
                'arena_extend_strategy': 'kNextPowerOfTwo', 
                'gpu_mem_limit': self.gpu_memory_limit, 
                'cudnn_conv_algo_search': 'EXHAUSTIVE', 
                'do_copy_in_default_stream': True
            }]
        else:
            providers = ['CPUExecutionProvider']
            # Strict memory limits for Render Free Tier (512MB RAM)
            provider_options = [{
                'intra_op_num_threads': 1,
                'inter_op_num_threads': 1,
                'arena_extend_strategy': 'kSameAsRequested',
            }]
        
        # Switch to the lighter buffalo_s model to avoid exceeding the 512MB RAM limit on Render
        self.app = insightface.app.FaceAnalysis(
            name='buffalo_s',
            providers=providers,
            provider_options=provider_options
        )
        
        self.app.prepare(ctx_id=0 if self.use_gpu else -1, det_size=self.detection_size)
        logger.info(f"🚀 FaceEncoder initialized - GPU: {self.use_gpu}, Model: buffalo_s, Size: {detection_size}")
    
    def l2_normalize(self, embedding: np.ndarray) -> np.ndarray:
        """L2 normalize embedding vector"""
        return embedding / np.sqrt(np.sum(np.square(embedding)))
    
    def encode_image(self, image_data, return_metadata: bool = False):
        """
        Extract face embedding from image data
        
        Args:
            image_data: Image bytes or numpy array
            return_metadata: Return additional face metadata
            
        Returns:
            Normalized embedding vector or (embedding, metadata) if return_metadata=True
        """
        start_time = time.time()
        
        # Handle different input types
        if isinstance(image_data, bytes):
            npimg = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
        elif isinstance(image_data, np.ndarray):
            img = image_data
        else:
            logger.error("❌ Unsupported image data type")
            return None
            
        if img is None:
            logger.warning("⚠️ Could not decode image")
            return None
        
        # GPU face detection and embedding
        faces = self.app.get(img)
        if len(faces) == 0:
            logger.warning("⚠️ No face detected")
            return None
        
        # Get primary face (largest face)
        face = max(faces, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))
        
        # Performance monitoring
        processing_time = (time.time() - start_time) * 1000
        logger.info(f"🔥 GPU Processing: {processing_time:.2f}ms")
        
        normalized_embedding = self.l2_normalize(face.embedding)
        
        if return_metadata:
            metadata = {
                'bbox': face.bbox.tolist(),
                'landmarks': face.kps.tolist() if hasattr(face, 'kps') else None,
                'detection_score': float(face.det_score),
                'processing_time_ms': processing_time
            }
            return normalized_embedding, metadata
        
        return normalized_embedding
    
    def encode_multiple_faces(self, image_data) -> List[dict]:
        """
        Extract embeddings for all faces in an image
        
        Returns:
            List of face dictionaries with embeddings and metadata
        """
        start_time = time.time()
        
        # Handle different input types
        if isinstance(image_data, bytes):
            npimg = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
        elif isinstance(image_data, np.ndarray):
            img = image_data
        else:
            logger.error("❌ Unsupported image data type")
            return []
            
        if img is None:
            logger.warning("⚠️ Could not decode image")
            return []
        
        # GPU face detection
        faces = self.app.get(img)
        if len(faces) == 0:
            logger.warning("⚠️ No faces detected")
            return []
        
        results = []
        for i, face in enumerate(faces):
            result = {
                'face_id': i,
                'embedding': self.l2_normalize(face.embedding),
                'bbox': face.bbox.tolist(),
                'landmarks': face.kps.tolist() if hasattr(face, 'kps') else None,
                'detection_score': float(face.det_score)
            }
            results.append(result)
        
        processing_time = (time.time() - start_time) * 1000
        logger.info(f"🔥 GPU Multi-face Processing: {len(faces)} faces in {processing_time:.2f}ms")
        
        return results
    
    def get_face_count(self, image_data) -> int:
        """Quick face count without embedding extraction"""
        if isinstance(image_data, bytes):
            npimg = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
        elif isinstance(image_data, np.ndarray):
            img = image_data
        else:
            return 0
            
        if img is None:
            return 0
        
        faces = self.app.get(img)
        return len(faces)