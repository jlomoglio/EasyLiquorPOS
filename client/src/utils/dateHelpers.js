// Format a date string or Date object for display: MM/DD/YYYY
export function formatForDisplay(date) {
    const d = new Date(date)
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    })
}

// Format for safe comparison: YYYY-MM-DD
export function formatForFilter(date) {
    const d = new Date(date)
    return d.toISOString().split("T")[0] // no timezones, safe comparison
}
