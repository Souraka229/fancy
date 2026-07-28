'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { supabase } from '@/lib/supabase';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Users, 
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  X,
  Download,
  GripVertical
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableProduct({ product, onEdit, onDelete }: { product: any; onEdit: (p: any) => void; onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="glass rounded-xl p-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-white">
            <GripVertical size={20} />
          </button>
          <div>
            <h4 className="text-white font-semibold">{product.name}</h4>
            <span className="text-orange-500">{product.price.toLocaleString('fr-FR')} XOF</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Edit className="text-white" size={18} />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <Trash2 className="text-red-500" size={18} />
          </button>
        </div>
      </div>
      <div className="mt-2">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          product.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
        }`}>
          {product.is_active ? 'Actif' : 'Inactif'}
        </span>
      </div>
    </div>
  );
}

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'whatsapp' | 'promotions' | 'analytics' | 'delivery' | 'sponsored' | 'ai-assistant'>('dashboard');
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    dailySales: 0,
    products: 0,
    activeClients: 0,
    lowStock: 0,
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    compare_at_price: '',
    stock: '',
    category_id: '',
    images: [''],
    imageAlt: '',
    video_url: '',
    is_active: true,
    is_featured: false,
    is_trending: false,
    is_sponsored: false,
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
  });
  const [whatsappTemplates, setWhatsappTemplates] = useState<any[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'confirmation',
    content: '',
    is_active: true,
  });
  const [promotions, setPromotions] = useState<any[]>([]);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);
  const [promotionForm, setPromotionForm] = useState({
    name: '',
    type: 'percentage',
    value: '',
    product_id: '',
    category_id: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    averageCart: 0,
    topProducts: [] as any[],
    lowPerformers: [] as any[],
    newClients: 0,
    conversionRate: 0,
    cancelledOrders: 0,
    monthlyRevenue: [] as any[],
  });
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [deliveryDrivers, setDeliveryDrivers] = useState<any[]>([]);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [zoneForm, setZoneForm] = useState({
    name: '',
    fee: '',
    is_active: true,
  });
  const [editingDriver, setEditingDriver] = useState<any>(null);
  const [driverForm, setDriverForm] = useState({
    name: '',
    phone: '',
    is_active: true,
  });
  const [sponsoredProducts, setSponsoredProducts] = useState<any[]>([]);
  const [editingSponsored, setEditingSponsored] = useState<any>(null);
  const [sponsoredForm, setSponsoredForm] = useState({
    product_id: '',
    position: '',
    duration_days: '',
    priority: 1,
    is_active: true,
  });
  const [aiChatMessages, setAiChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [aiInput, setAiInput] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setProducts((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const reordered = arrayMove(items, oldIndex, newIndex);
        
        // Update display_order in database
        reordered.forEach(async (product, index) => {
          await supabase.from('products').update({ display_order: index }).eq('id', product.id);
        });

        return reordered;
      });
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      if (!supabase) {
        const [productsResponse, ordersResponse] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/orders'),
        ]);

        if (!productsResponse.ok || !ordersResponse.ok) {
          throw new Error('Unable to load fallback dashboard data');
        }

        const fallbackProducts = await productsResponse.json();
        const fallbackOrders = await ordersResponse.json();

        const normalizedProducts = (fallbackProducts || []).map((product: any) => ({
          ...product,
          id: product.id?.toString() ?? product.id,
          price: Number(product.price || 0),
          compare_at_price: product.compare_at_price ?? null,
          stock: Number(product.stock || 0),
          images: product.image ? [product.image] : (product.images || ['']),
          is_active: true,
          is_featured: Boolean(product.badge && ['Best Seller', 'Promo', '-15%'].includes(product.badge)),
          is_trending: false,
          is_sponsored: false,
        }));

        const normalizedOrders = (fallbackOrders || []).map((order: any) => ({
          ...order,
          id: order.id?.toString() ?? order.id,
          tracking_number: order.code || order.tracking_number || `CMD-${order.id}`,
          customer_name: order.customerName || order.customer_name || 'Client',
          customer_phone: order.phone || order.customer_phone || '',
          customer_address: order.address || order.customer_address || '',
          customer_city: order.zone || order.customer_city || '',
          order_status: order.status || order.order_status || 'Commande reçue',
          final_amount: Number(order.total || 0),
        }));

        setStats({
          revenue: normalizedOrders.reduce((sum: number, order: any) => sum + Number(order.final_amount || 0), 0),
          orders: normalizedOrders.length,
          dailySales: normalizedOrders.reduce((sum: number, order: any) => sum + Number(order.final_amount || 0), 0),
          products: normalizedProducts.length,
          activeClients: normalizedOrders.length,
          lowStock: 0,
        });
        setOrders(normalizedOrders);
        setProducts(normalizedProducts);
        setCategories([]);
        return;
      }

      // Load stats
      const { data: ordersData } = await supabase
        .from('orders')
        .select('final_amount, created_at, customer_email')
        .order('created_at', { ascending: false });

      const { data: productsData } = await supabase
        .from('products')
        .select('*, categories(*)')
        .order('created_at', { ascending: false });

      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      const { data: ordersList } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: templatesData } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: promotionsData } = await supabase
        .from('promotions')
        .select('*, categories(*), products(*)')
        .order('created_at', { ascending: false });

      const { data: zonesData } = await supabase
        .from('delivery_zones')
        .select('*')
        .order('name', { ascending: true });

      const { data: driversData } = await supabase
        .from('delivery_drivers')
        .select('*')
        .order('name', { ascending: true });

      const { data: sponsoredData } = await supabase
        .from('featured_products')
        .select('*, products(*)')
        .order('priority', { ascending: false });

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dailySales = ordersData?.reduce((sum: number, order: any) => {
        const orderDate = new Date(order.created_at);
        if (orderDate >= today) {
          return sum + (order.final_amount || 0);
        }
        return sum;
      }, 0) || 0;

      const totalRevenue = ordersData?.reduce((sum: number, order: any) => sum + (order.final_amount || 0), 0) || 0;
      const uniqueClients = new Set(ordersData?.map((o: any) => o.customer_email)).size;
      const lowStockCount = productsData?.filter((p: any) => p.stock < 5 && p.is_active).length || 0;

      setStats({
        revenue: totalRevenue,
        orders: ordersData?.length || 0,
        dailySales,
        products: productsData?.filter((p: any) => p.is_active).length || 0,
        activeClients: uniqueClients,
        lowStock: lowStockCount,
      });

      setOrders(ordersList || []);
      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setWhatsappTemplates(templatesData || []);
      setPromotions(promotionsData || []);
      setDeliveryZones(zonesData || []);
      setDeliveryDrivers(driversData || []);
      setSponsoredProducts(sponsoredData || []);

      // Load analytics data
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('*, products(*)');

      const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.final_amount || 0), 0) || 0;
      const averageCart = ordersData?.length > 0 ? totalRevenue / ordersData.length : 0;
      
      // Calculate top products
      const productSales = orderItems?.reduce((acc: any, item: any) => {
        const productId = item.product_id;
        if (!acc[productId]) {
          acc[productId] = { id: productId, name: item.products?.name || 'Unknown', quantity: 0, revenue: 0 };
        }
        acc[productId].quantity += item.quantity;
        acc[productId].revenue += item.price * item.quantity;
        return acc;
      }, {}) || {};

      const topProducts = Object.values(productSales)
        .sort((a: any, b: any) => b.quantity - a.quantity)
        .slice(0, 5);

      const lowPerformers = Object.values(productSales)
        .filter((p: any) => p.quantity > 0)
        .sort((a: any, b: any) => a.quantity - b.quantity)
        .slice(0, 5);

      // Calculate new clients (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newClients = new Set(
        ordersData?.filter((o: any) => new Date(o.created_at) >= thirtyDaysAgo).map((o: any) => o.customer_email)
      ).size;

      // Calculate conversion rate (cancelled orders)
      const cancelledOrders = ordersData?.filter((o: any) => o.order_status === 'Annulée').length || 0;
      const conversionRate = ordersData?.length > 0 
        ? ((ordersData.length - cancelledOrders) / ordersData.length) * 100 
        : 0;

      // Monthly revenue
      const monthlyRevenue = ordersData?.reduce((acc: any, order: any) => {
        const month = new Date(order.created_at).toISOString().slice(0, 7);
        if (!acc[month]) {
          acc[month] = { month, revenue: 0 };
        }
        acc[month].revenue += order.final_amount || 0;
        return acc;
      }, {}) || {};

      setAnalytics({
        totalRevenue,
        averageCart,
        topProducts,
        lowPerformers,
        newClients,
        conversionRate,
        cancelledOrders,
        monthlyRevenue: Object.values(monthlyRevenue).sort((a: any, b: any) => a.month.localeCompare(b.month)),
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      slug: '',
      description: '',
      price: '',
      compare_at_price: '',
      stock: '',
      category_id: '',
      images: [''],
      imageAlt: '',
      video_url: '',
      is_active: true,
      is_featured: false,
      is_trending: false,
      is_sponsored: false,
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
    });
    setShowProductModal(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price.toString(),
      compare_at_price: product.compare_at_price?.toString() || '',
      stock: product.stock.toString(),
      category_id: product.category_id || '',
      images: product.images || [''],
      imageAlt: product.imageAlt || '',
      video_url: product.video_url || '',
      is_active: product.is_active,
      is_featured: product.is_featured,
      is_trending: product.is_trending,
      is_sponsored: product.is_sponsored,
      seo_title: product.seo_title || '',
      seo_description: product.seo_description || '',
      seo_keywords: product.seo_keywords || '',
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    try {
      const productData = {
        name: productForm.name,
        slug: productForm.slug || productForm.name.toLowerCase().replace(/\s+/g, '-'),
        description: productForm.description,
        price: parseFloat(productForm.price),
        compare_at_price: productForm.compare_at_price ? parseFloat(productForm.compare_at_price) : null,
        stock: parseInt(productForm.stock),
        category_id: productForm.category_id || null,
        images: productForm.images.filter(img => img.trim() !== ''),
        imageAlt: productForm.imageAlt || null,
        video_url: productForm.video_url || null,
        is_active: productForm.is_active,
        is_featured: productForm.is_featured,
        is_trending: productForm.is_trending,
        is_sponsored: productForm.is_sponsored,
        seo_title: productForm.seo_title || null,
        seo_description: productForm.seo_description || null,
        seo_keywords: productForm.seo_keywords || null,
      };

      if (!supabase) {
        const method = editingProduct ? 'PATCH' : 'POST';
        const url = editingProduct ? `/api/products` : '/api/products';
        const payload = editingProduct ? { productId: editingProduct.id, updates: productData } : productData;

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Unable to persist product');
        }
      } else if (editingProduct) {
        await supabase.from('products').update(productData).eq('id', editingProduct.id);
      } else {
        await supabase.from('products').insert(productData);
      }

      setShowProductModal(false);
      loadDashboardData();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erreur lors de la sauvegarde du produit');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    
    try {
      if (!supabase) {
        const response = await fetch(`/api/products?id=${productId}`, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error('Unable to delete product');
        }
      } else {
        await supabase.from('products').delete().eq('id', productId);
      }
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erreur lors de la suppression du produit');
    }
  };

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({
      name: '',
      type: 'confirmation',
      content: '',
      is_active: true,
    });
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      type: template.type,
      content: template.content,
      is_active: template.is_active,
    });
  };

  const handleSaveTemplate = async () => {
    try {
      const templateData = {
        name: templateForm.name,
        type: templateForm.type,
        content: templateForm.content,
        is_active: templateForm.is_active,
      };

      if (editingTemplate) {
        await supabase.from('whatsapp_templates').update(templateData).eq('id', editingTemplate.id);
      } else {
        await supabase.from('whatsapp_templates').insert(templateData);
      }

      loadDashboardData();
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Erreur lors de la sauvegarde du template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return;
    
    try {
      await supabase.from('whatsapp_templates').delete().eq('id', templateId);
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Erreur lors de la suppression du template');
    }
  };

  const handleAddPromotion = () => {
    setEditingPromotion(null);
    setPromotionForm({
      name: '',
      type: 'percentage',
      value: '',
      product_id: '',
      category_id: '',
      start_date: '',
      end_date: '',
      is_active: true,
    });
  };

  const handleEditPromotion = (promotion: any) => {
    setEditingPromotion(promotion);
    setPromotionForm({
      name: promotion.name,
      type: promotion.type,
      value: promotion.value.toString(),
      product_id: promotion.product_id || '',
      category_id: promotion.category_id || '',
      start_date: promotion.start_date || '',
      end_date: promotion.end_date || '',
      is_active: promotion.is_active,
    });
  };

  const handleSavePromotion = async () => {
    try {
      const promotionData = {
        name: promotionForm.name,
        type: promotionForm.type,
        value: parseFloat(promotionForm.value),
        product_id: promotionForm.product_id || null,
        category_id: promotionForm.category_id || null,
        start_date: promotionForm.start_date || null,
        end_date: promotionForm.end_date || null,
        is_active: promotionForm.is_active,
      };

      if (editingPromotion) {
        await supabase.from('promotions').update(promotionData).eq('id', editingPromotion.id);
      } else {
        await supabase.from('promotions').insert(promotionData);
      }

      loadDashboardData();
      setEditingPromotion(null);
    } catch (error) {
      console.error('Error saving promotion:', error);
      alert('Erreur lors de la sauvegarde de la promotion');
    }
  };

  const handleDeletePromotion = async (promotionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) return;
    
    try {
      await supabase.from('promotions').delete().eq('id', promotionId);
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      alert('Erreur lors de la suppression de la promotion');
    }
  };

  const handleGenerateInvoice = async (order: any) => {
    try {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('*, products(*)')
        .eq('order_id', order.id);

      if (!orderItems) {
        alert('Erreur lors de la récupération des articles');
        return;
      }

      const { downloadInvoice } = await import('@/lib/invoice');
      
      downloadInvoice({
        invoiceNumber: order.id.slice(0, 8).toUpperCase(),
        date: new Date(order.created_at),
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        customerAddress: order.customer_address,
        customerZone: order.customer_zone,
        items: orderItems.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        subtotal: orderItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
        shipping: order.shipping_fee || 0,
        total: order.final_amount,
        trackingNumber: order.tracking_number,
      });
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Erreur lors de la génération de la facture');
    }
  };

  const handleAddZone = () => {
    setEditingZone(null);
    setZoneForm({
      name: '',
      fee: '',
      is_active: true,
    });
  };

  const handleEditZone = (zone: any) => {
    setEditingZone(zone);
    setZoneForm({
      name: zone.name,
      fee: zone.fee.toString(),
      is_active: zone.is_active,
    });
  };

  const handleSaveZone = async () => {
    try {
      const zoneData = {
        name: zoneForm.name,
        fee: parseFloat(zoneForm.fee),
        is_active: zoneForm.is_active,
      };

      if (editingZone) {
        await supabase.from('delivery_zones').update(zoneData).eq('id', editingZone.id);
      } else {
        await supabase.from('delivery_zones').insert(zoneData);
      }

      loadDashboardData();
      setEditingZone(null);
    } catch (error) {
      console.error('Error saving zone:', error);
      alert('Erreur lors de la sauvegarde de la zone');
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette zone ?')) return;
    
    try {
      await supabase.from('delivery_zones').delete().eq('id', zoneId);
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting zone:', error);
      alert('Erreur lors de la suppression de la zone');
    }
  };

  const handleAddDriver = () => {
    setEditingDriver(null);
    setDriverForm({
      name: '',
      phone: '',
      is_active: true,
    });
  };

  const handleEditDriver = (driver: any) => {
    setEditingDriver(driver);
    setDriverForm({
      name: driver.name,
      phone: driver.phone,
      is_active: driver.is_active,
    });
  };

  const handleSaveDriver = async () => {
    try {
      const driverData = {
        name: driverForm.name,
        phone: driverForm.phone,
        is_active: driverForm.is_active,
      };

      if (editingDriver) {
        await supabase.from('delivery_drivers').update(driverData).eq('id', editingDriver.id);
      } else {
        await supabase.from('delivery_drivers').insert(driverData);
      }

      loadDashboardData();
      setEditingDriver(null);
    } catch (error) {
      console.error('Error saving driver:', error);
      alert('Erreur lors de la sauvegarde du livreur');
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce livreur ?')) return;
    
    try {
      await supabase.from('delivery_drivers').delete().eq('id', driverId);
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting driver:', error);
      alert('Erreur lors de la suppression du livreur');
    }
  };

  const handleAddSponsored = () => {
    setEditingSponsored(null);
    setSponsoredForm({
      product_id: '',
      position: '',
      duration_days: '',
      priority: 1,
      is_active: true,
    });
  };

  const handleEditSponsored = (sponsored: any) => {
    setEditingSponsored(sponsored);
    setSponsoredForm({
      product_id: sponsored.product_id,
      position: sponsored.position.toString(),
      duration_days: sponsored.duration_days?.toString() || '',
      priority: sponsored.priority,
      is_active: sponsored.is_active,
    });
  };

  const handleSaveSponsored = async () => {
    try {
      const endDate = sponsoredForm.duration_days 
        ? new Date(Date.now() + parseInt(sponsoredForm.duration_days) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const sponsoredData = {
        product_id: sponsoredForm.product_id,
        position: parseInt(sponsoredForm.position),
        duration_days: sponsoredForm.duration_days ? parseInt(sponsoredForm.duration_days) : null,
        end_date: endDate,
        priority: sponsoredForm.priority,
        is_active: sponsoredForm.is_active,
      };

      if (editingSponsored) {
        await supabase.from('featured_products').update(sponsoredData).eq('id', editingSponsored.id);
      } else {
        await supabase.from('featured_products').insert(sponsoredData);
      }

      loadDashboardData();
      setEditingSponsored(null);
    } catch (error) {
      console.error('Error saving sponsored product:', error);
      alert('Erreur lors de la sauvegarde du produit sponsorisé');
    }
  };

  const handleDeleteSponsored = async (sponsoredId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit sponsorisé ?')) return;
    
    try {
      await supabase.from('featured_products').delete().eq('id', sponsoredId);
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting sponsored product:', error);
      alert('Erreur lors de la suppression du produit sponsorisé');
    }
  };

  const handleSendAiMessage = async () => {
    if (!aiInput.trim()) return;

    const userMessage = aiInput;
    setAiChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setAiInput('');

    try {
      const response = await fetch('/api/whatsapp-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, from: 'admin' }),
      });

      const data = await response.json();
      
      setAiChatMessages(prev => [...prev, { role: 'assistant', content: data.message }]);

      if (data.shouldTransferToHuman) {
        setAiChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: '🔔 Transfert vers un agent humain activé.' 
        }]);
      }
    } catch (error) {
      console.error('AI assistant error:', error);
      setAiChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Erreur de communication avec l\'assistant. Veuillez réessayer.' 
      }]);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !orderSearch || 
      order.tracking_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.customer_phone.includes(orderSearch);
    
    const matchesFilter = orderFilter === 'all' || order.order_status === orderFilter;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black-900">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Gestion DAYDAY'S FANCY</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <GlassCard className="p-4">
            <TrendingUp className="text-orange-500 mb-2" size={24} />
            <p className="text-gray-400 text-xs">Chiffre d'affaires</p>
            <p className="text-white text-xl font-bold">
              {stats.revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
            </p>
          </GlassCard>
          
          <GlassCard className="p-4">
            <ShoppingCart className="text-orange-500 mb-2" size={24} />
            <p className="text-gray-400 text-xs">Commandes</p>
            <p className="text-white text-xl font-bold">{stats.orders}</p>
          </GlassCard>
          
          <GlassCard className="p-4">
            <TrendingUp className="text-orange-500 mb-2" size={24} />
            <p className="text-gray-400 text-xs">Ventes du jour</p>
            <p className="text-white text-xl font-bold">
              {stats.dailySales.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
            </p>
          </GlassCard>
          
          <GlassCard className="p-4">
            <Package className="text-orange-500 mb-2" size={24} />
            <p className="text-gray-400 text-xs">Produits</p>
            <p className="text-white text-xl font-bold">{stats.products}</p>
          </GlassCard>
          
          <GlassCard className="p-4">
            <Users className="text-orange-500 mb-2" size={24} />
            <p className="text-gray-400 text-xs">Clients actifs</p>
            <p className="text-white text-xl font-bold">{stats.activeClients}</p>
          </GlassCard>
          
          <GlassCard className="p-4">
            <AlertTriangle className="text-orange-500 mb-2" size={24} />
            <p className="text-gray-400 text-xs">Stock faible</p>
            <p className="text-white text-xl font-bold">{stats.lowStock}</p>
          </GlassCard>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['dashboard', 'orders', 'products', 'whatsapp', 'promotions', 'analytics', 'delivery', 'sponsored', 'ai-assistant'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-orange-500 text-white' 
                  : 'glass text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'dashboard' ? 'Dashboard' : tab === 'orders' ? 'Commandes' : tab === 'products' ? 'Produits' : tab === 'whatsapp' ? 'WhatsApp' : tab === 'promotions' ? 'Promotions' : tab === 'analytics' ? 'Analytics' : tab === 'delivery' ? 'Livraison' : tab === 'sponsored' ? 'Sponsorisés' : 'IA Assistant'}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid md:grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Commandes récentes</h2>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-semibold">#{order.tracking_number}</p>
                      <p className="text-gray-400 text-sm">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-orange-500 font-semibold">
                        {order.final_amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                      </p>
                      <p className="text-gray-400 text-xs">{order.order_status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Alertes</h2>
              <div className="space-y-3">
                {stats.lowStock > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <AlertTriangle className="text-red-500" size={20} />
                    <div>
                      <p className="text-white font-semibold">Stock faible</p>
                      <p className="text-gray-400 text-sm">{stats.lowStock} produits en stock faible</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <ShoppingCart className="text-orange-500" size={20} />
                  <div>
                    <p className="text-white font-semibold">Commandes en attente</p>
                    <p className="text-gray-400 text-sm">{orders.filter(o => o.order_status === 'pending').length} commandes à traiter</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher commande, client..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                />
              </div>
              <select
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmée</option>
                <option value="processing">En préparation</option>
                <option value="shipped">Expédiée</option>
                <option value="delivered">Livrée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="pb-4">Commande</th>
                    <th className="pb-4">Client</th>
                    <th className="pb-4">Montant</th>
                    <th className="pb-4">Statut</th>
                    <th className="pb-4">Date</th>
                    <th className="pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-t border-white/10">
                      <td className="py-4">
                        <p className="text-white font-semibold">#{order.tracking_number}</p>
                      </td>
                      <td className="py-4">
                        <p className="text-white">{order.customer_name}</p>
                        <p className="text-gray-400 text-sm">{order.customer_phone}</p>
                      </td>
                      <td className="py-4">
                        <p className="text-orange-500 font-semibold">
                          {order.final_amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                        </p>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          order.order_status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                          order.order_status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                          'bg-orange-500/20 text-orange-500'
                        }`}>
                          {order.order_status}
                        </span>
                      </td>
                      <td className="py-4 text-gray-400 text-sm">
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Eye className="text-white" size={20} />
                          </button>
                          <button
                            onClick={() => handleGenerateInvoice(order)}
                            className="p-2 hover:bg-orange-500/20 rounded-lg transition-colors"
                            title="Générer facture"
                          >
                            <Download className="text-orange-500" size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Aucune commande trouvée
              </div>
            )}
          </GlassCard>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="glass-strong rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Commande #{selectedOrder.tracking_number}</h2>
                    <p className="text-gray-400">{selectedOrder.customer_name}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="text-white" size={24} />
                  </button>
                </div>

                {/* Customer Info */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Téléphone</p>
                    <p className="text-white font-semibold">{selectedOrder.customer_phone}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white font-semibold">{selectedOrder.customer_email}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Ville</p>
                    <p className="text-white font-semibold">{selectedOrder.customer_city}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Montant total</p>
                    <p className="text-orange-500 font-semibold">
                      {selectedOrder.final_amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="bg-white/5 rounded-xl p-4 mb-6">
                  <p className="text-gray-400 text-sm mb-1">Adresse de livraison</p>
                  <p className="text-white">{selectedOrder.customer_address}</p>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-3">Articles commandés</h3>
                  <div className="space-y-2">
                    {selectedOrder.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center bg-white/5 rounded-xl p-3">
                        <div>
                          <p className="text-white font-medium">{item.product_name}</p>
                          <p className="text-gray-400 text-sm">Quantité: {item.quantity}</p>
                        </div>
                        <p className="text-orange-500 font-semibold">
                          {item.total_price.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-3">Modifier le statut</h3>
                  <div className="flex flex-wrap gap-2">
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={async () => {
                          try {
                            await supabase
                              .from('orders')
                              .update({ order_status: status })
                              .eq('id', selectedOrder.id);
                            setSelectedOrder({ ...selectedOrder, order_status: status });
                            loadDashboardData();
                          } catch (error) {
                            console.error('Error updating order status:', error);
                          }
                        }}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          selectedOrder.order_status === status
                            ? 'bg-orange-500 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {status === 'pending' ? 'En attente' :
                         status === 'confirmed' ? 'Confirmée' :
                         status === 'processing' ? 'En préparation' :
                         status === 'shipped' ? 'Expédiée' :
                         status === 'delivered' ? 'Livrée' : 'Annulée'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => window.open(`https://wa.me/${selectedOrder.customer_phone.replace('+', '')}`, '_blank')}
                    className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
                  >
                    Contacter sur WhatsApp
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1 glass text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Produits</h2>
              <button
                onClick={handleAddProduct}
                className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus size={20} />
                Ajouter produit
              </button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={products.map(p => p.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {products.map((product) => (
                    <SortableProduct
                      key={product.id}
                      product={product}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {products.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Aucun produit trouvé
              </div>
            )}
          </GlassCard>
        )}

        {/* Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="glass-strong rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
                  </h2>
                  <button
                    onClick={() => setShowProductModal(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="text-white" size={24} />
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSaveProduct(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Nom du produit *</label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                      placeholder="Nom du produit"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Slug (URL)</label>
                    <input
                      type="text"
                      value={productForm.slug}
                      onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                      placeholder="url-du-produit"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 resize-none"
                      placeholder="Description du produit"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Prix *</label>
                      <input
                        type="number"
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Prix comparatif</label>
                      <input
                        type="number"
                        value={productForm.compare_at_price}
                        onChange={(e) => setProductForm({ ...productForm, compare_at_price: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Stock *</label>
                      <input
                        type="number"
                        required
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Catégorie</label>
                      <select
                        value={productForm.category_id}
                        onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">URL de la vidéo (optionnel)</label>
                    <input
                      type="url"
                      value={productForm.video_url}
                      onChange={(e) => setProductForm({ ...productForm, video_url: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">URLs des images (une par ligne)</label>
                    <textarea
                      value={productForm.images.join('\n')}
                      onChange={(e) => setProductForm({ ...productForm, images: e.target.value.split('\n').filter(img => img.trim() !== '') })}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 resize-none"
                      placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Texte alternatif de l'image</label>
                    <input
                      type="text"
                      value={productForm.imageAlt}
                      onChange={(e) => setProductForm({ ...productForm, imageAlt: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                      placeholder="Court texte descriptif pour le référencement"
                    />
                  </div>

                  <div className="border-t border-white/10 pt-4 mt-4">
                    <h4 className="text-white font-semibold mb-4">SEO</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Titre SEO</label>
                      <input
                        type="text"
                        value={productForm.seo_title}
                        onChange={(e) => setProductForm({ ...productForm, seo_title: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                        placeholder="Titre optimisé pour les moteurs de recherche"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Description SEO</label>
                      <textarea
                        value={productForm.seo_description}
                        onChange={(e) => setProductForm({ ...productForm, seo_description: e.target.value })}
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 resize-none"
                        placeholder="Description optimisée pour les moteurs de recherche"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Mots-clés SEO (séparés par des virgules)</label>
                      <input
                        type="text"
                        value={productForm.seo_keywords}
                        onChange={(e) => setProductForm({ ...productForm, seo_keywords: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                        placeholder="montre, bracelet, accessoires, Cotonou"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Importer une image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) {
                          return;
                        }

                        const reader = new FileReader();
                        reader.onload = () => {
                          const result = reader.result;
                          if (typeof result === 'string') {
                            setProductForm((current) => ({
                              ...current,
                              images: [result, ...current.images.filter(Boolean)],
                              imageAlt: current.imageAlt || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
                            }));
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {productForm.images.length > 0 && productForm.images[0] ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-sm text-gray-400 mb-2">Aperçu de l'image principale</p>
                      <img
                        src={productForm.images[0]}
                        alt={productForm.imageAlt || productForm.name || 'Aperçu du produit'}
                        className="w-full rounded-2xl object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.is_active}
                        onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
                        className="w-5 h-5 rounded"
                      />
                      <span className="text-white">Actif</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.is_featured}
                        onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                        className="w-5 h-5 rounded"
                      />
                      <span className="text-white">Vedette</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.is_trending}
                        onChange={(e) => setProductForm({ ...productForm, is_trending: e.target.checked })}
                        className="w-5 h-5 rounded"
                      />
                      <span className="text-white">Tendance</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.is_sponsored}
                        onChange={(e) => setProductForm({ ...productForm, is_sponsored: e.target.checked })}
                        className="w-5 h-5 rounded"
                      />
                      <span className="text-white">Sponsorisé</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                    >
                      {editingProduct ? 'Modifier' : 'Ajouter'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProductModal(false)}
                      className="flex-1 glass text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp Tab */}
        {activeTab === 'whatsapp' && (
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Templates WhatsApp</h2>
              <button
                onClick={handleAddTemplate}
                className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus size={20} />
                Ajouter template
              </button>
            </div>

            {editingTemplate && (
              <div className="mb-6 glass-strong rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  {editingTemplate ? 'Modifier le template' : 'Nouveau template'}
                </h3>
                <form onSubmit={(e) => { e.preventDefault(); handleSaveTemplate(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Nom du template</label>
                    <input
                      type="text"
                      required
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                      placeholder="Nom du template"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                    <select
                      value={templateForm.type}
                      onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="confirmation">Confirmation commande</option>
                      <option value="preparation">En préparation</option>
                      <option value="shipped">Expédiée</option>
                      <option value="delivered">Livrée</option>
                      <option value="cancelled">Annulée</option>
                      <option value="abandoned_cart">Panier abandonné</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Contenu du message</label>
                    <textarea
                      required
                      value={templateForm.content}
                      onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 resize-none"
                      placeholder="Bonjour {customer_name}, votre commande #{tracking_number} est confirmée..."
                    />
                    <p className="text-xs text-gray-400 mt-1">Variables disponibles: {`{customer_name}`}, {`{tracking_number}`}, {`{order_total}`}, {`{delivery_address}`}</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                    >
                      {editingTemplate ? 'Modifier' : 'Ajouter'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTemplate(null)}
                      className="flex-1 glass text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-3">
              {whatsappTemplates.map((template) => (
                <div key={template.id} className="glass rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-white font-semibold">{template.name}</h4>
                      <span className="text-xs text-orange-500 uppercase">{template.type}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit className="text-white" size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="text-red-500" size={18} />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">{template.content}</p>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      template.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                    }`}>
                      {template.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {whatsappTemplates.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Aucun template WhatsApp configuré
              </div>
            )}
          </GlassCard>
        )}

        {/* Promotions Tab */}
        {activeTab === 'promotions' && (
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Promotions</h2>
              <button
                onClick={handleAddPromotion}
                className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus size={20} />
                Ajouter promotion
              </button>
            </div>

            {editingPromotion && (
              <div className="mb-6 glass-strong rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  {editingPromotion ? 'Modifier la promotion' : 'Nouvelle promotion'}
                </h3>
                <form onSubmit={(e) => { e.preventDefault(); handleSavePromotion(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Nom de la promotion</label>
                    <input
                      type="text"
                      required
                      value={promotionForm.name}
                      onChange={(e) => setPromotionForm({ ...promotionForm, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                      placeholder="Nom de la promotion"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                      <select
                        value={promotionForm.type}
                        onChange={(e) => setPromotionForm({ ...promotionForm, type: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="percentage">Pourcentage</option>
                        <option value="fixed">Montant fixe</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Valeur</label>
                      <input
                        type="number"
                        required
                        value={promotionForm.value}
                        onChange={(e) => setPromotionForm({ ...promotionForm, value: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                        placeholder={promotionForm.type === 'percentage' ? '20' : '5000'}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Produit (optionnel)</label>
                      <select
                        value={promotionForm.product_id}
                        onChange={(e) => setPromotionForm({ ...promotionForm, product_id: e.target.value, category_id: '' })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="">Tous les produits</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Catégorie (optionnel)</label>
                      <select
                        value={promotionForm.category_id}
                        onChange={(e) => setPromotionForm({ ...promotionForm, category_id: e.target.value, product_id: '' })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="">Toutes les catégories</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Date de début</label>
                      <input
                        type="date"
                        value={promotionForm.start_date}
                        onChange={(e) => setPromotionForm({ ...promotionForm, start_date: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Date de fin</label>
                      <input
                        type="date"
                        value={promotionForm.end_date}
                        onChange={(e) => setPromotionForm({ ...promotionForm, end_date: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                    >
                      {editingPromotion ? 'Modifier' : 'Ajouter'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPromotion(null)}
                      className="flex-1 glass text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-3">
              {promotions.map((promotion) => (
                <div key={promotion.id} className="glass rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-white font-semibold">{promotion.name}</h4>
                      <span className="text-xs text-orange-500 uppercase">
                        {promotion.type === 'percentage' ? `${promotion.value}%` : `${promotion.value.toLocaleString('fr-FR')} XOF`}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPromotion(promotion)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit className="text-white" size={18} />
                      </button>
                      <button
                        onClick={() => handleDeletePromotion(promotion.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="text-red-500" size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {promotion.products?.name && <span>Produit: {promotion.products.name}</span>}
                    {promotion.categories?.name && <span>Catégorie: {promotion.categories.name}</span>}
                    {!promotion.products && !promotion.categories && <span>Tous les produits</span>}
                  </div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {promotion.start_date && (
                      <span className="text-xs text-gray-400">Du: {new Date(promotion.start_date).toLocaleDateString('fr-FR')}</span>
                    )}
                    {promotion.end_date && (
                      <span className="text-xs text-gray-400">Au: {new Date(promotion.end_date).toLocaleDateString('fr-FR')}</span>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      promotion.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                    }`}>
                      {promotion.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {promotions.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Aucune promotion configurée
              </div>
            )}
          </GlassCard>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Business Analytics</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <GlassCard className="p-4">
                <p className="text-gray-400 text-xs">Revenu total</p>
                <p className="text-white text-2xl font-bold">{analytics.totalRevenue.toLocaleString('fr-FR')} XOF</p>
              </GlassCard>
              <GlassCard className="p-4">
                <p className="text-gray-400 text-xs">Panier moyen</p>
                <p className="text-white text-2xl font-bold">{analytics.averageCart.toLocaleString('fr-FR')} XOF</p>
              </GlassCard>
              <GlassCard className="p-4">
                <p className="text-gray-400 text-xs">Nouveaux clients (30j)</p>
                <p className="text-white text-2xl font-bold">{analytics.newClients}</p>
              </GlassCard>
              <GlassCard className="p-4">
                <p className="text-gray-400 text-xs">Taux de conversion</p>
                <p className="text-white text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</p>
              </GlassCard>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <GlassCard className="p-4">
                <h3 className="text-lg font-bold text-white mb-4">Top Produits</h3>
                <div className="space-y-3">
                  {analytics.topProducts.map((product, index) => (
                    <div key={product.id} className="flex justify-between items-center">
                      <span className="text-white">{index + 1}. {product.name}</span>
                      <span className="text-orange-500">{product.quantity} vendus</span>
                    </div>
                  ))}
                  {analytics.topProducts.length === 0 && (
                    <p className="text-gray-400 text-sm">Aucune donnée</p>
                  )}
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <h3 className="text-lg font-bold text-white mb-4">Produits Faibles</h3>
                <div className="space-y-3">
                  {analytics.lowPerformers.map((product, index) => (
                    <div key={product.id} className="flex justify-between items-center">
                      <span className="text-white">{index + 1}. {product.name}</span>
                      <span className="text-red-500">{product.quantity} vendus</span>
                    </div>
                  ))}
                  {analytics.lowPerformers.length === 0 && (
                    <p className="text-gray-400 text-sm">Aucune donnée</p>
                  )}
                </div>
              </GlassCard>
            </div>

            <GlassCard className="p-4">
              <h3 className="text-lg font-bold text-white mb-4">Commandes annulées</h3>
              <p className="text-orange-500 text-2xl font-bold">{analytics.cancelledOrders}</p>
            </GlassCard>

            {analytics.monthlyRevenue.length > 0 && (
              <GlassCard className="p-4 mt-6">
                <h3 className="text-lg font-bold text-white mb-4">Revenu mensuel</h3>
                <div className="space-y-2">
                  {analytics.monthlyRevenue.map((data) => (
                    <div key={data.month} className="flex justify-between items-center">
                      <span className="text-white">{data.month}</span>
                      <span className="text-green-500">{data.revenue.toLocaleString('fr-FR')} XOF</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </GlassCard>
        )}

        {/* Delivery Tab */}
        {activeTab === 'delivery' && (
          <div className="grid md:grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Zones de livraison</h2>
                <button
                  onClick={handleAddZone}
                  className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus size={20} />
                  Ajouter zone
                </button>
              </div>

              {editingZone && (
                <div className="mb-6 glass-strong rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">
                    {editingZone ? 'Modifier la zone' : 'Nouvelle zone'}
                  </h3>
                  <form onSubmit={(e) => { e.preventDefault(); handleSaveZone(); }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Nom de la zone</label>
                      <input
                        type="text"
                        required
                        value={zoneForm.name}
                        onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                        placeholder="Ex: Cotonou Centre"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Frais de livraison (XOF)</label>
                      <input
                        type="number"
                        required
                        value={zoneForm.fee}
                        onChange={(e) => setZoneForm({ ...zoneForm, fee: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                        placeholder="1000"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="zone-active"
                        checked={zoneForm.is_active}
                        onChange={(e) => setZoneForm({ ...zoneForm, is_active: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label htmlFor="zone-active" className="text-white">Active</label>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                      >
                        {editingZone ? 'Modifier' : 'Ajouter'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingZone(null)}
                        className="flex-1 glass text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-3">
                {deliveryZones.map((zone) => (
                  <div key={zone.id} className="glass rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-semibold">{zone.name}</h4>
                        <span className="text-orange-500">{zone.fee.toLocaleString('fr-FR')} XOF</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditZone(zone)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Edit className="text-white" size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteZone(zone.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="text-red-500" size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        zone.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                      }`}>
                        {zone.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {deliveryZones.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  Aucune zone configurée
                </div>
              )}
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Livreurs</h2>
                <button
                  onClick={handleAddDriver}
                  className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus size={20} />
                  Ajouter livreur
                </button>
              </div>

              {editingDriver && (
                <div className="mb-6 glass-strong rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">
                    {editingDriver ? 'Modifier le livreur' : 'Nouveau livreur'}
                  </h3>
                  <form onSubmit={(e) => { e.preventDefault(); handleSaveDriver(); }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Nom du livreur</label>
                      <input
                        type="text"
                        required
                        value={driverForm.name}
                        onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                        placeholder="Nom complet"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Téléphone</label>
                      <input
                        type="tel"
                        required
                        value={driverForm.phone}
                        onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                        placeholder="+229 XX XX XX XX"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="driver-active"
                        checked={driverForm.is_active}
                        onChange={(e) => setDriverForm({ ...driverForm, is_active: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label htmlFor="driver-active" className="text-white">Actif</label>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                      >
                        {editingDriver ? 'Modifier' : 'Ajouter'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingDriver(null)}
                        className="flex-1 glass text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-3">
                {deliveryDrivers.map((driver) => (
                  <div key={driver.id} className="glass rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-semibold">{driver.name}</h4>
                        <span className="text-gray-400 text-sm">{driver.phone}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditDriver(driver)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Edit className="text-white" size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteDriver(driver.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="text-red-500" size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        driver.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                      }`}>
                        {driver.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {deliveryDrivers.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  Aucun livreur configuré
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* Sponsored Products Tab */}
        {activeTab === 'sponsored' && (
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Produits Sponsorisés</h2>
              <button
                onClick={handleAddSponsored}
                className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus size={20} />
                Ajouter sponsorisé
              </button>
            </div>

            {editingSponsored && (
              <div className="mb-6 glass-strong rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  {editingSponsored ? 'Modifier le produit sponsorisé' : 'Nouveau produit sponsorisé'}
                </h3>
                <form onSubmit={(e) => { e.preventDefault(); handleSaveSponsored(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Produit</label>
                    <select
                      required
                      value={sponsoredForm.product_id}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, product_id: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="">Sélectionner un produit</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Position</label>
                    <input
                      type="number"
                      required
                      value={sponsoredForm.position}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, position: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Durée (jours)</label>
                    <input
                      type="number"
                      value={sponsoredForm.duration_days}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, duration_days: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Priorité</label>
                    <input
                      type="number"
                      required
                      value={sponsoredForm.priority}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, priority: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                      placeholder="1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sponsored-active"
                      checked={sponsoredForm.is_active}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, is_active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="sponsored-active" className="text-white">Actif</label>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                    >
                      {editingSponsored ? 'Modifier' : 'Ajouter'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSponsored(null)}
                      className="flex-1 glass text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-3">
              {sponsoredProducts.map((sponsored) => (
                <div key={sponsored.id} className="glass rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{sponsored.products?.name || 'Produit inconnu'}</h4>
                      <div className="flex gap-4 mt-1">
                        <span className="text-orange-500">Position: {sponsored.position}</span>
                        <span className="text-gray-400">Priorité: {sponsored.priority}</span>
                      </div>
                      {sponsored.end_date && (
                        <span className="text-gray-400 text-sm">
                          Expire: {new Date(sponsored.end_date).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSponsored(sponsored)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit className="text-white" size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteSponsored(sponsored.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="text-red-500" size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      sponsored.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                    }`}>
                      {sponsored.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {sponsoredProducts.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Aucun produit sponsorisé configuré
              </div>
            )}
          </GlassCard>
        )}

        {/* AI Assistant Tab */}
        {activeTab === 'ai-assistant' && (
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Assistant IA WhatsApp</h2>
            
            <div className="glass-strong rounded-2xl p-4 mb-4 h-96 overflow-y-auto">
              {aiChatMessages.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="mb-2">🤖 Assistant IA prêt</p>
                  <p className="text-sm">Testez l'assistant en posant une question</p>
                </div>
              )}
              
              {aiChatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <div
                    className={`inline-block max-w-[80%] p-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-orange-500 text-white'
                        : 'glass text-white'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendAiMessage()}
                placeholder="Tapez votre message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={handleSendAiMessage}
                className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
              >
                Envoyer
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-400">
              <p className="font-semibold mb-2">Fonctionnalités:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Recherche de produits (ex: "montre", "bracelet")</li>
                <li>Statut de commande (ex: "commande #12345")</li>
                <li>FAQ (livraison, paiement, retour, contact, horaires)</li>
                <li>Transfert vers agent humain (tapez "humain")</li>
              </ul>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
