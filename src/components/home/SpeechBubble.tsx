import React, { useState, useEffect } from "react";

const SpeechBubble = () => {
  const messages = [
    "I started this journey thinking I'd be rich in 6 months. Now I celebrate every 1000 kr like it's a million...",
    "My efficiency multiplier is finally at 5x! Too bad 5 x almost nothing is still almost nothing...",
    "Emergency funding activated! Time to explain to my parents why their retirement savings are now 'angel investment in the future of Norway'...",
    "Power networking mode engaged! For the next 30 seconds, even Skatteetaten wants to help me succeed!",
  ];

  const [currentMessage, setCurrentMessage] = useState(messages[0]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);
        setIsVisible(true);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-0 right-0 transform translate-x-[-30%] translate-y-[-30%]">
      <div className="relative">
        {/* Speech Bubble */}
        <div 
          className={`
            bg-background backdrop-blur-sm rounded-2xl p-4 max-w-xs
            border border-primary/20 shadow-lg
            transition-all duration-500 ease-in-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <p className="text-sm text-muted-foreground">{currentMessage}</p>
          
          {/* Speech Bubble Tail */}
          <div className="absolute -bottom-3 right-6 w-6 h-6 
            bg-background backdrop-blur-sm
            border-r border-b border-primary/20
            transform rotate-45
          " />
        </div>
      </div>
    </div>
  );
};

export default SpeechBubble;
