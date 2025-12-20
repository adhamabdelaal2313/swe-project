// API Configuration
// In production, this will use the Railway backend URL
// In development, it uses relative URLs (proxied by Vite)

const getApiBaseUrl = (): string => {
  // Check if we're in production and have a VITE_API_URL set
  if (import.meta.env.PROD && import.meta.env.VITE_API_URL) {
    // Remove trailing slash if present
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  
  // In development or when VITE_API_URL is not set, use relative URLs
  // Vite proxy will handle routing to localhost:3000 in dev
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

export const apiUrl = (path: string): string => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

