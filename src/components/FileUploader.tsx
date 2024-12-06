import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import type { ProcessedInvoice } from '../types/invoice';
import { processInvoiceData } from '../utils/invoice';
import { generateInvoicePDF } from '../utils/pdf';
import { InvoicePreview } from './InvoicePreview';

export function FileUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedInvoice, setProcessedInvoice] = useState<ProcessedInvoice | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.includes('pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Convert PDF to base64
      const base64String = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]); // Remove data URL prefix
        };
        reader.readAsDataURL(file);
      });

      // Send to Make.com webhook
      // Replace with your actual webhook URL
      const response = await fetch('https://hook.eu2.make.com/gl4vn5sjsjvwjp2181xy8gne4xu8kqfx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          content: base64String,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process the invoice');
      }

      // The webhook will send back the processed data
      const responseClone = response.clone();
      try {
        const webhookData = await response.json();
        const processedData = processInvoiceData(webhookData.data || webhookData);
        setProcessedInvoice(processedData);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        try {
          const text = await responseClone.text();
          const processedData = processInvoiceData(text);
          setProcessedInvoice(processedData);
        } catch (textError) {
          throw new Error('Failed to process server response');
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process the invoice');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!processedInvoice) return;
    
    generateInvoicePDF(processedInvoice);
  }, [processedInvoice]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="max-w-xl mx-auto text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-3 text-lg font-semibold text-gray-900">
          Upload Turkish Invoice
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          PDF format only, maximum 10MB
        </p>
        {processedInvoice === null && (
          <p className="mt-4 text-sm text-gray-600">
            After uploading, you'll be prompted to enter the Israeli client details
          </p>
        )}
        
        <div className="mt-6">
          <label className="block">
            <input
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <span className={`
              inline-flex items-center px-6 py-3 rounded-md
              ${isUploading 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'}
              font-medium text-sm transition-colors
            `}>
              {isUploading ? 'Processing...' : 'Select PDF File'}
            </span>
          </label>
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
      </div>
      
      {processedInvoice && (
        <InvoicePreview
          invoice={processedInvoice}
          onDownload={handleDownload}
          onPrint={handlePrint}
        />
      )}
    </div>
  );
}