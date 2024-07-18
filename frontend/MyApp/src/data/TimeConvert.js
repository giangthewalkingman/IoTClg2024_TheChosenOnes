function convertTime(inputTimeStr) {
    // Parse the input string into a Date object
    const inputDate = new Date(inputTimeStr);
    
    // Adjust the time by adding 7 hours (7 * 60 * 60 * 1000 milliseconds)
    const adjustedTime = new Date(inputDate.getTime() + 7 * 60 * 60 * 1000);
    
    // Format the Date object back into the desired string format
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const day = days[adjustedTime.getUTCDay()];
    const date = ('0' + adjustedTime.getUTCDate()).slice(-2);
    const month = months[adjustedTime.getUTCMonth()];
    const year = adjustedTime.getUTCFullYear();
    const hours = ('0' + adjustedTime.getUTCHours()).slice(-2);
    const minutes = ('0' + adjustedTime.getUTCMinutes()).slice(-2);
    const seconds = ('0' + adjustedTime.getUTCSeconds()).slice(-2);
    
    return `${day, day}, ${date} ${month} ${year} ${hours}:${minutes}:${seconds}`;
}

export function convertTimeLocal(inputTimeStr) {
    // Parse the input string into a Date object
    const inputDate = new Date(inputTimeStr);
    
    // Adjust the time by adding 7 hours (7 * 60 * 60 * 1000 milliseconds)
    const adjustedTime = new Date(inputDate.getTime());
    
    // Format the Date object back into the desired string format
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const day = days[adjustedTime.getUTCDay()];
    const date = ('0' + adjustedTime.getUTCDate()).slice(-2);
    const month = months[adjustedTime.getUTCMonth()];
    const year = adjustedTime.getUTCFullYear();
    const hours = ('0' + adjustedTime.getUTCHours()).slice(-2);
    const minutes = ('0' + adjustedTime.getUTCMinutes()).slice(-2);
    const seconds = ('0' + adjustedTime.getUTCSeconds()).slice(-2);
    
    return `${day, day}, ${date} ${month} ${year} ${hours}:${minutes}:${seconds}`;
}

export function convertTimeChart(inputTimeStr) {
    // Parse the input string into a Date object
    const inputDate = new Date(inputTimeStr);
    
    // Adjust the time by adding 7 hours (7 * 60 * 60 * 1000 milliseconds)
    const adjustedTime = new Date(inputDate.getTime() + 7 * 60 * 60 * 1000);
    
    // Format the Date object back into the desired string format
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const day = days[adjustedTime.getUTCDay()];
    const date = ('0' + adjustedTime.getUTCDate()).slice(-2);
    const month = months[adjustedTime.getUTCMonth()];
    const year = adjustedTime.getUTCFullYear();
    const hours = ('0' + adjustedTime.getUTCHours()).slice(-2);
    const minutes = ('0' + adjustedTime.getUTCMinutes()).slice(-2);
    const seconds = ('0' + adjustedTime.getUTCSeconds()).slice(-2);
    
    return `${date} ${month} ${year}\n${hours}:${minutes}:${seconds}`;
}

export default convertTime;