/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Get the current date/time formatted as SAS-compatible datetime (DDMMMYY:HH:MM:SS).
 */
export function getFormattedDatetime(): string {
  const now = new Date();
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ];

  const day = String(now.getDate()).padStart(2, '0');
  const month = months[now.getMonth()]!;
  const year = String(now.getFullYear()).slice(-2);
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${day}${month}${year}:${hours}:${minutes}:${seconds}`;
}
