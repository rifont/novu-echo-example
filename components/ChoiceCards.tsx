import * as React from "react"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "./ui/label"
import { Skeleton } from "./ui/skeleton"

type Message = {
    message: string;
    category: string;
}

type ChoiceCardProps = {
    onClick: (message: string) => void;
}

const SAMPLE_PROMPT_COUNT = 6;
const PROFESSIONS = ["Software Engineer", "Office Manager", "Builder", "Product Manager", "CEO"]
const DEFAULT_PROFESSION = "Software Engineer";
const TRANSITION_DURATION = 300;

export function ChoiceCards(props: ChoiceCardProps) {
    const [profession, setProfession] = React.useState<string>(DEFAULT_PROFESSION)
    const [messageOptions, setMessageOptions] = React.useState<Message[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [exitingIndex, setExitingIndex] = React.useState<number | null>(null);
    const [exitingDirection, setExitingDirection] = React.useState<100 | -100 | 0>(0);

    const handleClick = React.useCallback((message: Message, index: number) => {
        props.onClick(message.message);
        setExitingIndex(index);
        setExitingDirection(-100);
        setTimeout(() => {
            setMessageOptions(messageOptions.filter((_, i) => i !== index));
            setExitingIndex(null); // Reset the exiting index
            setExitingDirection(0); // Reset the exiting direction
        }, TRANSITION_DURATION); // This should match the duration of the CSS transition
    }, [props, messageOptions, setExitingIndex, setExitingDirection, setMessageOptions]);
    
    const handleRefresh = React.useCallback((index: number) => {
        setExitingIndex(index);
        setExitingDirection(100);
        setTimeout(() => {
            setMessageOptions(messageOptions.filter((_, i) => i !== index));
            setExitingIndex(null); // Reset the exiting index
            setExitingDirection(0); // Reset the exiting direction
        }, TRANSITION_DURATION); // This should match the duration of the CSS transition
    }, [messageOptions, setExitingIndex, setExitingDirection, setMessageOptions]);

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        const res = await fetch("/api/notifications?profession=" + profession);
        const data = await res.json();
        setMessageOptions((prev) => prev.concat(data.messages));
        setIsLoading(false);
    }, [profession]);

    React.useEffect(() => {
        if (messageOptions.length <= Math.floor(SAMPLE_PROMPT_COUNT / 2)) {
            fetchData();
        }
    }, [messageOptions.length, profession, fetchData]);

    React.useEffect(() => {
        setMessageOptions([]);
    }, [profession]);

    return (
        <div>
            <div className="flex flex-row justify-center items-center my-4">
                <Label className="mr-4" htmlFor="profession">Sample Profession</Label>
                <Select name="profession" onValueChange={setProfession}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={profession} />
                    </SelectTrigger>
                    <SelectContent>
                        {PROFESSIONS.map((profession) => (
                            <SelectItem key={profession} value={profession}>
                                {profession}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-row gap-2 overflow-auto">
                {messageOptions.map((message, index) => (
                        <Card className={`w-[250px] h-[320px] flex flex-col justify-between transition-all duration-${TRANSITION_DURATION} ${exitingIndex === index ? `translate-y-[${exitingDirection}%] opacity-0` : ''}`} key={index}>
                            <CardHeader>
                                <CardTitle>{message.category}</CardTitle>
                            </CardHeader>
                            <CardContent className="mb-auto">
                                <div className={`text-${message.category}-500 text-sm`}>{message.message}</div>
                            </CardContent>
                            <CardFooter className="flex flex-row gap-2 ">
                                <Button onClick={() => handleRefresh(index)}>Discard ♻︎</Button>
                                <Button onClick={() => handleClick(message, index)}>Send ⇨</Button>
                            </CardFooter>
                        </Card>
                    ))}
                    {isLoading && Array.from({ length: SAMPLE_PROMPT_COUNT - messageOptions.length }, (_, index) => (
                        <div className="flex flex-col space-y-3" key={index}>
                            <Skeleton className="h-[320px] w-[250px] rounded-xl" />
                        </div>
                    ))}
            </div>
        </div>)
}
