import { useStopwatch } from "react-timer-hook";
import { useTimer } from "react-timer-hook";
import { useEffect } from "react";
import { VscDebugStart } from "react-icons/vsc";
import { IoMdPause } from "react-icons/io";

const StopWatch = ({ shouldStart, onTimeUpdate }) => {
  const { seconds, minutes, start, pause, reset } = useStopwatch({
    autoStart: false,
  });
  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(minutes * 60 + seconds);
    }
  }, [seconds]);
   useEffect(() => {
   if (shouldStart) {
    pause();
    reset(undefined, false);
    setTimeout(() => start(), 50);
  } else {
    pause();
    reset(undefined, false);
  }
  }, [shouldStart]);
  
  return (
    <div>
      {" "}
      <div className="flex flex-col items-center">
        <p className="text-lg align-middle">
         Total workout time<br/> {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </p>
       
      </div>
    </div>
  );
};

const Timer = ({ expirySeconds }) => {
  const expiryTimestamp = new Date();
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + expirySeconds);

  const { seconds, minutes, start, pause, restart } = useTimer({
    expiryTimestamp,
    autoStart: false,
    onExpire: () => {
      const newExpiry = new Date();
      newExpiry.setSeconds(newExpiry.getSeconds() + expirySeconds);
      restart(newExpiry, false);
    },
  });
  useEffect(() => {
    const newExpiry = new Date();
    newExpiry.setSeconds(newExpiry.getSeconds() + expirySeconds);
    restart(newExpiry, false); // restart with new time, don't autostart
  }, [expirySeconds]);

  return (
    <div className="flex flex-col items-center">
      <p>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </p>
      <div>
      <button className="btn" onClick={start}>
        <VscDebugStart className="h-5 w-5"/>
      </button>
      <button className="btn" onClick={pause}>
        <IoMdPause className="h-5 w-5"/>
      </button>
      </div>    
    </div>
  );
};

export { StopWatch, Timer };
