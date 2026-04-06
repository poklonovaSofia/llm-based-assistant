// src/pages/UploadDocuments.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function UploadDocuments() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Drag & Drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  // Вибір файлів
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter(f => f.type === "application/pdf");
      setFiles(prev => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinish = () => {
    setUploading(true);
    
    // Тут буде реальний запит на /ingest
    setTimeout(() => {
      setUploading(false);
      navigate(`/chat/${agentId}`);   // перехід у чат з агентом
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#f8f1e9] py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#2c1810]">Upload Documents</h1>
          <p className="text-gray-600 mt-3">Add knowledge to your new agent</p>
        </div>

        {/* Drag & Drop зона */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 rounded-3xl p-16 text-center hover:border-[#2c1810] transition-all bg-white"
        >
          <div className="mx-auto w-24 h-24 bg-[#f4d9b8]/30 rounded-3xl flex items-center justify-center text-6xl mb-6">
            📚
          </div>
          <p className="text-2xl font-medium text-[#2c1810]">Drop your PDF files here</p>
          <p className="text-gray-500 mt-2 mb-6">or click to select</p>

          <label className="cursor-pointer bg-[#2c1810] text-white px-12 py-4 rounded-2xl font-medium text-lg hover:bg-[#1f120b] transition">
            Choose PDF Files
            <input 
              type="file" 
              multiple 
              accept=".pdf" 
              onChange={handleFileSelect}
              className="hidden" 
            />
          </label>
        </div>

        {/* Список завантажених файлів */}
        {files.length > 0 && (
          <div className="mt-12">
            <h3 className="font-semibold text-lg mb-5">Selected files ({files.length})</h3>
            
            <div className="space-y-4">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">📘</span>
                    <div>
                      <p className="font-medium text-[#2c1810]">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Кнопка завершення */}
        <button
          onClick={handleFinish}
          disabled={files.length === 0 || uploading}
          className="mt-12 w-full bg-[#2c1810] text-white py-6 rounded-3xl font-semibold text-xl disabled:bg-gray-300 transition-all"
        >
          {uploading ? "Uploading documents..." : "Finish & Create Agent"}
        </button>
      </div>
    </div>
  );
}