import jsPDF from 'jspdf';
import { Order, OrderItem } from '../services/orders';

interface PDFOrderData extends Order {
  items: OrderItem[];
}

export const generateOrderPDF = async (order: PDFOrderData): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Margens
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // Posição Y atual
  let currentY = margin;
  
  // Cores
  const primaryColor = '#990000';
  const secondaryColor = '#333333';
  
  // CABEÇALHO DA EMPRESA
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('DISTRIBUIDORA DE CARNES VALE DO BOI', margin, 20);
  
  doc.setFontSize(12);
  doc.text('Rua dos Açougueiros, 123 - Centro - Cidade/UF', margin, 30);
  doc.text('Telefone: (11) 99999-9999 | Email: contato@valeddoboi.com.br', margin, 37);
  
  currentY = 55;
  
  // TÍTULO DO DOCUMENTO
  doc.setTextColor(secondaryColor);
  doc.setFontSize(16);
  doc.text('PEDIDO DE VENDA', margin, currentY);
  currentY += 15;
  
  // INFORMAÇÕES DO PEDIDO
  doc.setFontSize(12);
  doc.text(`Pedido: #${order.id.substring(0, 8)}`, margin, currentY);
  doc.text(`Data: ${formatDate(order.created_at)}`, margin + 100, currentY);
  doc.text(`Status: ${getStatusText(order.status)}`, margin + 200, currentY);
  currentY += 20;
  
  // DADOS DO CLIENTE
  doc.setFontSize(14);
  doc.setTextColor(primaryColor);
  doc.text('DADOS DO CLIENTE', margin, currentY);
  currentY += 10;
  
  doc.setTextColor(secondaryColor);
  doc.setFontSize(12);
  doc.text(`Empresa: ${order.customer?.company_name || 'Não informado'}`, margin, currentY);
  currentY += 8;
  
  if (order.customer?.contact_name) {
    doc.text(`Contato: ${order.customer.contact_name}`, margin, currentY);
    currentY += 8;
  }
  
  if (order.customer?.contact_phone) {
    doc.text(`Telefone: ${order.customer.contact_phone}`, margin, currentY);
    currentY += 8;
  }
  
  if (order.customer?.address) {
    doc.text(`Endereço: ${order.customer.address}`, margin, currentY);
    currentY += 8;
  }
  
  currentY += 10;
  
  // PRODUTOS
  doc.setFontSize(14);
  doc.setTextColor(primaryColor);
  doc.text('PRODUTOS', margin, currentY);
  currentY += 15;
  
  // Cabeçalho da tabela
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, currentY - 5, contentWidth, 10, 'F');
  
  doc.setTextColor(secondaryColor);
  doc.setFontSize(10);
  doc.text('PRODUTO', margin + 5, currentY);
  doc.text('QTD', margin + 120, currentY);
  doc.text('VALOR UNIT.', margin + 150, currentY);
  doc.text('TOTAL', margin + 200, currentY);
  
  currentY += 15;
  
  // Itens do pedido
  let subtotal = 0;
  
  if (order.items && order.items.length > 0) {
    order.items.forEach((item, index) => {
      // Verificar se precisa de nova página
      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = margin;
      }
      
      // Zebrar linhas
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, currentY - 5, contentWidth, 10, 'F');
      }
      
      doc.setTextColor(secondaryColor);
      doc.setFontSize(10);
      
      const productName = item.product?.name || `Produto ${item.product_id}`;
      const sku = item.product?.sku ? ` (${item.product.sku})` : '';
      
      doc.text(productName + sku, margin + 5, currentY);
      doc.text(`${item.quantity.toFixed(2)} kg`, margin + 120, currentY);
      doc.text(`R$ ${item.unit_price.toFixed(2)}`, margin + 150, currentY);
      doc.text(`R$ ${item.total_price.toFixed(2)}`, margin + 200, currentY);
      
      subtotal += item.total_price;
      currentY += 12;
    });
  } else {
    doc.text('Nenhum item encontrado', margin + 5, currentY);
    currentY += 15;
  }
  
  // Linha separadora
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 15;
  
  // TOTAIS
  doc.setFontSize(12);
  doc.setTextColor(secondaryColor);
  doc.text('Subtotal:', margin + 150, currentY);
  doc.text(`R$ ${subtotal.toFixed(2)}`, margin + 200, currentY);
  currentY += 10;
  
  doc.setFontSize(14);
  doc.setTextColor(primaryColor);
  doc.text('TOTAL GERAL:', margin + 150, currentY);
  doc.text(`R$ ${order.total_amount.toFixed(2)}`, margin + 200, currentY);
  currentY += 20;
  
  // OBSERVAÇÕES
  if (order.notes) {
    doc.setFontSize(14);
    doc.setTextColor(primaryColor);
    doc.text('OBSERVAÇÕES', margin, currentY);
    currentY += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor);
    
    // Quebrar texto em linhas
    const lines = doc.splitTextToSize(order.notes, contentWidth);
    lines.forEach((line: string) => {
      doc.text(line, margin, currentY);
      currentY += 6;
    });
    
    currentY += 10;
  }
  
  // RODAPÉ
  const footerY = pageHeight - 30;
  doc.setDrawColor(primaryColor);
  doc.line(margin, footerY, pageWidth - margin, footerY);
  
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  doc.text('Vale do Boi - Distribuição de Carnes', margin, footerY + 10);
  doc.text(`Documento gerado em ${new Date().toLocaleDateString('pt-BR')}`, margin, footerY + 20);
  
  doc.text('www.valeddoboi.com.br', pageWidth - margin - 50, footerY + 10);
  doc.text('contato@valeddoboi.com.br', pageWidth - margin - 50, footerY + 20);
  
  // Salvar PDF
  doc.save(`pedido_${order.id.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Funções auxiliares
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusText = (status: string): string => {
  switch (status) {
    case 'pending': return 'Pendente';
    case 'processing': return 'Em Processamento';
    case 'completed': return 'Concluído';
    case 'cancelled': return 'Cancelado';
    default: return status;
  }
};

// Export default corrigido
const pdfGenerator = { generateOrderPDF };
export default pdfGenerator; 