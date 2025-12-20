// API Configuration
// In production, this will use the Railway backend URL
// In development, it uses relative URLs (proxied by Vite)

const getApiBaseUrl = (): string => {
  // Check if we're in production and have a VITE_API_URL set
  if (import.meta.env.PROD && import.meta.env.VITE_API_URL) {
    // Remove trailing slash if present
    const apiUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '');
    console.log('[API Config] Using Railway backend:', apiUrl);
    return apiUrl;
  }
  
  // In development or when VITE_API_URL is not set, use relative URLs
  // Vite proxy will handle routing to localhost:3000 in dev
  if (import.meta.env.PROD) {
    console.warn('[API Config] ⚠️ VITE_API_URL not set in production! API calls will fail.');
    console.warn('[API Config] Set VITE_API_URL in Vercel to your Railway backend URL');
  }
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

export const apiUrl = (path: string): string => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

