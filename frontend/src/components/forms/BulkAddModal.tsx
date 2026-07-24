import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Upload, AlertCircle, Download, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface BulkAddModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BulkAddModal({ onSuccess, onCancel }: BulkAddModalProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewData, setPreviewData] = useState<any[][]>([]);
  const [duplicateRowIndices, setDuplicateRowIndices] = useState<Set<number>>(new Set());
  const [totalDuplicates, setTotalDuplicates] = useState(0);

  const mutation = useMutation({
    mutationFn: async (uploadFile: File) => {
      const formData = new FormData();
      formData.append('file', uploadFile);
      const res = await api.post('/residents/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      onSuccess();
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (selectedFile.name.endsWith('.xlsx')) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as any[][];
          
          let duplicates = new Set<number>();
          let dupCount = 0;
          if (json.length > 1) {
            const headers = json[0].map(String).map((h: string) => h.toLowerCase());
            const idColIdx = headers.findIndex((h: string) => h.includes('id') || h.includes('code'));
            
            if (idColIdx !== -1) {
              const seenIds = new Set<string>();
              for (let i = 1; i < json.length; i++) {
                const row = json[i];
                if (!row || row.length === 0) continue;
                const idVal = row[idColIdx];
                if (idVal) {
                  const idStr = String(idVal).trim().toLowerCase();
                  if (seenIds.has(idStr)) {
                    duplicates.add(i);
                    dupCount++;
                  } else {
                    seenIds.add(idStr);
                  }
                }
              }
            }
          }
          setDuplicateRowIndices(duplicates);
          setTotalDuplicates(dupCount);

          // If there are duplicates, make sure at least one duplicate is in the preview!
          if (dupCount > 0) {
            const firstDupIndex = Array.from(duplicates)[0];
            if (firstDupIndex > 5) {
               const preview = json.slice(0, 5); // top 4 data rows
               preview.push(json[firstDupIndex]); // add the duplicate row
               setPreviewData(preview);
            } else {
               setPreviewData(json.slice(0, 6));
            }
          } else {
            setPreviewData(json.slice(0, 6)); // header + up to 5 rows
          }
        } catch (error) {
          console.error("Failed to parse Excel for preview", error);
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      alert("Please upload a valid .xlsx file.");
      setPreviewData([]);
      setDuplicateRowIndices(new Set());
      setTotalDuplicates(0);
    }
  };

  const handleUpload = () => {
    if (file) {
      mutation.mutate(file);
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Sadhaka ID", "Name", "Phone", "Duration", "Date of Joining"],
      ["SAD-1001", "Raju", "9876543210", "15", "2024-01-01"],
      ["SAD-1002", "Krishna", "8765432109", "30", "2024-01-15"],
      ["SAD-1003", "Shyam", "7654321098", "Permanent", "2024-02-01"]
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    
    // Generate Excel file buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    // Create a Blob from the buffer and trigger download via Object URL
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = "Sadhaka_Bulk_Upload_Template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
        <div>
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 text-sm mb-1">Need a template?</h4>
          <p className="text-xs text-blue-600 dark:text-blue-300">Download the Excel template to ensure columns are correct.</p>
        </div>
        <button onClick={downloadTemplate} className="btn-secondary flex items-center text-sm bg-white dark:bg-slate-800">
          <Download className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" /> Template
        </button>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer ${dragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={handleChange}
        />
        
        {file ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="font-medium text-slate-800 dark:text-slate-200">{file.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-slate-500 dark:text-slate-400" />
            </div>
            <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">Click or drag Excel file here</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Supports .xlsx files only</p>
          </div>
        )}
      </div>

      {previewData.length > 1 && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Preview (Showing {previewData.length - 1} rows)
            </span>
            {totalDuplicates > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-3.5 h-3.5" />
                {totalDuplicates} duplicate ID{totalDuplicates > 1 ? 's' : ''} found in file
              </span>
            )}
          </div>
          <div className="overflow-x-auto max-h-48 custom-scrollbar">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
                <tr>
                  {previewData[0]?.map((col: string, i: number) => (
                    <th key={i} className="px-4 py-2 font-medium whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {previewData.slice(1).map((row: any[], i: number) => {
                  // If we manually pushed a duplicate from deep in the file to the end of preview array,
                  // its true index might not be i+1. But for simplicity, we check if this row's ID 
                  // is in a known duplicate ID set. Or we can just check if duplicateRowIndices has `i + 1` 
                  // (if it's in the first 5) or if it's the appended one.
                  // A better way: just check if the ID is a duplicate by counting occurrences in previewData?
                  // Actually, we can find the ID in the row and check if it's a duplicate visually!
                  
                  // Simple check: is this row one of the duplicates?
                  const headers = previewData[0].map(String).map((h: string) => h.toLowerCase());
                  const idColIdx = headers.findIndex((h: string) => h.includes('id') || h.includes('code'));
                  
                  // It's a duplicate if the original file had it as a duplicate.
                  // But we don't have seenIds here. We can just highlight the row if it's the exact duplicate index.
                  // Wait, since we might have appended the duplicate row at the end, let's just highlight it if it is a duplicate index.
                  const isAppendedDuplicate = (totalDuplicates > 0 && i === previewData.length - 2 && Array.from(duplicateRowIndices)[0] > 5);
                  const isDup = duplicateRowIndices.has(i + 1) || isAppendedDuplicate;

                  return (
                    <tr key={i} className={isDup ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}>
                      {previewData[0]?.map((_: any, colIdx: number) => (
                        <td key={colIdx} className={`px-4 py-2 whitespace-nowrap ${isDup && colIdx === idColIdx ? 'text-amber-600 font-bold dark:text-amber-400' : ''}`}>
                          {row[colIdx] || ''}
                          {isDup && colIdx === idColIdx && (
                            <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 font-semibold">
                              DUP
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mutation.isError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{(mutation.error as any)?.response?.data?.message || mutation.error?.message || 'Failed to upload'}</p>
        </div>
      )}

      {mutation.isSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm border border-green-100 dark:border-green-800">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <p>{mutation.data?.message || 'Bulk upload successful!'}</p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={mutation.isPending}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || mutation.isPending}
          className="btn-primary"
        >
          {mutation.isPending ? 'Uploading...' : 'Start Upload'}
        </button>
      </div>
    </div>
  );
}
