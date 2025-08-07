import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useVoice } from "@/hooks/use-voice";

interface VoiceControllerProps {
  onCommand?: (command: string) => void;
  className?: string;
}

export function VoiceController({ onCommand, className = "" }: VoiceControllerProps) {
  const [isActive, setIsActive] = useState(false);
  const { isListening, startListening, stopListening, transcript, isSupported } = useVoice();

  if (!isSupported) {
    return null;
  }

  const handleToggle = () => {
    if (isListening) {
      stopListening();
      setIsActive(false);
    } else {
      startListening();
      setIsActive(true);
    }
  };

  // Process voice commands when transcript changes
  if (transcript && onCommand) {
    onCommand(transcript);
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        variant={isActive ? "default" : "outline"}
        size="sm"
        onClick={handleToggle}
        className={`${
          isActive 
            ? "bg-cream-500 hover:bg-cream-600 text-white animate-pulse" 
            : "border-cream-300 text-cream-700 hover:bg-cream-50"
        } transition-all`}
        title={isActive ? "Desativar controle por voz" : "Ativar controle por voz"}
        data-testid="button-voice-toggle"
      >
        {isListening ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
      
      {isActive && (
        <div className="text-xs text-cream-600">
          {isListening ? (
            <span className="flex items-center">
              <span className="animate-pulse mr-1">🎤</span>
              Ouvindo...
            </span>
          ) : (
            'Controle por voz ativo'
          )}
        </div>
      )}
    </div>
  );
}
