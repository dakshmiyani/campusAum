import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { StaffDocument } from '../../types';
import { FileText, Download, Filter, Search } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [docType, setDocType] = useState('');

  useEffect(() => {
    async function loadDocs() {
      setLoading(true);
      try {
        let url = '/documents';
        if (docType) url += `?documentType=${docType}`;
        const res = await api.get(url);
        setDocuments(res.data.data);
      } catch (err) {
        console.error('Error loading documents:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, [docType]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#D8C28A] pb-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#17243A]">Institutional Document Vault</h1>
          <p className="text-xs text-[#6F6A60]">
            Central repository of staff identity proofs, degrees, experience & appointment letters
          </p>
        </div>
      </div>

      <div className="bg-[#EFE8DA] border border-[#D8C28A] rounded-xl p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-[#6F6A60]" />
          <span className="text-xs font-bold text-[#17243A]">Filter Category:</span>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="bg-[#F8F4EC] border border-[#D8C28A] text-xs p-1.5 rounded-md text-[#17243A]"
          >
            <option value="">All Document Categories</option>
            <option value="DEGREE_CERTIFICATE">Degree Certificates</option>
            <option value="AADHAAR">Aadhaar Identity</option>
            <option value="PAN">PAN Cards</option>
            <option value="JOINING_LETTER">Joining Letters</option>
          </select>
        </div>
        <div className="text-xs font-semibold text-[#6F6A60]">{documents.length} Files Registered</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {documents.map((doc) => (
          <div key={doc.id} className="custom-card p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#D8C28A] pb-2">
              <Badge variant="navy">{doc.document_type}</Badge>
              <FileText className="w-5 h-5 text-[#C9A85C]" />
            </div>
            <h3 className="text-sm font-bold text-[#17243A] truncate">{doc.document_name}</h3>
            <div className="text-xs text-[#6F6A60]">
              Staff: <span className="font-bold text-[#17243A]">{doc.first_name} {doc.last_name}</span> ({doc.employee_code})
            </div>
            <div className="pt-2 border-t border-[#D8C28A] flex justify-between items-center text-xs">
              <span className="text-[#6F6A60]">Uploaded by {doc.uploaded_by || 'HR'}</span>
              <a
                href={doc.file_url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 bg-[#C9A85C] text-[#17243A] font-bold rounded-md hover:bg-[#D9BE7A]"
              >
                View PDF
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
