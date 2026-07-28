import { supabase } from '@/lib/supabase';

export interface WhatsAppMessage {
  from: string;
  message: string;
  timestamp: Date;
}

export interface AssistantResponse {
  message: string;
  shouldTransferToHuman: boolean;
  context?: any;
}

// Intent types
type Intent = 
  | 'faq' 
  | 'product_search' 
  | 'product_help' 
  | 'order_status' 
  | 'greeting' 
  | 'unknown';

class WhatsAppAssistant {
  private faqData = {
    'delivery': 'Nous livrons dans toute la zone de Cotonou. Les frais de livraison varient selon votre zone (500-2000 XOF). Le délai de livraison est généralement de 24-48h.',
    'payment': 'Nous acceptons uniquement le paiement à la livraison (Cash on Delivery). Vous payez lorsque vous recevez votre commande.',
    'return': 'Les retours sont acceptés sous 7 jours si le produit est défectueux. Contactez-nous via WhatsApp pour procéder au retour.',
    'contact': 'Vous pouvez nous contacter via WhatsApp au +229 01 94 63 56 56 ou par email à contact@daydaysfancy.com',
    'hours': 'Nous sommes ouverts du lundi au samedi, de 9h à 18h.',
  };

  private greetingKeywords = ['bonjour', 'salut', 'hello', 'hi', 'bonsoir', 'hey'];
  private faqKeywords = ['livraison', 'frais', 'délai', 'paiement', 'retour', 'contact', 'horaires', 'heure'];
  private productKeywords = ['produit', 'article', 'montre', 'bracelet', 'bijoux', 'recherche', 'chercher', 'trouver'];
  private orderKeywords = ['commande', 'statut', 'suivi', 'où', 'livré', 'en cours'];

  detectIntent(message: string): Intent {
    const lowerMessage = message.toLowerCase();

    if (this.greetingKeywords.some(kw => lowerMessage.includes(kw))) {
      return 'greeting';
    }

    if (this.faqKeywords.some(kw => lowerMessage.includes(kw))) {
      return 'faq';
    }

    if (this.productKeywords.some(kw => lowerMessage.includes(kw))) {
      return 'product_search';
    }

    if (this.orderKeywords.some(kw => lowerMessage.includes(kw))) {
      return 'order_status';
    }

    return 'unknown';
  }

  async handleProductSearch(query: string): Promise<AssistantResponse> {
    try {
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5);

      if (!products || products.length === 0) {
        return {
          message: "Je n'ai trouvé aucun produit correspondant à votre recherche. Essayez avec d'autres mots-clés ou contactez un agent humain pour plus d'aide.",
          shouldTransferToHuman: false,
        };
      }

      const productList = products
        .map((p: any, i: number) => `${i + 1}. ${p.name} - ${p.price.toLocaleString('fr-FR')} XOF`)
        .join('\n');

      return {
        message: `Voici les produits que j'ai trouvés:\n\n${productList}\n\nPour plus de détails sur un produit, contactez-nous ou visitez notre site.`,
        shouldTransferToHuman: false,
        context: { products },
      };
    } catch (error) {
      return {
        message: "Une erreur s'est produite lors de la recherche. Veuillez réessayer ou contacter un agent humain.",
        shouldTransferToHuman: true,
      };
    }
  }

  async handleOrderStatus(query: string): Promise<AssistantResponse> {
    // Extract potential order number (5 digits)
    const orderNumberMatch = query.match(/\d{5}/);
    
    if (!orderNumberMatch) {
      return {
        message: "Pour vérifier le statut de votre commande, veuillez me fournir votre numéro de suivi à 5 chiffres (ex: #12345).",
        shouldTransferToHuman: false,
      };
    }

    const trackingNumber = orderNumberMatch[0];

    try {
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('tracking_number', trackingNumber)
        .single();

      if (!order) {
        return {
          message: `Je n'ai trouvé aucune commande avec le numéro #${trackingNumber}. Vérifiez le numéro ou contactez un agent humain.`,
          shouldTransferToHuman: false,
        };
      }

      const statusMap: Record<string, string> = {
        'pending': 'En attente de confirmation',
        'confirmed': 'Confirmée',
        'processing': 'En préparation',
        'shipped': 'Expédiée',
        'delivered': 'Livrée',
        'cancelled': 'Annulée',
      };

      return {
        message: `Statut de votre commande #${trackingNumber}:\n\n` +
          `Statut: ${statusMap[order.order_status] || order.order_status}\n` +
          `Total: ${order.final_amount.toLocaleString('fr-FR')} XOF\n` +
          `Date: ${new Date(order.created_at).toLocaleDateString('fr-FR')}\n\n` +
          `Besoin d'aide supplémentaire? Contactez un agent humain.`,
        shouldTransferToHuman: false,
        context: { order },
      };
    } catch (error) {
      return {
        message: "Une erreur s'est produite lors de la vérification. Veuillez réessayer ou contacter un agent humain.",
        shouldTransferToHuman: true,
      };
    }
  }

  handleFAQ(query: string): AssistantResponse {
    const lowerQuery = query.toLowerCase();

    for (const [key, answer] of Object.entries(this.faqData)) {
      if (lowerQuery.includes(key)) {
        return {
          message: answer,
          shouldTransferToHuman: false,
        };
      }
    }

    return {
      message: "Je n'ai pas trouvé d'information correspondante. Voici ce que je peux vous aider:\n\n" +
        "- Information sur la livraison\n" +
        "- Modes de paiement\n" +
        "- Politique de retour\n" +
        "- Coordonnées de contact\n" +
        "- Horaires d'ouverture\n\n" +
        "Ou contactez un agent humain pour une assistance personnalisée.",
      shouldTransferToHuman: false,
    };
  }

  handleGreeting(): AssistantResponse {
    return {
      message: "Bonjour! 👋 Je suis l'assistant virtuel de DAYDAY'S FANCY. Comment puis-je vous aider aujourd'hui?\n\n" +
        "Je peux vous aider avec:\n" +
        "- 📦 Recherche de produits\n" +
        "- 📋 Statut de commande\n" +
        "- ❓ Questions fréquentes (livraison, paiement, etc.)\n\n" +
        "Écrivez votre question ou tapez 'humain' pour parler à un agent.",
      shouldTransferToHuman: false,
    };
  }

  async processMessage(message: WhatsAppMessage): Promise<AssistantResponse> {
    const intent = this.detectIntent(message.message);

    switch (intent) {
      case 'greeting':
        return this.handleGreeting();

      case 'faq':
        return this.handleFAQ(message.message);

      case 'product_search':
        return await this.handleProductSearch(message.message);

      case 'order_status':
        return await this.handleOrderStatus(message.message);

      case 'unknown':
        if (message.message.toLowerCase().includes('humain') || message.message.toLowerCase().includes('agent')) {
          return {
            message: "Je vous transfère à un agent humain. Un agent vous répondra dans les plus brefs délais.",
            shouldTransferToHuman: true,
          };
        }

        return {
          message: "Je n'ai pas compris votre demande. Voici ce que je peux faire:\n\n" +
            "- Rechercher un produit (écrivez 'montre', 'bracelet', etc.)\n" +
            "- Vérifier une commande (écrivez votre numéro à 5 chiffres)\n" +
            "- Questions sur la livraison, paiement, retour\n\n" +
            "Ou tapez 'humain' pour parler à un agent.",
          shouldTransferToHuman: false,
        };

      default:
        return {
          message: "Une erreur s'est produite. Veuillez réessayer ou contacter un agent humain.",
          shouldTransferToHuman: true,
        };
    }
  }
}

export const whatsappAssistant = new WhatsAppAssistant();
