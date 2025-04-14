/**
 * Formats a date string into a relative time string (e.g., "5 minutes ago", "yesterday").
 * 
 * @param dateString - An ISO 8601 compatible date string.
 * @returns A string representing the relative time, or the date if older than a week.
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) { // Check if the date is valid
      return "Invalid date";
    }
    
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) {
      return "just now";
    } else if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (days === 1) {
      return "yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      // Fallback to simple date format if older than a week
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  } catch (e) {
    console.error("Error formatting relative time:", e);
    return "Invalid date";
  }
}

/**
 * Formats a date string into an absolute, localized date and time string (12-hour format).
 * 
 * @param dateString - An ISO 8601 compatible date string.
 * @returns A string representing the absolute date and time, or "Invalid date".
 */
export function formatAbsoluteTime(dateString: string): string {
   try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
         return "Invalid date";
      }

      const dateOptions: Intl.DateTimeFormatOptions = {
         year: 'numeric',
         month: 'long',
         day: 'numeric',
      };
      const timeOptions: Intl.DateTimeFormatOptions = {
         hour: 'numeric',
         minute: '2-digit',
         hour12: true, // Use 12-hour format
      };

      const formattedDate = date.toLocaleDateString(undefined, dateOptions);
      const formattedTime = date.toLocaleTimeString(undefined, timeOptions);

      return `${formattedDate} at ${formattedTime}`;
   } catch (e) {
      console.error("Error formatting absolute time:", e);
      return "Invalid date";
   }
} 