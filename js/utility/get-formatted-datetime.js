/**
 * Returns a string with the formatted current datetime for easy integration with SAS
 * return {String} - Datetime string in the format DDMMMYY:HH:MM:SS, e.g: '01JUL25:09:52:29'
 */
function getFormattedDatetime() {
    const now = new Date();

    const day = now.getDate().toString().padStart(2, '0');
    const year = now.getFullYear().toString().slice(-2); // Get last two digits of the year

    const monthNames = [
        'JAN',
        'FEB',
        'MAR',
        'APR',
        'MAY',
        'JUN',
        'JUL',
        'AUG',
        'SEP',
        'OCT',
        'NOV',
        'DEC',
    ];
    const month = monthNames[now.getMonth()];

    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    return `${day}${month}${year}:${hours}:${minutes}:${seconds}`;
}
