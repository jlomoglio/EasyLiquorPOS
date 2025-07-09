// APPLICATION DEPENDENCIES
import { ArrowUpCircle, ArrowDownCircle, MinusCircle } from "lucide-react";


// COMPONENT: SALES COMPARISON ICON
export default function SalesComparisonIcon({ percentage }) {
    let Icon = MinusCircle // Default neutral icon
    let iconColor = "text-gray-500" // Default color
    let textColor = ""


    if (percentage > 0) {
        Icon = ArrowUpCircle // Up icon
        iconColor = "text-green-500" // Green for increase
        textColor = "text-green-500" // Green for increase
    } 
    else if (percentage < 0) {
        Icon = ArrowDownCircle // Down icon
        iconColor = "text-red-500" // Red for decrease
        textColor = "text-red-500" // Red for decrease
    }

    // RENDER JSX
    return (
        <div className="flex items-right space-x-1">
            <Icon className={`w-5 h-5 ${iconColor}`} />
            <span className={textColor}>{percentage}%</span>
        </div>
    )
}

