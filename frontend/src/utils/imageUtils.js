export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    // Backend uploads
    if (path.startsWith('/uploads') || path.startsWith('uploads')) {
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        // Remove /api if present in VITE_API_URL when serving static files from root
        const baseUrl = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;
        return `${baseUrl}${cleanPath}`;
    }

    // Frontend assets
    if (path.startsWith('/assets') || path.startsWith('assets')) {
        return path.startsWith('/') ? path : `/${path}`;
    }

    return `/assets/${path}`;
};
