// utils/dateUtils.ts
/**
 * Format date string for display - uses UTC to ensure consistent dates across timezones
 * This prevents dates from shifting when users in different timezones view the same data
 * e.g., "2025-10-28T00:00:00.000Z" will display as "Oct 28, 2025" for ALL users
 */
export const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';

    // Use UTC components to prevent timezone shifts
    return date.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  