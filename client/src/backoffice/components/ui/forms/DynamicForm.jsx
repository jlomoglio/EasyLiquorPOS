// APPLICATION DEPENDENCIES
import { useState, useRef } from "react";

// COMPONENT DEPENDENCIES
import InputGroup from "./InputGroup";
import StateGroup from "./StateGroup";
import SelectGroup from "./SelectGroup";
import Button from "./Button";
import SuccessAlert from "./SuccessAlert";
import TextareaGroup from "./TextAreaGroup"
import DateGroup from './DateGroup';


// COMPONENT: DYNAMIC FORM
export default function DynamicForm({ 
    formConfig, 
    customValidations = {},
    customComponents = {},
    onSubmit,
    onChange,
    success,
    formData,
    setFormData,
    buttonLable,
    buttonColor,
    buttonType,
    message
 }) {


    // ENSURE FORMDATA IS ALWAYS AN OBJECT
    formData = formData || {}

    // FORM CONFIGURATION
    const { columns, fields } = formConfig

    // REFS
    const refs = useRef({})

    // STATE: ERRORS
    const [errors, setErrors] = useState({})


    // HANDLE CHANGE
    function handleChange(name, value) {
        // if (!name || typeof name !== "string") {
        //     console.error("❌ Invalid name received in handleChange:", name);
        //     return;
        // }
    
        let formattedValue = value;
    
        // Apply custom formatting for phone and zip
        if (name === "phone") {
            let numbers = value.replace(/\D/g, "").slice(0, 10);
            formattedValue = numbers.length > 6
                ? `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`
                : numbers.length > 3
                ? `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
                : numbers.length > 0
                ? `(${numbers}`
                : "";
        }
    
        if (name === "zip") {
            let numbers = value.replace(/\D/g, "").slice(0, 5);
            formattedValue = numbers;
        }
    
        //console.log("🟢 Formatted Value:", formattedValue); // ✅ Debugging formatted value
    
        // Update parent state
        setFormData((formData) => ({
            ...formData,
            [name]: formattedValue,
        }));
    
        // ✅ Ensure `onChange` is correctly called
        if (onChange) {
            //console.log("🟢 Calling onChange with:", name, formattedValue); // ✅ Debugging
            onChange(name, formattedValue);  // ✅ Fix: Only pass name, value (not object)
        }
    
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "",
        }));
    }
    

    // ENSURE TAB KEY AND SELECTS WORKS AS EXPECTED
    const handleKeyDown = (event, fieldName) => {
        if (event.key === "Tab") return; // Allow default tabbing behavior

        if (event.key === "Enter" || event.key === "ArrowDown") {
            event.preventDefault();

            // Find the next field in the form order
            const fieldNames = Object.keys(refs.current);
            const currentIndex = fieldNames.indexOf(fieldName);
            const nextField = fieldNames[currentIndex + 1];

            if (nextField && refs.current[nextField]) {
                refs.current[nextField].focus();

                // If it's a select field, open it using `showPicker()`
                if (refs.current[nextField].tagName === "SELECT" && refs.current[nextField].showPicker) {
                    refs.current[nextField].showPicker();
                }
            }
        }
    }
    
    // HANDLE FORM SUBMISSION
    async function handleSubmit(event) {
        event.preventDefault()
    
        let newErrors = {}
    
        // **Validation Rules**
        fields.forEach(({ name, required, validation }) => {
            const value = formData[name] !== undefined && formData[name] !== null 
            ? String(formData[name]).trim()  // ✅ Ensure it's always a string
            : ""
    
            // ✅ Only validate required fields
            if (required && (!value || value.trim() === "")) {
                newErrors[name] = "This field is required";
            }
    
            // Custom validation rules (e.g., regex)
            if (validation && !validation.regex.test(value)) {
                newErrors[name] = validation.message
            }
    
            // Email validation
            if (name === "email") {
                const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!value) {
                    newErrors.email = "This field is required";  // ✅ Fix missing required validation
                } else if (!emailPattern.test(value)) {
                    newErrors.email = "Enter a valid email address";
                }
            }
    
            // Phone validation (must be 10 digits)
            if (name === "phone") {
                const phoneDigits = value.replace(/\D/g, "") // Remove non-numeric characters
                if (!value) {
                    newErrors.phone = "This field is required"
                } else if (phoneDigits.length !== 10) {
                    newErrors.phone = "Enter a valid 10-digit phone number"
                }
            }
    
            // Apply custom validations from parent component
            if (customValidations[name]) {
                const customError = customValidations[name](value)
                if (customError) {
                    newErrors[name] = customError
                }
            }
        });
    
        // If there are errors, update state and stop submission
        if (Object.keys(newErrors).length > 0) {
            console.log("🔴 Validation errors detected:", newErrors); // Debugging
            setErrors(newErrors)  // ✅ Update errors state
            return;
        }
    
        // No errors, proceed with submission
        onSubmit(formData)
    }
     
    // HANDLE CLEAR ERRORS
    function handleClearErrors() {
        setErrors({})
    }


    // RENDER JSX
    return (
        <form onSubmit={handleSubmit}>
            {success && <SuccessAlert message={message} />}
            
            <div className="flex flex-row gap-5">
                {Array.from({ length: columns }).map((_, colIndex) => (
                    <div key={colIndex} className="flex flex-col w-[400px]">
                        {fields
                            .filter((_, index) => index % columns === colIndex)
                            .map(({ name, label, type, options, length, height, space, disabled, required }) => {
                                // Check if a custom component is provided
                                const CustomComponent = customComponents[name]

                                return (
                                    <div key={`${name || "field"}-${colIndex}`} className="mb-[-15px]">
                                        {CustomComponent ? (
                                            <CustomComponent
                                                label={label}
                                                name={name}
                                                value={formData[name]}
                                                //onChange={(val) => handleChange(name, val)}
                                                onChange={(name, val) => handleChange(name, val)}
                                                onKeyDown={(e) => handleKeyDown(e)}
                                                error={errors[name]}
                                                required={required}
                                            />
                                        ) : type === "text" || 
                                            type === "email" || 
                                            type === "phone" || 
                                            type === "numbers" ||
                                            type === "currency" ||
                                            type === "letters" ?
                                        (
                                            <InputGroup
                                                ref={(el) => (refs.current[name] = el)}
                                                label={label}
                                                type={type}
                                                length={length}
                                                name={name}
                                                space={space || null}
                                                disabled={!!disabled}
                                                value={formData[name] || ""}
                                                onChange={handleChange}
                                                onKeyDown={(e) => handleKeyDown(e, name)}
                                                error={errors[name]}  // ✅ Pass error state correctly
                                                required={required}
                                            />

                                        ) : type === "state" ? (
                                            <StateGroup
                                                ref={(el) => (refs.current[name] = el)}
                                                label={label}
                                                name={name}
                                                space={space || null}
                                                disabled={!!disabled}
                                                value={formData[name] || ""}
                                                onChange={(name, value) => handleChange(name, value)}
                                                error={errors?.[name]} // ✅ Ensure error is passed correctly
                                                required={required}
                                            />

                                        ) : type === "select" ? (
                                            <SelectGroup
                                                ref={(el) => (refs.current[name] = el)}
                                                label={label}
                                                name={name}
                                                space={space || null}
                                                disabled={!!disabled}
                                                value={formData[name] || ""}
                                                options={options || []}  // ✅ Prevent undefined options
                                                onChange={(name, value) => handleChange(name, value)}
                                                error={errors?.[name]}  // ✅ Ensure error is passed correctly
                                                required={required}
                                            />
                                        ) : type === "textarea" ? (
                                            <TextareaGroup
                                                label={label}
                                                name={name}
                                                space={space || null}
                                                disabled={!!disabled}
                                                value={formData[name] || ""}
                                                onChange={handleChange}
                                                error={errors[name]}
                                                height={height || "100px"}
                                                required={required}
                                            />
                                        ) : type === "date" ? (
                                            <DateGroup
                                                label={label}
                                                name={name}
                                                space={space || null}
                                                disabled={!!disabled}
                                                value={formData[name] || ""}
                                                onChange={handleChange}
                                                error={errors[name]}
                                                required={required}
                                            />
                                        ) : type === "numbers" && name === "zip" ? (
                                            <InputGroup
                                                label={label}
                                                type={type}
                                                length={length}
                                                name={name}
                                                space={space || null}
                                                disabled={!!disabled}
                                                value={formData[name] || ""}
                                                onChange={handleChange}
                                                error={errors[name]}
                                                required={required}
                                                tabIndex={0}
                                            />
                                        ) : type === "placeholder" ? (
                                            <div className="h-[0px] w-full" style={{ marginTop: space }} /> // Empty div to maintain layout
                                        ) : null}
                                    </div>
                                );
                            })}
                    </div>
                ))}
            </div>

            <div className="mt-[40px] ml-[20px] flex flex-row">
                <Button 
                    label={buttonLable} 
                    type={buttonType}
                    onClick={handleSubmit} 
                />
                
                <span className="mr-[15px]"></span>
                
                <Button 
                    label="Reset" 
                    type="outline"
                    onClick={() => {
                        setFormData(fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {}))
                        handleClearErrors()
                    }}
                />
            </div>
        </form>
    );
}
