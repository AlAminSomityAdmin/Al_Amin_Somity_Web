// src/components/Loans/Application/DocumentUpload.tsx
import React, { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface DocumentUploadProps {
  onDocumentsChange: (documents: any[]) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onDocumentsChange }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    setUploading(true);
    setTimeout(() => {
      const newDocs = Array.from(files).map(file => ({ id: Date.now() + Math.random(), name: file.name, size: file.size, type: file.type, uploadedAt: new Date() }));
      const updated = [...documents, ...newDocs];
      setDocuments(updated);
      onDocumentsChange(updated);
      setUploading(false);
      event.target.value = '';
    }, 500);
  };

  const removeDocument = (id: number) => {
    const updated = documents.filter(d => d.id !== id);
    setDocuments(updated);
    onDocumentsChange(updated);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <p className="text-gray-600 mb-2">ডকুমেন্ট আপলোড করুন</p>
      <p className="text-sm text-gray-500 mb-4">NID, ফটোগ্রাফ, ইনকাম সার্টিফিকেট, ব্যাংক স্টেটমেন্ট</p>
      <input type="file" multiple onChange={handleFileUpload} disabled={uploading} className="hidden" id="doc-upload" />
      <label htmlFor="doc-upload" className={`inline-flex items-center px-4 py-2 rounded-md text-white ${uploading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 cursor-pointer'} transition-colors`}>
        {uploading ? 'আপলোড হচ্ছে...' : 'ফাইল নির্বাচন'}
      </label>
      {documents.length > 0 && (
        <div className="mt-4 text-left">
          <h4 className="font-medium mb-2">আপলোডকৃত ডকুমেন্ট ({documents.length})</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" /><div><div className="text-sm">{doc.name}</div><div className="text-xs text-gray-500">{formatFileSize(doc.size)}</div></div></div>
                <button onClick={() => removeDocument(doc.id)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;