import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Settings } from "lucide-react";

interface AiRecommendationCardProps {
  recommendation: {
    id: string;
    toolName: string;
    category: string;
    useCase: string;
    automationLevel: string;
    description: string;
    link?: string;
    features: string[];
  };
}

export function AiRecommendationCard({ recommendation }: AiRecommendationCardProps) {
  const getAutomationLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'alto':
        return 'bg-green-100 text-green-700';
      case 'médio':
        return 'bg-yellow-100 text-yellow-700';
      case 'baixo':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes('marketing')) return '📢';
    if (category.toLowerCase().includes('automação')) return '⚡';
    if (category.toLowerCase().includes('conteúdo')) return '📝';
    if (category.toLowerCase().includes('vendas')) return '💰';
    if (category.toLowerCase().includes('atendimento')) return '💬';
    return '🤖';
  };

  return (
    <Card className="border-cream-200 hover:border-cream-300 transition-colors h-full">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cream-500 to-cream-600 rounded-xl flex items-center justify-center text-white text-xl">
              {getCategoryIcon(recommendation.category)}
            </div>
            <div>
              <h3 
                className="text-xl font-semibold text-gray-900"
                data-testid={`text-tool-name-${recommendation.id}`}
              >
                {recommendation.toolName}
              </h3>
              <p className="text-cream-600 font-medium">
                {recommendation.category}
              </p>
            </div>
          </div>
          <Badge 
            className={getAutomationLevelColor(recommendation.automationLevel)}
            data-testid={`badge-automation-level-${recommendation.id}`}
          >
            {recommendation.automationLevel}
          </Badge>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Caso de Uso:</h4>
          <p className="text-gray-600 text-sm mb-3">
            {recommendation.useCase}
          </p>
          <p className="text-gray-700">
            {recommendation.description}
          </p>
        </div>

        {recommendation.features && recommendation.features.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Recursos Principais:</h4>
            <div className="space-y-2">
              {recommendation.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-green-500 text-sm">✓</span>
                  <span className="text-gray-600 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          {recommendation.link && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-cream-300 text-cream-700 hover:bg-cream-50"
              onClick={() => window.open(recommendation.link, '_blank')}
              data-testid={`button-view-tool-${recommendation.id}`}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Ferramenta
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="border-cream-300 text-cream-700 hover:bg-cream-50"
            data-testid={`button-configure-${recommendation.id}`}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
