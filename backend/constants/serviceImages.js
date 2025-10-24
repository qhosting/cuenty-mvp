/**
 * Sistema de imágenes predefinidas para servicios de streaming
 * Estas URLs apuntan a CDNs públicos con los logos oficiales
 */

const SERVICE_IMAGES = {
  // Streaming Video
  NETFLIX: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
  DISNEY_PLUS: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',
  HBO_MAX: 'https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg',
  PRIME_VIDEO: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png',
  PARAMOUNT_PLUS: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Paramount_Plus.svg',
  APPLE_TV: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg',
  VIX: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/ViX_Logo.png/1200px-ViX_Logo.png',
  CRUNCHYROLL: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Crunchyroll_Logo.png',
  
  // Música
  SPOTIFY: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
  YOUTUBE_MUSIC: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Youtube_Music_icon.svg',
  
  // Productividad
  CANVA: 'https://upload.wikimedia.org/wikipedia/en/b/bb/Canva_Logo.svg',
  OFFICE_365: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Microsoft_Office_Word_%282019%E2%80%932025%29.svg/516px-Microsoft_Office_Word_%282019%E2%80%932025%29.svg.png',
  CAPCUT: 'https://upload.wikimedia.org/wikipedia/en/a/a0/Capcut-logo.svg',
  DUOLINGO: 'https://i.ytimg.com/vi/PzomGOEZFqo/maxresdefault.jpg',
  
  // AI
  CHATGPT: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
  CHATON: 'https://img.icons8.com/color/512/chat.png',
  
  // IPTV / Streaming
  PLEX: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Plex_logo_2022.svg',
  JELLYFIN: 'https://jellyfin.org/images/logo.svg',
  DIRECTV_GO: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/DirecTV_logo_%282004-2011%29.svg',
  METEGOL_TV: 'https://img.icons8.com/color/512/tv.png',
  
  // Adultos
  PORNHUB: 'https://media.istockphoto.com/id/1350885528/vector/under-18-sign-warning-symbol-over-18-only-censored-eighteen-age-older-forbidden-adult.jpg?s=612x612&w=0&k=20&c=ast2XCxr0wfHm1XBDWL-u2sfsnfkZvUoPjE_h5-YsPE=',
  
  // YouTube
  YOUTUBE_PREMIUM: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png',
  
  // Default/Genérico
  DEFAULT: 'https://img.icons8.com/color/512/streaming.png'
};

/**
 * Categorías de servicios con sus colores para la UI
 */
const SERVICE_CATEGORIES = {
  STREAMING: {
    name: 'Streaming de Video',
    color: '#E50914',
    icon: '🎬'
  },
  MUSIC: {
    name: 'Música',
    color: '#1DB954',
    icon: '🎵'
  },
  PRODUCTIVITY: {
    name: 'Productividad',
    color: '#4285F4',
    icon: '💼'
  },
  AI: {
    name: 'Inteligencia Artificial',
    color: '#00A67E',
    icon: '🤖'
  },
  IPTV: {
    name: 'IPTV / TV en Vivo',
    color: '#FF6B00',
    icon: '📺'
  },
  EDUCATION: {
    name: 'Educación',
    color: '#58CC02',
    icon: '📚'
  },
  ADULT: {
    name: 'Contenido Adulto',
    color: '#000000',
    icon: '🔞'
  }
};

/**
 * Obtener imagen para un servicio por nombre
 */
function getServiceImage(serviceName) {
  const normalizedName = serviceName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  
  // Búsqueda exacta
  if (SERVICE_IMAGES[normalizedName]) {
    return SERVICE_IMAGES[normalizedName];
  }
  
  // Búsqueda parcial
  for (const [key, value] of Object.entries(SERVICE_IMAGES)) {
    if (normalizedName.includes(key) || key.includes(normalizedName.split('_')[0])) {
      return value;
    }
  }
  
  return SERVICE_IMAGES.DEFAULT;
}

/**
 * Obtener lista de servicios con sus imágenes
 */
function getAvailableServiceImages() {
  return Object.entries(SERVICE_IMAGES).map(([key, url]) => ({
    key,
    name: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
    url
  }));
}

module.exports = {
  SERVICE_IMAGES,
  SERVICE_CATEGORIES,
  getServiceImage,
  getAvailableServiceImages
};
