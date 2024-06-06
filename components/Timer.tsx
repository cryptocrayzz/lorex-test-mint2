import { Dispatch, SetStateAction, useEffect, useState } from "react";

const Timer = ({
    solanaTime,
    toTime,
    setCheckEligibility,
  }: {
    solanaTime: bigint;
    toTime: bigint;
    setCheckEligibility: Dispatch<SetStateAction<boolean>>;
  }) => {
    const [remainingTime, setRemainingTime] = useState<bigint>(
      toTime - solanaTime
    );
    useEffect(() => {
      const interval = setInterval(() => {
        setRemainingTime((prev) => {
          return prev - BigInt(1);
        });
      }, 1000);
      return () => clearInterval(interval);
    }, []);
  
    //convert the remaining time in seconds to the amount of days, hours, minutes and seconds left
    const days = remainingTime / BigInt(86400);
    const hours = (remainingTime % BigInt(86400)) / BigInt(3600);
    const minutes = (remainingTime % BigInt(3600)) / BigInt(60);
    const seconds = remainingTime % BigInt(60);
    
    if (days > BigInt(0)) {
        return (
            <div className="text-6xl text-center flex w-full items-center justify-center">
                <div className="w-20 mx-1 p-2 bg-white text-yellow-500 rounded-lg">
                    <div className="font-mono leading-none text-base" x-text="days">
                        {days.toLocaleString("en-US", {
                            minimumIntegerDigits: 2,
                            useGrouping: false,
                        })}
                    </div>
                    <div className="font-mono uppercase text-sm leading-none">Days</div>
                </div>
                <div className="w-20 mx-1 p-2 bg-white text-yellow-500 rounded-lg">
                    <div className="font-mono leading-none text-base" x-text="hours">
                        {hours.toLocaleString("en-US", {
                            minimumIntegerDigits: 2,
                            useGrouping: false,
                        })}
                    </div>
                    <div className="font-mono uppercase text-sm leading-none">Hours</div>
                </div>
                <div className="w-20 mx-1 p-2 bg-white text-yellow-500 rounded-lg">
                    <div className="font-mono leading-none text-base" x-text="minutes">
                        {minutes.toLocaleString("en-US", {
                            minimumIntegerDigits: 2,
                            useGrouping: false,
                        })}
                    </div>
                    <div className="font-mono uppercase text-sm leading-none">Minutes</div>
                </div>
                <div className="w-20 mx-1 p-2 bg-white text-yellow-500 rounded-lg">
                    <div className="font-mono leading-none text-base" x-text="seconds">
                        {seconds.toLocaleString("en-US", {
                            minimumIntegerDigits: 2,
                            useGrouping: false,
                        })}
                    </div>
                    <div className="font-mono uppercase text-sm leading-none">Seconds</div>
                </div>
            </div>
        )
    }
    if (hours > BigInt(0)) {
        return (
            <div className="text-6xl text-center flex w-full items-center justify-center">
                <div className="w-20 mx-1 p-2 bg-white text-yellow-500 rounded-lg">
                    <div className="font-mono leading-none text-base" x-text="hours">
                        {hours.toLocaleString("en-US", {
                            minimumIntegerDigits: 2,
                            useGrouping: false,
                        })}
                    </div>
                    <div className="font-mono uppercase text-sm leading-none">Hours</div>
                </div>
                <div className="w-20 mx-1 p-2 bg-white text-yellow-500 rounded-lg">
                    <div className="font-mono leading-none text-base" x-text="minutes">
                        {minutes.toLocaleString("en-US", {
                            minimumIntegerDigits: 2,
                            useGrouping: false,
                        })}
                    </div>
                    <div className="font-mono uppercase text-sm leading-none">Minutes</div>
                </div>
                <div className="w-20 mx-1 p-2 bg-white text-yellow-500 rounded-lg">
                    <div className="font-mono leading-none text-base" x-text="seconds">
                        {seconds.toLocaleString("en-US", {
                            minimumIntegerDigits: 2,
                            useGrouping: false,
                        })}
                    </div>
                    <div className="font-mono uppercase text-sm leading-none">Seconds</div>
                </div>
            </div>
        )
    }
    if (minutes > BigInt(0) || seconds > BigInt(0)) {
        return (
            <div className="text-6xl text-center flex w-full items-center justify-center">
                <div className="w-20 mx-1 p-2 bg-white text-yellow-500 rounded-lg">
                    <div className="font-mono leading-none text-base" x-text="minutes">
                        {minutes.toLocaleString("en-US", {
                            minimumIntegerDigits: 2,
                            useGrouping: false,
                        })}
                    </div>
                    <div className="font-mono uppercase text-sm leading-none">Minutes</div>
                </div>
                <div className="w-20 mx-1 p-2 bg-white text-yellow-500 rounded-lg">
                    <div className="font-mono leading-none text-base" x-text="seconds">
                        {seconds.toLocaleString("en-US", {
                            minimumIntegerDigits: 2,
                            useGrouping: false,
                        })}
                    </div>
                    <div className="font-mono uppercase text-sm leading-none">Seconds</div>
                </div>
            </div>
        )
    }

    if (remainingTime === BigInt(0)) {
        setCheckEligibility(true);
    }
    return <div></div>;
};

export default Timer