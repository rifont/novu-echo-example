import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import React from "react";

const PROFESSIONS = ["Software Engineer", "Office Manager", "Builder", "Product Manager", "CEO"]
export const DEFAULT_PROFESSION = "Software Engineer";

type ProfessionSelectorProps = {
    onValueChange: (profession: string) => void;
    className?: string;
}

export const ProfessionSelector = (props: ProfessionSelectorProps) => {
    return (<>
        <Select name="profession" onValueChange={props.onValueChange}>
            <SelectTrigger className={props.className}>
                <SelectValue placeholder={DEFAULT_PROFESSION} />
            </SelectTrigger>
            <SelectContent>
                {PROFESSIONS.map((profession) => (
                    <SelectItem key={profession} value={profession}>
                        {profession}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </>)
}
