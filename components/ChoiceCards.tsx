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
    CardDescription,
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
const DEFAULT_PROFESSION = "Software Engineer"

export function ChoiceCards(props: ChoiceCardProps) {
    const [profession, setProfession] = React.useState<string>(DEFAULT_PROFESSION)
    const [messageOptions, setMessageOptions] = React.useState<Message[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const handleClick = (message: Message, index: number) => {
        props.onClick(message.message);
        setMessageOptions(messageOptions.filter((_, i) => i !== index));
    }
    const handleRefresh = (index: number) => {
        setMessageOptions(messageOptions.filter((_, i) => i !== index));
    }
    const fetchData = async () => {
        setIsLoading(true);
        const res = await fetch("/api/notifications?profession=" + profession);
        const data = await res.json();
        setMessageOptions((prev) => prev.concat(data.messages));
        setIsLoading(false);
    }

    React.useEffect(() => {
        if (messageOptions.length <= Math.floor(SAMPLE_PROMPT_COUNT / 2)) {
            fetchData();
        }
    }, [messageOptions.length, profession]);

    return (
        <div>
            <div className="flex flex-row justify-center items-center my-4">
                <Label className="mr-4" htmlFor="profession">Sample Profession</Label>
                <Select name="profession" onValueChange={(value) => {
                    setProfession(value);
                    setMessageOptions([]);
                }}>
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
                {isLoading ? Array.from({ length: SAMPLE_PROMPT_COUNT }, (_, index) => (
                    <div className="flex flex-col space-y-3" key={index}>
                        <Skeleton className="h-[320px] w-[250px] rounded-xl" />
                    </div>)) : messageOptions.map((message, index) => (
                        <Card className="w-[250px] h-[320px] flex flex-col justify-between" key={index}>
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
            </div>
        </div>)
}
