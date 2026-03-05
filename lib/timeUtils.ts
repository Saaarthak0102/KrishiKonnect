/**
 * Utility functions for handling timestamp conversions and relative time displays
 */

/**
 * Converts a timestamp to human-readable relative time
 * Examples: "Updated just now", "Updated 5 minutes ago", "Updated 2 hours ago"
 * 
 * @param timestamp - Date object, timestamp number, or ISO string
 * @param lang - Language for output ('en' or 'hi')
 * @returns Human-readable relative time string
 */
export function getRelativeTime(timestamp: string | number | Date, lang: 'en' | 'hi' = 'en'): string {
  try {
    const now = new Date()
    const updated = new Date(timestamp)
    
    // Validate the date
    if (isNaN(updated.getTime())) {
      return lang === 'hi' ? 'आज अपडेट' : 'Updated today'
    }
    
    const diff = Math.floor((now.getTime() - updated.getTime()) / 1000)
    
    // Less than 1 minute
    if (diff < 60) {
      return lang === 'hi' ? 'अभी अपडेट' : 'Updated just now'
    }
    
    // Less than 1 hour
    if (diff < 3600) {
      const minutes = Math.floor(diff / 60)
      if (lang === 'hi') {
        return `${minutes} मिनट पहले अपडेट`
      }
      return `Updated ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
    }
    
    // Less than 1 day
    if (diff < 86400) {
      const hours = Math.floor(diff / 3600)
      if (lang === 'hi') {
        return `${hours} घंटे पहले अपडेट`
      }
      return `Updated ${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
    }
    
    // More than 1 day
    const days = Math.floor(diff / 86400)
    if (lang === 'hi') {
      return `${days} दिन पहले अपडेट`
    }
    return `Updated ${days} ${days === 1 ? 'day' : 'days'} ago`
  } catch (error) {
    return lang === 'hi' ? 'आज अपडेट' : 'Updated today'
  }
}

/**
 * Checks if a timestamp is "live" (within 10 minutes)
 * Used for displaying a "Live price" indicator
 * 
 * @param timestamp - Date object, timestamp number, or ISO string
 * @returns true if timestamp is within 10 minutes of now
 */
export function isLivePrice(timestamp: string | number | Date): boolean {
  try {
    const now = new Date()
    const updated = new Date(timestamp)
    
    if (isNaN(updated.getTime())) {
      return false
    }
    
    const diff = Math.floor((now.getTime() - updated.getTime()) / 1000)
    return diff < 600 // 600 seconds = 10 minutes
  } catch (error) {
    return false
  }
}

/**
 * Gets a short timestamp label (useful for card headers)
 * Examples: "5m ago", "2h ago", "Today"
 * 
 * @param timestamp - Date object, timestamp number, or ISO string
 * @returns Short timestamp label
 */
export function getShortTime(timestamp: string | number | Date): string {
  try {
    const now = new Date()
    const updated = new Date(timestamp)
    
    if (isNaN(updated.getTime())) {
      return 'Today'
    }
    
    const diff = Math.floor((now.getTime() - updated.getTime()) / 1000)
    
    if (diff < 60) {
      return 'Just now'
    }
    
    if (diff < 3600) {
      const minutes = Math.floor(diff / 60)
      return `${minutes}m ago`
    }
    
    if (diff < 86400) {
      const hours = Math.floor(diff / 3600)
      return `${hours}h ago`
    }
    
    const days = Math.floor(diff / 86400)
    return `${days}d ago`
  } catch (error) {
    return 'Today'
  }
}
