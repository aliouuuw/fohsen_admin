import { JsonValue } from '@prisma/client/runtime/library';

export interface YouTubeVideoInfo {
  videoId: string;
  thumbnailUrl: string;
  url: string;
}

/**
 * Extracts YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube-nocookie\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Generates YouTube thumbnail URL from video ID
 */
export function getYouTubeThumbnailUrl(videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'medium'): string {
  const qualityMap = {
    default: 'default.jpg',
    medium: 'mqdefault.jpg',
    high: 'hqdefault.jpg',
    standard: 'sddefault.jpg',
    maxres: 'maxresdefault.jpg'
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}`;
}

/**
 * Recursively searches through TipTap content to find YouTube videos
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findYouTubeInContent(content: any): YouTubeVideoInfo[] {
  const videos: YouTubeVideoInfo[] = [];

  if (!content || typeof content !== 'object') {
    return videos;
  }

  // Check if current node is a YouTube video (TipTap YouTube extension)
  if (content.type === 'youtube' && content.attrs?.src) {
    const videoId = extractYouTubeVideoId(content.attrs.src);
    if (videoId) {
      videos.push({
        videoId,
        thumbnailUrl: getYouTubeThumbnailUrl(videoId, 'medium'),
        url: content.attrs.src
      });
    }
  }

  // Check if current node has iframe with YouTube URL
  if (content.type === 'iframe' && content.attrs?.src) {
    const videoId = extractYouTubeVideoId(content.attrs.src);
    if (videoId) {
      videos.push({
        videoId,
        thumbnailUrl: getYouTubeThumbnailUrl(videoId, 'medium'),
        url: content.attrs.src
      });
    }
  }

  // Also check for any generic HTML elements that might contain YouTube URLs
  if (content.type === 'paragraph' || content.type === 'text') {
    // Look for YouTube URLs in text content or marks
    if (content.text && typeof content.text === 'string') {
      const videoId = extractYouTubeVideoId(content.text);
      if (videoId) {
        videos.push({
          videoId,
          thumbnailUrl: getYouTubeThumbnailUrl(videoId, 'medium'),
          url: content.text
        });
      }
    }
    
    // Check marks for link URLs
    if (content.marks && Array.isArray(content.marks)) {
      for (const mark of content.marks) {
        if (mark.type === 'link' && mark.attrs?.href) {
          const videoId = extractYouTubeVideoId(mark.attrs.href);
          if (videoId) {
            videos.push({
              videoId,
              thumbnailUrl: getYouTubeThumbnailUrl(videoId, 'medium'),
              url: mark.attrs.href
            });
          }
        }
      }
    }
  }

  // Recursively search in content array
  if (Array.isArray(content.content)) {
    for (const child of content.content) {
      videos.push(...findYouTubeInContent(child));
    }
  }

  // Recursively search in content object
  if (content.content && typeof content.content === 'object') {
    videos.push(...findYouTubeInContent(content.content));
  }

  return videos;
}

/**
 * Extracts the first YouTube video from TipTap content and returns its thumbnail URL
 */
export function getFirstYouTubeThumbnail(content: JsonValue): string | null {
  if (!content) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsedContent: any;

  // Parse content if it's a string
  if (typeof content === 'string') {
    try {
      parsedContent = JSON.parse(content);
    } catch {
      return null;
    }
  } else {
    parsedContent = content;
  }

  const videos = findYouTubeInContent(parsedContent);
  return videos.length > 0 ? videos[0].thumbnailUrl : null;
}

/**
 * Extracts all YouTube videos from TipTap content
 */
export function getAllYouTubeVideos(content: JsonValue): YouTubeVideoInfo[] {
  if (!content) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsedContent: any;

  // Parse content if it's a string
  if (typeof content === 'string') {
    try {
      parsedContent = JSON.parse(content);
    } catch {
      return [];
    }
  } else {
    parsedContent = content;
  }

  return findYouTubeInContent(parsedContent);
} 