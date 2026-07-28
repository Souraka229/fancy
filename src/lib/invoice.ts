import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerZone: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  trackingNumber: string;
}

export function generateInvoice(data: InvoiceData): jsPDF {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(24);
  doc.setTextColor(249, 115, 22); // Orange
  doc.text("DAYDAY'S FANCY", 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text("Boutique premium - Montres, Bijoux & Accessoires", 14, 26);
  doc.text("Cotonou, Bénin", 14, 31);
  doc.text("+229 01 94 63 56 56", 14, 36);
  
  // Invoice details
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`FACTURE #${data.invoiceNumber}`, 14, 50);
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Date: ${data.date.toLocaleDateString('fr-FR')}`, 14, 56);
  doc.text(`Commande: #${data.trackingNumber}`, 14, 62);
  
  // Customer details
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Informations client", 14, 75);
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Nom: ${data.customerName}`, 14, 82);
  doc.text(`Téléphone: ${data.customerPhone}`, 14, 88);
  doc.text(`Adresse: ${data.customerAddress}`, 14, 94);
  doc.text(`Zone: ${data.customerZone}`, 14, 100);
  
  // Items table
  const tableData = data.items.map(item => [
    item.name,
    item.quantity.toString(),
    `${item.price.toLocaleString('fr-FR')} XOF`,
    `${item.total.toLocaleString('fr-FR')} XOF`,
  ]);
  
  autoTable(doc, {
    startY: 115,
    head: [['Produit', 'Quantité', 'Prix unitaire', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [249, 115, 22],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
  });
  
  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Sous-total: ${data.subtotal.toLocaleString('fr-FR')} XOF`, 140, finalY);
  doc.text(`Livraison: ${data.shipping.toLocaleString('fr-FR')} XOF`, 140, finalY + 7);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(249, 115, 22);
  doc.text(`TOTAL: ${data.total.toLocaleString('fr-FR')} XOF`, 140, finalY + 16);
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.setFont('helvetica', 'normal');
  doc.text("Merci pour votre confiance !", 14, finalY + 35);
  doc.text("Pour toute question, contactez-nous via WhatsApp: +229 01 94 63 56 56", 14, finalY + 40);
  
  return doc;
}

export function downloadInvoice(data: InvoiceData) {
  const doc = generateInvoice(data);
  doc.save(`facture-${data.invoiceNumber}.pdf`);
}
