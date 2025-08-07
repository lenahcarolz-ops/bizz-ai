import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { Mic, Send, Volume2, MessageSquare } from "lucide-react";
import { VoiceController } from "@/components/voice-controller";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { useState } from "react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { speak, speaking, supported } = useSpeechSynthesis();
  const [consultation, setConsultation] = useState("");

  const handleGetStarted = () => {
    setLocation("/questionnaire");
  };

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    if (
      lowerCommand.includes("começar") &&
      lowerCommand.includes("diagnóstico")
    ) {
      handleGetStarted();
    }
  };

  const handleConsultationSubmit = () => {
    if (consultation.trim()) {
      // Process consultation input
      console.log("Consultation:", consultation);
      // You can add logic here to process the consultation
      setLocation("/questionnaire");
    }
  };

  const speakIntro = () => {
    speak(
      "Bem-vindo ao Bizz AI. Digite sua consulta ou use o microfone para falar conosco.",
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Minimalist Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🧠</span>
              </div>
              <span className="text-2xl font-light text-slate-800">
                Bizz AI
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Minimalist Design */}
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <div className="w-full max-w-2xl">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-light text-slate-800 mb-4 leading-tight">
              Como posso ajudar você hoje?
            </h1>
            <p className="text-lg text-slate-600 font-light">
              Digite sua consulta ou use o microfone para uma conversa natural
            </p>
          </div>

          {/* Consultation Input Box */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="relative">
                  <Textarea
                    placeholder="Descreva seu negócio, desafios ou objetivos que gostaria de discutir..."
                    value={consultation}
                    onChange={(e) => setConsultation(e.target.value)}
                    className="min-h-[120px] text-lg border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Voice Controller */}
                    <VoiceController onCommand={handleVoiceCommand} />

                    {/* TTS Button */}
                    {supported && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={speakIntro}
                        disabled={speaking}
                        className="border-slate-300 hover:bg-slate-50"
                      >
                        <Volume2 className="h-4 w-4 mr-2" />
                        {speaking ? "Falando..." : "Ouvir"}
                      </Button>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleConsultationSubmit}
                    disabled={!consultation.trim()}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Consulta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 mb-4">
              Ou comece com nosso diagnóstico rápido:
            </p>
            <Button
              onClick={handleGetStarted}
              variant="outline"
              className="border-slate-300 hover:bg-slate-50 text-slate-700"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Diagnóstico Gratuito em 5 minutos
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
