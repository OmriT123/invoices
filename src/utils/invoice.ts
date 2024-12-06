export function applyMarkup(amount: number, markupPercentage: number = 2.5): number {
  return Number((amount * (1 + markupPercentage / 100)).toFixed(2));
}

interface InvoiceResponse {
  invoice: {
    number: string;
    date: string;
    proformaNumber?: string;
    lcNumber?: string;
  };
  delivery: {
    terms: string;
    shipmentVia?: string;
    orderNumber?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    currency: string;
    total: number;
  }>;
  totals: {
    currency: string;
    amount: number;
  };
}

function sanitizeJSON(data: any): any {
  if (typeof data === 'string') {
    try {
      // First try to parse as is
      const parsed = JSON.parse(data);
      return parsed.data || parsed;
    } catch (e) {
      // Try to find the complete JSON object
      try {
        const jsonStart = data.indexOf('{');
        const jsonEnd = data.lastIndexOf('}') + 1;
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          const jsonStr = data.slice(jsonStart, jsonEnd);
          const parsed = JSON.parse(jsonStr);
          return parsed.data || parsed;
        }
      } catch {
        // If both parsing attempts fail, throw error
        throw new Error('Invalid JSON format');
      }
      throw new Error('Invalid JSON format');
    }
  }
  return data.data || data;
}

function calculateItemTotal(item: any): number {
  const quantity = Number(item.quantity) || 0;
  const unitPrice = Number(item.unitPrice) || 0;
  return Number((quantity * unitPrice).toFixed(2));
}

export function processInvoiceData(data: any): ProcessedInvoice {
  // Sanitize and parse the JSON data
  const parsedData = sanitizeJSON(data) as InvoiceResponse;
  
  // Process items with proper calculations
  const items = (parsedData?.items || []).map(item => ({
    description: item.description,
    quantity: Number(item.quantity || 0),
    unitPrice: Number(item.unitPrice || 0),
    total: Number(item.total || 0) || calculateItemTotal(item)
  }));

  // Calculate totals
  const subtotal = Number(parsedData?.totals?.amount || 0) || 
                  items.reduce((sum, item) => sum + (item.total || 0), 0);
  const originalTotal = subtotal;
  const markupTotal = applyMarkup(originalTotal);

  const invoiceNumber = parsedData?.invoice?.number || 
                       `OMG-${new Date().getTime()}`;

  const invoiceData: InvoiceData = {
    invoiceNumber,
    date: parsedData?.invoice?.date || 
          new Date().toISOString().split('T')[0],
    incoterms: parsedData?.delivery?.terms || 'CIF',
    items,
    subtotal,
    originalTotal,
    markupTotal
  };

  return {
    ...invoiceData,
    clientDetails: null,
    markupApplied: true,
  };
}