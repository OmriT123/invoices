export interface ClientDetails {
  name: string;
  address: string;
  taxId: string;
  email: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  incoterms: string;
  items: InvoiceItem[];
  subtotal: number;
  originalTotal: number;
  markupTotal: number;
}

export interface ProcessedInvoice extends InvoiceData {
  clientDetails: ClientDetails;
  markupApplied: boolean;
}