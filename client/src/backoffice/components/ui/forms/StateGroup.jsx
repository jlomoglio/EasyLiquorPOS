// APPLICATION DEPENDENCIES
import { useState } from "react"

// LUCIDE ICONS DEPENDENCIES
import { ChevronDown } from "lucide-react"


// COMPONENT: STATE GROUP
export default function StateGroup({ labelColor, space = "35px", value, onChange, error, required }) {
    // STYLES
    const wrapper = `
        w-full h-[60px] flex flex-col justify-start p-[20px]
        mt-[10px] mb-[35px] relative
    `
    const labelText = `
        text-[#5a5a5a] text-[1rem] font-[600]
        flex flex-row justify-start font-[Roboto] mt-[2px]
    `
    const select = `
        w-full bg-gray-100 px-4 py-2 rounded-md border 
        border-gray-300 focus:outline-none focus:ring focus:ring-blue-500
        rounded-lg text-[1rem] p-[0px] pl-[10px]
        mt-[5px] text-[#5a5a5a] pr-[15px]
        focus:border-[#60A5FA] appearance-none 
    `
    const errorText = `
        text-red-500 text-sm ml-[10px] mt-[3px]
    `

    // STATE
    const [stateName, setStateName] = useState()

    // RENDER JSX
    return (
        <div className={wrapper} style={{ marginBottom: space}}>
            <div 
                className={labelColor ? labelTextWhite : labelText}
            >
                STATE 
                {required && <span className="ml-[5px] text-[1rem]">*</span>}
                {error && <span className={errorText}>{error}</span>}
            </div>
            <div className="relative">
                <select 
                    name="state" 
                    className={select}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.name, e.target.value);
                    }}
                    style={{ appearance: "none", WebkitAppearance: "none", MozAppearance: "none" }}
                >
                    <option value="">Select a State</option>
                    <option value="AL">Alabama</option>
                    <option value="AK">Alaska</option>
                    <option value="AZ">Arizona</option>
                    <option value="AR">Arkansas</option>
                    <option value="CA">California</option>
                    <option value="CO">Colorado</option>
                    <option value="CT">Connecticut</option>
                    <option value="DE">Delaware</option>
                    <option value="FL">Florida</option>
                    <option value="GA">Georgia</option>
                    <option value="HI">Hawaii</option>
                    <option value="ID">Idaho</option>
                    <option value="IL">Illinois</option>
                    <option value="IN">Indiana</option>
                    <option value="IA">Iowa</option>
                    <option value="KS">Kansas</option>
                    <option value="KY">Kentucky</option>
                    <option value="LA">Louisiana</option>
                    <option value="ME">Maine</option>
                    <option value="MD">Maryland</option>
                    <option value="MA">Massachusetts</option>
                    <option value="MI">Michigan</option>
                    <option value="MN">Minnesota</option>
                    <option value="MS">Mississippi</option>
                    <option value="MO">Missouri</option>
                    <option value="MT">Montana</option>
                    <option value="NE">Nebraska</option>
                    <option value="NV">Nevada</option>
                    <option value="NH">New Hampshire</option>
                    <option value="NJ">New Jersey</option>
                    <option value="NM">New Mexico</option>
                    <option value="NY">New York</option>
                    <option value="NC">North Carolina</option>
                    <option value="ND">North Dakota</option>
                    <option value="OH">Ohio</option>
                    <option value="OK">Oklahoma</option>
                    <option value="OR">Oregon</option>
                    <option value="PA">Pennsylvania</option>
                    <option value="RI">Rhode Island</option>
                    <option value="SC">South Carolina</option>
                    <option value="SD">South Dakota</option>
                    <option value="TN">Tennessee</option>
                    <option value="TX">Texas</option>
                    <option value="UT">Utah</option>
                    <option value="VT">Vermont</option>
                    <option value="VA">Virginia</option>
                    <option value="WA">Washington</option>
                    <option value="WV">West Virginia</option>
                    <option value="WI">Wisconsin</option>
                    <option value="WY">Wyoming</option>
                </select>
                <ChevronDown 
                    size={15} 
                    strokeWidth={3} 
                    style={{
                        position: "absolute",
                        right: "15px",
                        top: "28px",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                        color: "#4b5563", // Tailwind `text-gray-600`
                        fontSize: "0.8rem"
                    }}
                />
            </div>
        </div>
    )
}