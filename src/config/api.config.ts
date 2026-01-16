// API Configuration for different environments
const isDevelopment = import.meta.env.MODE === 'development';

export const API_CONFIG = {
  // Flask API (Priority Prediction)
  FLASK_API_URL: import.meta.env.VITE_FLASK_API_URL || 
    (isDevelopment ? 'http://localhost:5000' : 'https://campus-ease-priority-api.onrender.com'),
  
  // FastAPI (Face Recognition)
  FASTAPI_URL: import.meta.env.VITE_FASTAPI_URL || 
    (isDevelopment ? 'http://localhost:8000' : 'https://campus-ease-face-api.onrender.com'),
  
  // Supabase
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://jfricqlqhddznvliwwpt.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmcmljcWxxaGRkem52bGl3d3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMTAzMDMsImV4cCI6MjA3ODc4NjMwM30.tLq8jgbKmm02qi-5eXXkgdlpYD-oy_mH7TiQKg5-5l0',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Flask API Endpoints
  PRIORITY: {
    HEALTH: `${API_CONFIG.FLASK_API_URL}/health`,
    TRAIN: `${API_CONFIG.FLASK_API_URL}/train`,
    SYNC_WEIGHTS: `${API_CONFIG.FLASK_API_URL}/sync_weights`,
    UPDATE_PRIORITIES: `${API_CONFIG.FLASK_API_URL}/update_priorities`,
    PREDICT: `${API_CONFIG.FLASK_API_URL}/predict`,
  },
  
  // FastAPI Endpoints
  FACE_RECOGNITION: {
    ROOT: `${API_CONFIG.FASTAPI_URL}/`,
    HEALTH: `${API_CONFIG.FASTAPI_URL}/health`,
    TRAIN_STUDENT: `${API_CONFIG.FASTAPI_URL}/train-student`,
    MASS_RECOGNITION: `${API_CONFIG.FASTAPI_URL}/mass-recognition`,
    SAVE_ATTENDANCE: `${API_CONFIG.FASTAPI_URL}/save-attendance`,
    STUDENT_STATUS: (studentId: string) => 
      `${API_CONFIG.FASTAPI_URL}/students/${studentId}/face-training-status`,
    SYSTEM_STATS: `${API_CONFIG.FASTAPI_URL}/system/stats`,
    ANNOTATED_IMAGES: (classId: string) => 
      `${API_CONFIG.FASTAPI_URL}/annotated-images/${classId}`,
    DOWNLOAD_IMAGE: (classId: string, filename: string) => 
      `${API_CONFIG.FASTAPI_URL}/download-annotated-image/${classId}/${filename}`,
  }
};

export default API_CONFIG;
