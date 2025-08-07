import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Shield, Clock } from "lucide-react";
import { VoiceController } from "@/components/voice-controller";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) : Promise.resolve(null);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
    });

    if (error) {
      toast({
        title: "Erro no Pagamento",
        description: error.message || "Ocorreu um erro ao processar o pagamento",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Pagamento Realizado!",
        description: "Sua sessão de estratégia foi agendada com sucesso!",
      });
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-6 bg-cream-50 rounded-xl border border-cream-200">
        <PaymentElement
          options={{
            layout: "tabs",
            defaultValues: {
              billingDetails: {
                address: {
                  country: 'BR',
                }
              }
            }
          }}
        />
      </div>
      
      <Button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full bg-gradient-to-r from-cream-500 to-cream-600 hover:from-cream-600 hover:to-cream-700 text-white py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        data-testid="button-confirm-payment"
      >
        {isProcessing ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Processando Pagamento...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Confirmar Pagamento - R$ 197
          </>
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { speak, speaking, supported } = useSpeechSynthesis();

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    if (lowerCommand.includes('voltar')) {
      setLocation('/');
    } else if (lowerCommand.includes('confirmar') && lowerCommand.includes('pagamento')) {
      // Voice command to confirm payment would be handled by the form
    }
  };

  const speakCheckoutInfo = () => {
    speak("Página de checkout para sessão de estratégia. Valor: cento e noventa e sete reais. Preencha os dados do cartão para confirmar o pagamento.");
  };

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    setLoading(true);
    apiRequest("POST", "/api/create-payment-intent", { amount: 19700 })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setLoading(false);
      })
      .catch((error) => {
        toast({
          title: "Erro",
          description: "Erro ao carregar a página de pagamento",
          variant: "destructive",
        });
        setLoading(false);
      });
  }, []);

  if (loading || !clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-cream-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-cream-500 border-t-transparent rounded-full mx-auto mb-4" aria-label="Loading"/>
            <p className="text-gray-600">Carregando checkout...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Make SURE to wrap the form in <Elements> which provides the stripe context.
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-cream-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <Button 
              variant="outline" 
              onClick={() => setLocation('/')}
              className="border-cream-300 text-cream-700 hover:bg-cream-50"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            <div className="flex items-center space-x-3">
              <VoiceController onCommand={handleVoiceCommand} />
              {supported && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={speakCheckoutInfo}
                  disabled={speaking}
                  className="border-cream-300 text-cream-700 hover:bg-cream-50"
                  data-testid="button-speak-checkout"
                >
                  🔊 {speaking ? 'Falando...' : 'Ouvir'}
                </Button>
              )}
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              <span className="mr-3">💳</span>
              Finalizar Compra
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sessão de estratégia personalizada para implementar sua Stack de IA
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="border-cream-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Resumo do Pedido</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">Sessão de Estratégia Personalizada</h4>
                      <p className="text-sm text-gray-600 mt-1">60 minutos de consultoria 1:1</p>
                    </div>
                    <span className="text-xl font-bold text-gray-900">R$ 197</span>
                  </div>
                  
                  <div className="border-t border-cream-200 pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span className="text-cream-600">R$ 197,00</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card className="border-cream-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">O que está incluído:</h3>
                
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700">Consultoria 1:1 personalizada (60 min)</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700">Plano de implementação detalhado</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700">Templates de automação prontos</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700">30 dias de suporte por e-mail</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700">Análise competitiva do seu setor</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Security & Guarantees */}
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Pagamento 100% Seguro</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-cream-600" />
                <span>Agendamento Imediato</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div>
            <Card className="border-cream-200 shadow-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <CreditCard className="h-6 w-6 mr-3 text-cream-600" />
                  Dados de Pagamento
                </h3>
                
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm />
                </Elements>
                
                <div className="mt-6 p-4 bg-cream-50 rounded-lg border border-cream-200">
                  <p className="text-sm text-gray-600 text-center">
                    <Shield className="h-4 w-4 inline mr-1" />
                    Seus dados estão protegidos com criptografia SSL de 256 bits
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Satisfaction Guarantee */}
        <Card className="mt-12 bg-gradient-to-r from-cream-100 to-cream-200 border-cream-300">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              💯 Garantia de Satisfação
            </h3>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Se você não ficar completamente satisfeito com sua sessão de estratégia, 
              devolvemos 100% do seu investimento. Sem perguntas, sem complicações.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
