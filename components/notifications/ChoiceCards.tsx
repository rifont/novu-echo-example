import * as React from "react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "../ui/label"

type Message = {
    message: string;
    category: string;
}

type ChoiceCardProps = {
    onClick: (message: string) => void;
    profession: string;
}

const SAMPLE_PROMPT_COUNT = 6;
const TRANSITION_DURATION = 300;

export function ChoiceCards(props: ChoiceCardProps) {
    const [messageOptions, setMessageOptions] = React.useState<Message[]>([]);
    const [exitingIndex, setExitingIndex] = React.useState<number | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    const removeAtIndex = React.useCallback((index: number, direction: 100 | -100) => {
        setExitingIndex(index);
        setTimeout(() => {
            setMessageOptions(messageOptions.filter((_, i) => i !== index));
            setExitingIndex(null); // Reset the exiting index
        }, TRANSITION_DURATION); // This should match the duration of the CSS transition
    }, [messageOptions, setExitingIndex, setMessageOptions]);

    const handleClick = React.useCallback((message: Message, index: number) => {
        props.onClick(message.message);
        removeAtIndex(index, -100);
    }, [props, removeAtIndex]);
    
    const handleRefresh = React.useCallback((index: number) => {
        removeAtIndex(index, 100);
    }, [removeAtIndex]);

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        const res = await fetch("/api/notifications?profession=" + props.profession);
        const data = await res.json();
        setMessageOptions((prev) => prev.concat(data.messages));
        setIsLoading(false);
    }, [props.profession]);

    React.useEffect(() => {
        if (messageOptions.length <= Math.floor(SAMPLE_PROMPT_COUNT / 2)) {
            fetchData();
        }
    }, [messageOptions.length, props.profession, fetchData]);

    React.useEffect(() => {
        setMessageOptions([]);
    }, [props.profession]);

    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Send</h3>
            <div className="flex flex-row gap-2 overflow-auto border border-foreground/10 rounded-md p-3 shadow-inner no-scrollbar">
                {messageOptions.map((message, index) => (
                        <Card className={`flex flex-col transition-all duration-${TRANSITION_DURATION} ${exitingIndex === index ? `opacity-0` : ''}`} key={index}>
                            <div className="h-[300px] w-[250px] flex flex-col justify-between">
                                <CardHeader>
                                    <CardTitle>{message.category}</CardTitle>
                                </CardHeader>
                                <CardContent className="mb-auto">
                                    <div className={`text-${message.category}-500 text-sm`}>{message.message}</div>
                                </CardContent>
                                <CardFooter className="flex flex-row justify-between gap-2">
                                    <Button onClick={() => handleRefresh(index)}>Discard ♻︎</Button>
                                    <Button onClick={() => handleClick(message, index)}>Send ⇨</Button>
                                </CardFooter>
                            </div>
                        </Card>
                    ))}
                    {isLoading && Array.from({ length: SAMPLE_PROMPT_COUNT - messageOptions.length }, (_, index) => (
                        <div className="flex flex-col" key={index}>
                            <Skeleton className="h-[300px] w-[250px] rounded-xl" />
                        </div>
                    ))}
            </div>
        </div>)
}
