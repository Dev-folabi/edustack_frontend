"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Props {
  timeLeft: number;
  totalDuration: number;
}

const TimerCard = ({ timeLeft, totalDuration }: Props) => {
  const percent = Math.max(0, (timeLeft / totalDuration) * 100);

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const progressColor =
    percent > 50 ? "bg-green-500" : percent > 20 ? "bg-yellow-500" : "bg-red-500";

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-gray-700">⏳ Time Left</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-3xl font-extrabold text-center text-blue-600 tracking-wide">
          {formatTime(timeLeft)}
        </div>
        <Progress
          value={percent}
          className={`h-2 rounded-full ${progressColor}`}
        />
        <p className="text-xs text-center text-gray-500">
          {Math.round(percent)}% remaining
        </p>
      </CardContent>
    </Card>
  );
};

export default TimerCard;
