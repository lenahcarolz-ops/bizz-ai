import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Mic } from "lucide-react";
import { VoiceController } from "@/components/voice-controller";
import { useVoice } from "@/hooks/use-voice";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  businessType: string;
  teamSize: string;
  objective: string;
  currentTools: string[];
  otherTools: string;
  aiKnowledge: string;
  name: string;
  email: string;
}

export default function Questionnaire() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    businessType: "",
    teamSize: "",
    objective: "",
    currentTools: [],
    otherTools: "",
    aiKnowledge: "",
    name: "",
    email: "",
  });

  const { toast } = useToast();
  const { isListening, startListening, transcript, resetTranscript } = useVoice();

  const generateStackMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/generate-stack", data);
      return response.json();
    },
    onSuccess: (result) => {
      setLocation(`/results?profileId=${result.profileId}`);
    },
    onError: (error) => {
      toast({
        title: "Erro ao gerar Stack",
        description: "Ocorreu um erro ao processar suas informações. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleVoiceInput = (field: keyof FormData, expectedValues?: string[]) => {
    startListening();
    
    // In a real implementation, you would process the voice input
    // and match it to the appropriate form values
    setTimeout(() => {
      if (transcript) {
        const lowerTranscript = transcript.toLowerCase();
        
        if (field === 'businessType') {
          if (lowerTranscript.includes('ecommerce') || lowerTranscript.includes('loja online')) {
            setFormData(prev => ({ ...prev, businessType: 'ecommerce' }));
          } else if (lowerTranscript.includes('agência') || lowerTranscript.includes('marketing')) {
            setFormData(prev => ({ ...prev, businessType: 'agencia' }));
          } else if (lowerTranscript.includes('consultoria')) {
            setFormData(prev => ({ ...prev, businessType: 'consultoria' }));
          } else if (lowerTranscript.includes('saas') || lowerTranscript.includes('software')) {
            setFormData(prev => ({ ...prev, businessType: 'saas' }));
          }
        }
        
        resetTranscript();
      }
    }, 3000);
  };

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    if (lowerCommand.includes('próximo') || lowerCommand.includes('próxima')) {
      handleNext();
    } else if (lowerCommand.includes('anterior')) {
      handlePrevious();
    }
  };

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!formData.businessType;
      case 2:
        return !!formData.teamSize;
      case 3:
        return !!formData.objective;
      case 4:
        return true; // Optional step
      case 5:
        return !!formData.aiKnowledge && !!formData.name && !!formData.email;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      generateStackMutation.mutate(formData);
    }
  };

  const handleToolToggle = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      currentTools: prev.currentTools.includes(tool)
        ? prev.currentTools.filter(t => t !== tool)
        : [...prev.currentTools, tool]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-cream-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="outline" 
              onClick={() => setLocation('/')}
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <VoiceController onCommand={handleVoiceCommand} />
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Progresso</span>
            <span className="text-sm text-cream-600 font-medium" data-testid="text-progress">
              {currentStep} de {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="border-cream-200 shadow-xl">
          <CardContent className="p-8 lg:p-12">
            {/* Step 1: Business Type */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-2xl">🏢</span>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Qual é o tipo do seu negócio?
                  </h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { value: 'ecommerce', label: 'E-commerce', icon: '🛒', desc: 'Vendas online, produtos físicos/digitais' },
                    { value: 'agencia', label: 'Agência/Marketing', icon: '📢', desc: 'Serviços para outros negócios' },
                    { value: 'consultoria', label: 'Consultoria', icon: '🤝', desc: 'Conhecimento especializado' },
                    { value: 'saas', label: 'SaaS/Tech', icon: '☁️', desc: 'Software como serviço' },
                  ].map((option) => (
                    <label key={option.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="businessType"
                        value={option.value}
                        checked={formData.businessType === option.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
                        className="sr-only peer"
                        data-testid={`radio-business-${option.value}`}
                      />
                      <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-cream-300 peer-checked:border-cream-500 peer-checked:bg-cream-50 transition-all">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{option.icon}</span>
                          <span className="font-medium">{option.label}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVoiceInput('businessType')}
                    disabled={isListening}
                    data-testid="button-voice-business-type"
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    {isListening ? 'Ouvindo...' : 'Responder por voz'}
                  </Button>
                  <span className="text-sm text-gray-500">
                    Diga: "e-commerce", "agência", "consultoria" ou "saas"
                  </span>
                </div>
              </div>
            )}

            {/* Step 2: Team Size */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-2xl">👥</span>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Qual o tamanho da sua equipe?
                  </h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { value: 'solo', label: 'Apenas eu (1 pessoa)' },
                    { value: 'small', label: 'Pequena equipe (2-10)' },
                    { value: 'medium', label: 'Média empresa (11-50)' },
                    { value: 'large', label: 'Grande empresa (50+)' },
                  ].map((option) => (
                    <label key={option.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="teamSize"
                        value={option.value}
                        checked={formData.teamSize === option.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, teamSize: e.target.value }))}
                        className="sr-only peer"
                        data-testid={`radio-team-${option.value}`}
                      />
                      <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-cream-300 peer-checked:border-cream-500 peer-checked:bg-cream-50 transition-all">
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Objective */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-2xl">🎯</span>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Qual seu principal objetivo?
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {[
                    { value: 'tempo', label: 'Ganhar tempo automatizando tarefas repetitivas', icon: '⏰' },
                    { value: 'leads', label: 'Gerar mais leads e vendas', icon: '📈' },
                    { value: 'custos', label: 'Reduzir custos operacionais', icon: '💰' },
                  ].map((option) => (
                    <label key={option.value} className="cursor-pointer block">
                      <input
                        type="radio"
                        name="objective"
                        value={option.value}
                        checked={formData.objective === option.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
                        className="sr-only peer"
                        data-testid={`radio-objective-${option.value}`}
                      />
                      <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-cream-300 peer-checked:border-cream-500 peer-checked:bg-cream-50 transition-all">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{option.icon}</span>
                          <span className="font-medium">{option.label}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Current Tools */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-2xl">🔧</span>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Que ferramentas você já usa? (Opcional)
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    {['Zapier', 'ChatGPT', 'Canva', 'Notion', 'HubSpot', 'Make'].map((tool) => (
                      <label key={tool} className="cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.currentTools.includes(tool)}
                          onChange={() => handleToolToggle(tool)}
                          className="sr-only peer"
                          data-testid={`checkbox-tool-${tool.toLowerCase()}`}
                        />
                        <span className="px-4 py-2 border-2 border-gray-200 rounded-lg hover:border-cream-300 peer-checked:border-cream-500 peer-checked:bg-cream-50 transition-all inline-block">
                          {tool}
                        </span>
                      </label>
                    ))}
                  </div>
                  
                  <Textarea
                    placeholder="Outras ferramentas (opcional)..."
                    value={formData.otherTools}
                    onChange={(e) => setFormData(prev => ({ ...prev, otherTools: e.target.value }))}
                    className="border-cream-200 focus:border-cream-500"
                    data-testid="textarea-other-tools"
                  />
                </div>
              </div>
            )}

            {/* Step 5: AI Knowledge & Contact */}
            {currentStep === 5 && (
              <div className="space-y-8">
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-2xl">🎓</span>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Qual seu nível de conhecimento em IA?
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {[
                    { value: 'iniciante', label: 'Iniciante - Pouca ou nenhuma experiência', color: 'bg-gray-300' },
                    { value: 'intermediario', label: 'Intermediário - Já usei algumas ferramentas de IA', color: 'bg-cream-400' },
                    { value: 'avancado', label: 'Avançado - Experiente com automações e IA', color: 'bg-cream-600' },
                  ].map((option) => (
                    <label key={option.value} className="cursor-pointer block">
                      <input
                        type="radio"
                        name="aiKnowledge"
                        value={option.value}
                        checked={formData.aiKnowledge === option.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, aiKnowledge: e.target.value }))}
                        className="sr-only peer"
                        data-testid={`radio-knowledge-${option.value}`}
                      />
                      <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-cream-300 peer-checked:border-cream-500 peer-checked:bg-cream-50 transition-all">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 ${option.color} rounded`}></div>
                          <span className="font-medium">{option.label}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Para enviar sua Stack personalizada:
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="border-cream-200 focus:border-cream-500"
                      data-testid="input-name"
                    />
                    <Input
                      type="email"
                      placeholder="Seu melhor e-mail"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="border-cream-200 focus:border-cream-500"
                      data-testid="input-email"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-200 mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                data-testid="button-previous"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              
              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!validateCurrentStep()}
                  className="bg-gradient-to-r from-cream-500 to-cream-600 hover:from-cream-600 hover:to-cream-700"
                  data-testid="button-next"
                >
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!validateCurrentStep() || generateStackMutation.isPending}
                  className="bg-gradient-to-r from-cream-500 to-cream-600 hover:from-cream-600 hover:to-cream-700"
                  data-testid="button-generate-stack"
                >
                  {generateStackMutation.isPending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Gerando sua Stack...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">✨</span>
                      Gerar Minha Stack de IA
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
