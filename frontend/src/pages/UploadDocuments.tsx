import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, FileText, BookOpen, X, ArrowRight } from 'lucide-react';

export default function UploadDocuments() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const agentName = (location.state as { agentName?: string })?.agentName ?? agentId ?? '';
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [error, setError] = useState('');
  const isEditing = !!(location.state as any)?.isEditing;
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    setFiles(prev => [...prev, ...dropped]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
      setFiles(prev => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

const handleFinish = async () => {
  if (files.length === 0) return;
  setUploading(true);
  setError('');

  try {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }

    const response = await fetch(
      `http://localhost:8000/ingest-multiple?agent_name=${encodeURIComponent(agentName)}`,
      { method: 'POST', body: formData }
    );

    const data = await response.json();
    console.log(data);
    if (data.error) throw new Error(data.error);

    setUploadedCount(data.processed);
    navigate(`/chat/${agentId}`);

  } catch (err: any) {
    setError(err.message || 'Upload failed');
  } finally {
    setUploading(false);
  }
};

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="mb-8">
          {!isEditing && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              <Sparkles size={12} /> STEP 2 OF 2
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Add Documents' : 'Upload Documents'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {isEditing 
              ? <>Adding documents to <span className="text-violet-500 font-medium">"{agentName}"</span></>
              : <>Train your agent <span className="text-violet-500 font-medium">"{agentName}"</span></>
            }
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Drop zone */}
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-violet-200 rounded-2xl p-10 text-center hover:border-violet-400 transition-all bg-white mb-4"
        >
          <FileText size={40} className="mx-auto mb-3 text-violet-300" />
          <p className="text-sm font-semibold text-gray-700">Drop PDF files here</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">or click to browse</p>
          <label className="cursor-pointer inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 transition">
            Choose Files
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden mb-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <BookOpen size={20} className="text-violet-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                </div>
                <button onClick={() => removeFile(index)} className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-medium transition">
                  <X size={12} /> Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Progress */}
        {uploading && (
          <div className="bg-violet-50 border-2 border-violet-200 rounded-xl px-4 py-3 mb-4 text-sm text-violet-700 font-medium">
            Uploading {uploadedCount} / {files.length} files...
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleFinish}
          disabled={files.length === 0 || uploading}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white py-3 rounded-xl font-bold text-sm transition disabled:opacity-40 shadow-lg shadow-violet-200"
        >
          {uploading ? (
            'Processing...'
          ) : isEditing ? (
            <><span>Add Documents</span><ArrowRight size={15} /></>
          ) : (
            <><span>Upload & Finish</span><ArrowRight size={15} /></>
          )}
        </button>

        {/* Skip */}
        {!isEditing && (
          <button
            onClick={() => navigate(`/chat/${agentId}`)}
            className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600 transition py-2"
          >
            Skip for now
          </button>
        )}

      </div>
    </div>
  );
}