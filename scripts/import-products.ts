import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const products = [
  {
    name: "Pack ULTRA COMPLET - Montre + Écouteurs + Casque + 7 Bracelets",
    slug: "pack-ultra-complet-montre-ecouteurs-casque-7-bracelets",
    description: "Tout ce dont vous avez besoin pour une vie connectée – inclus dans un seul pack ! Écran HD avec apps Bluetooth, notifications, santé et sport. Écouteurs sans fil avec son stéréo et basse longue durée. Casque Bluetooth avec confort absolu et autonomie de 20h. Résistantes à l'eau (IP67), garantie de 2 ans. Accessoires inclus : 7 bracelets (Stainless Steel, Orange Fluorescent, Rainbow, Noir Mat, Dégradé Coloré), charge magnétique, sticker personnalisé, appareil USB intermédiaire. Compatible Android & iOS.",
    price: 7000,
    compare_at_price: 11000,
    stock: 50,
    category_id: null,
    images: [],
    is_active: true,
    is_featured: true,
    is_trending: true,
    is_sponsored: true,
    seo_title: "Pack ULTRA COMPLET Montre Écouteurs Casque 7 Bracelets - DAYDAY'S FANCY Cotonou",
    seo_description: "Découvrez le Pack ULTRA COMPLET avec montre HD, écouteurs Bluetooth, casque et 7 bracelets inclus. Promotion 7 000 F au lieu de 11 000 F. Livraison rapide à Cotonou.",
    seo_keywords: "pack montre, écouteurs bluetooth, casque, bracelets, accessoires connectés, Cotonou, promotion, livraison",
  },
  {
    name: "Bracelet Stainless Steel",
    slug: "bracelet-stainless-steel",
    description: "Bracelet en acier inoxydable, élégant et durable pour toutes les occasions. Compatible avec toutes les montres du pack.",
    price: 0,
    compare_at_price: null,
    stock: 100,
    category_id: null,
    images: [],
    is_active: true,
    is_featured: false,
    is_trending: false,
    is_sponsored: false,
    seo_title: "Bracelet Stainless Steel - Accessoire Montre Premium",
    seo_description: "Bracelet en acier inoxydable élégant pour votre montre. Inclus gratuitement dans le pack ULTRA COMPLET.",
    seo_keywords: "bracelet acier inoxydable, stainless steel, accessoire montre, bracelet premium",
  },
  {
    name: "Bracelet Orange Fluorescent",
    slug: "bracelet-orange-fluorescent",
    description: "Bracelet sportif en silicone orange, conçu pour la performance et l'esthétique. Résistant et confortable.",
    price: 0,
    compare_at_price: null,
    stock: 100,
    category_id: null,
    images: [],
    is_active: true,
    is_featured: false,
    is_trending: false,
    is_sponsored: false,
    seo_title: "Bracelet Orange Fluorescent Sportif Silicone",
    seo_description: "Bracelet sportif en silicone orange pour performance et style. Inclus dans le pack ULTRA COMPLET.",
    seo_keywords: "bracelet silicone, bracelet sportif, orange fluorescent, accessoire montre",
  },
  {
    name: "Bracelet Rainbow",
    slug: "bracelet-rainbow",
    description: "Bracelet coloré avec motifs d'arc-en-ciel, style unique et créatif pour personnaliser votre montre.",
    price: 0,
    compare_at_price: null,
    stock: 100,
    category_id: null,
    images: [],
    is_active: true,
    is_featured: false,
    is_trending: false,
    is_sponsored: false,
    seo_title: "Bracelet Rainbow Arc-en-Ciel Coloré",
    seo_description: "Bracelet coloré avec motifs arc-en-ciel pour un style unique. Inclus dans le pack ULTRA COMPLET.",
    seo_keywords: "bracelet rainbow, arc-en-ciel, bracelet coloré, accessoire montre créatif",
  },
  {
    name: "Bracelet Noir Mat",
    slug: "bracelet-noir-mat",
    description: "Bracelet matte en tissu noir, apportant un style sobre et confortable pour un usage quotidien.",
    price: 0,
    compare_at_price: null,
    stock: 100,
    category_id: null,
    images: [],
    is_active: true,
    is_featured: false,
    is_trending: false,
    is_sponsored: false,
    seo_title: "Bracelet Noir Mat Tissu Élégant",
    seo_description: "Bracelet matte en tissu noir pour un style sobre et confortable. Inclus dans le pack ULTRA COMPLET.",
    seo_keywords: "bracelet noir mat, bracelet tissu, bracelet élégant, accessoire montre",
  },
  {
    name: "Bracelet Dégradé Coloré",
    slug: "bracelet-degrade-color",
    description: "Bracelet multifil avec motifs géométriques pour un style créatif et moderne.",
    price: 0,
    compare_at_price: null,
    stock: 100,
    category_id: null,
    images: [],
    is_active: true,
    is_featured: false,
    is_trending: false,
    is_sponsored: false,
    seo_title: "Bracelet Dégradé Coloré Géométrique",
    seo_description: "Bracelet multifil avec motifs géométriques pour un style créatif. Inclus dans le pack ULTRA COMPLET.",
    seo_keywords: "bracelet dégradé, bracelet géométrique, bracelet coloré, accessoire montre moderne",
  },
];

async function importProducts() {
  console.log('Importation des produits...');
  
  for (const product of products) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select();
      
      if (error) {
        console.error(`Erreur pour ${product.name}:`, error);
      } else {
        console.log(`✅ ${product.name} importé avec succès`);
      }
    } catch (error) {
      console.error(`Erreur pour ${product.name}:`, error);
    }
  }
  
  console.log('Importation terminée!');
}

importProducts();
