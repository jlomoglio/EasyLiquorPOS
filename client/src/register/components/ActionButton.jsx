export default function ActionButton({ label, isDisabled, ...props}) {
    let color = "#ccc"
    let textColor

    if (label === 'Print' && !isDisabled) {
        color = '#af7457'
        textColor = '#fff'
    }

    else if (label === 'Void' && !isDisabled) {
        color = '#f54141'
        textColor = '#fff'
    }

    else if (label === 'Credit' && !isDisabled) {
        color = '#6699ff'
        textColor = '#fff'
    }

    else if (label === 'Cash' && !isDisabled) {
        color = '#33cc33'
        textColor = '#fff'
    }
    
    return (
        <button 
            id={label} 
            style={{ 
                backgroundColor: color, 
                color: textColor, 
                fontSize: '2rem',
                outline: "none", 
                boxShadow: "none",
                border: "none"
            }} 
            {...props}
        >
            {label}
        </button>
    )
}