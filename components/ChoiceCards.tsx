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

export function ChoiceCards(props: ChoiceCardProps) {
    const [profession, setProfession] = React.useState<string>("Software Engineer")
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
        console.log("fetching data")
        const res = await fetch("/api/notifications?profession=" + profession);
        const data = await res.json();
        setMessageOptions((prev) => prev.concat(data.messages));
        setIsLoading(false);
    }

    React.useEffect(() => {
        if (messageOptions.length <= 3) {
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
              <SelectItem value="Software Engineer">Software Engineer</SelectItem>
              <SelectItem value="Office Manager">Office Manager</SelectItem>
              <SelectItem value="Builder">Builder</SelectItem>
            </SelectContent>
          </Select>
      </div>
        <div className="flex flex-row gap-2 overflow-auto">
            {isLoading ? Array.from({ length: 3 }, (_, index) => (
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
                        <Button onClick={() => handleRefresh(index)}>Refresh ♻︎</Button>
                        <Button onClick={() => handleClick(message, index)}>Send ⇨</Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    </div>)
}
