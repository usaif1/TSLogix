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

/**
 * Format date and time string in dd-MM-yyyy HH:mm format
 * e.g., "2025-02-23T14:30:00.000Z" will display as "23-02-2025 14:30"
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${minutes}`;
};
  