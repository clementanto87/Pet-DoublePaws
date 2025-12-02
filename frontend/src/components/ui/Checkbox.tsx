import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "../../lib/utils"

export interface CheckboxProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, onCheckedChange, onChange, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (onChange) {
                onChange(e);
            }
            if (onCheckedChange) {
                onCheckedChange(e.target.checked);
            }
        };

        return (
            <div className="relative flex items-center">
                <input
                    type="checkbox"
                    className={cn(
                        "peer h-5 w-5 shrink-0 appearance-none rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:border-primary transition-all duration-200 cursor-pointer",
                        className
                    )}
                    ref={ref}
                    onChange={handleChange}
                    {...props}
                />
                <Check className="absolute left-0.5 top-0.5 h-4 w-4 text-primary-foreground pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
            </div>
        )
    }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
