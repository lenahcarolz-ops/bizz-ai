import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Volume2, VolumeX, Calendar, Download } from "lucide-react";
import { AiRecommendationCard } from "@/components/ai-recommendation-card";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { useState } from "react";

export default function Results() {
  const [, setLocation] = useLocation();
  const [isReading, setIsReading] = useState(false);
  const { speak, speaking, stop, supported } = useSpeechSynthesis();

  // Get profileId from URL query params
  const params = new URLSearchParams(window.location.search);
  const profileId = params.get('profileId');

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/stack', profileId],
    enabled: !!profileId,
  });

  const handleReadResults = () => {
    if (speaking) {
      stop();
      setIsReading(false);
    } else {
      const textToRead = `
        ${data?.stack?.title}. 
        ${data?.stack?.description}. 
        Análise: ${data?.stack?.overallAnalysis}. 
        Suas recomendações incluem: ${data?.recommendations?.map((r: any) => r.toolName).join(', ')}.
        Economia estimada: ${data?.stack?.estimatedSavings}.
      `;
      speak(textToRead);
      setIsReading(true);
    }
  };

  if (!profileId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-cream-100 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">Profile ID não encontrado.</p>
            <Button onClick={() => setLocation('/')} data-testid="button-go-home">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-cream-100 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-cream-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Carregando sua Stack de IA...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-cream-100 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">Erro ao carregar os resultados.</p>
            <Button onClick={() => setLocation('/')} data-testid="button-error-home">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { stack, recommendations } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-cream-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <Button 
              variant="outline" 
              onClick={() => setLocation('/questionnaire')}
              data-testid="button-back-questionnaire"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Questionário
            </Button>
            
            {supported && (
              <Button
                variant="outline"
                onClick={handleReadResults}
                disabled={!data}
                data-testid="button-read-results"
              >
                {speaking ? <VolumeX className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
                {speaking ? 'Parar Leitura' : 'Ouvir Resultados'}
              </Button>
            )}
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="text-stack-title">
              <span className="mr-3">🏆</span>
              {stack.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6" data-testid="text-stack-description">
              {stack.description}
            </p>
            <div className="inline-block px-6 py-2 bg-cream-100 text-cream-700 rounded-full text-sm font-medium">
              Stack gerada com IA personalizada
            </div>
          </div>
        </div>

        {/* Analysis Section */}
        <Card className="mb-8 border-cream-200">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-3">📊</span>
              Análise do Seu Negócio
            </h2>
            <p className="text-gray-700 leading-relaxed" data-testid="text-analysis">
              {stack.overallAnalysis}
            </p>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            <span className="mr-3">🚀</span>
            Suas Ferramentas Recomendadas
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {recommendations?.map((recommendation: any) => (
              <AiRecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
              />
            ))}
          </div>
        </div>

        {/* Implementation Tips */}
        {stack.implementationTips && stack.implementationTips.length > 0 && (
          <Card className="mb-8 border-cream-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">💡</span>
                Dicas de Implementação
              </h3>
              <ul className="space-y-3">
                {stack.implementationTips.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="text-cream-600 mt-1">✓</span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Estimated Savings */}
        {stack.estimatedSavings && (
          <Card className="mb-12 border-l-4 border-l-cream-500 bg-cream-50">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">💰</span>
                Economia Estimada
              </h3>
              <p className="text-gray-700 text-lg" data-testid="text-estimated-savings">
                {stack.estimatedSavings}
              </p>
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <Card className="bg-gradient-to-br from-cream-100 to-cream-200 border-cream-300">
          <CardContent className="p-8 lg:p-12 text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Quer implementar sua Stack personalizada?
            </h3>
            <p className="text-gray-700 mb-8 max-w-2xl mx-auto text-lg">
              Agende uma sessão de estratégia personalizada para implementar essas 
              automações no seu negócio com nossa ajuda especializada.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button
                size="lg"
                onClick={() => setLocation('/checkout')}
                className="bg-gradient-to-r from-cream-500 to-cream-600 hover:from-cream-600 hover:to-cream-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                data-testid="button-book-strategy"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Agendar Estratégia - R$ 197
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-cream-300 text-cream-700 hover:bg-cream-50"
                data-testid="button-download-pdf"
              >
                <Download className="h-5 w-5 mr-2" />
                Baixar PDF da Stack
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 mt-6">
              📧 Sua Stack também foi enviada por e-mail com todos os detalhes
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
