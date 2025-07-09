// Gets the date, time or datetime
const getDateTime = (type) => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes().toString().padStart(2, '0') // Ensure two-digit minutes
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const formattedHours = hours % 12 || 12 // Convert 0 (midnight) to 12
    const time12Hour = `${formattedHours}:${minutes} ${ampm}`
    const formattedDateTime = `${now.getMonth() + 1}-${now.getDate()}-${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}`

    const date = `${now.getMonth() + 1}-${now.getDate()}-${now.getFullYear()}`
    const time = `${time12Hour}`

    if (type === 'date') {
        return date
    }

    if (type === 'time') {
        return time
    }

    if (type === 'datetime') {
        return formattedDateTime
    }
}

module.exports = { getDateTime }