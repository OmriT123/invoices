import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ProcessedInvoice } from '../types/invoice';
import { OMEGA_LOGO_URL, COMPANY_INFO } from './constants';

function addCompanyHeader(doc: jsPDF): void {
  // Add Omega logo
  doc.addImage(OMEGA_LOGO_URL, 'JPEG', 15, 15, 50, 20);
  
  // Company details
  doc.setFontSize(10);
  doc.text(COMPANY_INFO.name, 15, 45);
  doc.text(COMPANY_INFO.subname, 15, 50);
  doc.text(COMPANY_INFO.address, 15, 55);
  doc.text(COMPANY_INFO.city, 15, 60);
  doc.text(`VAT NM: ${COMPANY_INFO.vat}`, 15, 65);
  doc.text(`EMAIL: ${COMPANY_INFO.email}`, 15, 70);
}

function addInvoiceHeader(doc: jsPDF, invoice: ProcessedInvoice): void {
  doc.setFontSize(24);
  doc.text('INVOICE', 140, 30);
  doc.setFontSize(10);
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, 140, 45);
  doc.text(`Date: ${invoice.date}`, 140, 50);
  doc.text(`Incoterms: ${invoice.incoterms}`, 140, 55);
}

function addClientDetails(doc: jsPDF, invoice: ProcessedInvoice): void {
  doc.setFontSize(12);
  doc.text('Bill To:', 15, 80);
  doc.setFontSize(10);
  doc.text(invoice.clientDetails.name, 15, 87);
  doc.text(invoice.clientDetails.address.split('\n'), 15, 92);
  doc.text(`Tax ID: ${invoice.clientDetails.taxId}`, 15, 102);
  doc.text(invoice.clientDetails.email, 15, 107);
}

function addItemsTable(doc: jsPDF, invoice: ProcessedInvoice): void {
  autoTable(doc, {
    startY: 120,
    head: [['Description', 'Quantity', 'Unit Price', 'Total']],
    body: (invoice.items || []).map(item => [
      item.description,
      item.quantity.toString(),
      `$${item.unitPrice.toFixed(2)}`,
      `$${item.total.toFixed(2)}`
    ]),
    foot: [
      ['Subtotal:', '', '', `$${(invoice.subtotal || 0).toFixed(2)}`],
      ['Markup (2.5%):', '', '', `$${((invoice.markupTotal || 0) - (invoice.originalTotal || 0)).toFixed(2)}`],
      ['Total:', '', '', `$${(invoice.markupTotal || 0).toFixed(2)}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202] },
    footStyles: { fillColor: [255, 255, 255] }
  });
}

export function generateInvoicePDF(invoice: ProcessedInvoice): void {
  const doc = new jsPDF();
  
  addCompanyHeader(doc);
  addInvoiceHeader(doc, invoice);
  addClientDetails(doc, invoice);
  addItemsTable(doc, invoice);
  
  // Save the PDF
  doc.save(`omega-invoice-${invoice.invoiceNumber}.pdf`);
}