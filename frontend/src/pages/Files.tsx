import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { fileAPI } from '../services/api';
import { FileItem } from '../types';
import { Upload, File, FolderOpen, Search, Grid, List, Download, Trash2, MoreVertical, X, Eye, FileText, Image } from 'lucide-react';
import { formatFileSize } from '../utils/format';

export default function Files() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const fetchFiles = async () => {
    try {
      const { data } = await fileAPI.getFiles();
      setFiles(data.data.files || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchFiles(); }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    const formData = new FormData();
    acceptedFiles.forEach(f => formData.append('files', f));
    try {
      await fileAPI.uploadMultiple(formData);
      fetchFiles();
    } catch {}
    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleDelete = async (id: string) => {
    try {
      await fileAPI.deleteFile(id);
      setFiles(files.filter(f => f.id !== id));
    } catch {}
  };

  const filteredFiles = files.filter(f =>
    f.original_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (ext: string) => {
    const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
    const docExts = ['.pdf', '.docx', '.xlsx', '.pptx', '.txt'];
    const videoExts = ['.mp4', '.avi', '.mov', '.webm'];
    const codeExts = ['.js', '.ts', '.jsx', '.tsx', '.py', '.json', '.html', '.css'];
    if (imageExts.includes(ext)) return '🖼️';
    if (docExts.includes(ext)) return '📄';
    if (videoExts.includes(ext)) return '🎬';
    if (codeExts.includes(ext)) return '💻';
    if (['.zip', '.rar', '.tar', '.gz'].includes(ext)) return '📦';
    return '📁';
  };

  const isImage = (file: FileItem) => {
    const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
    return imageExts.includes(file.extension) || file.mime_type?.startsWith('image/');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Files</h1>
          <p className="text-surface-500 mt-1">Manage and share your files</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode('grid')} className={`btn-ghost p-2 ${viewMode === 'grid' ? 'bg-surface-100 dark:bg-surface-800' : ''}`}><Grid size={18} /></button>
          <button onClick={() => setViewMode('list')} className={`btn-ghost p-2 ${viewMode === 'list' ? 'bg-surface-100 dark:bg-surface-800' : ''}`}><List size={18} /></button>
        </div>
      </div>

      <div {...getRootProps()} className={`glass-card p-8 text-center cursor-pointer transition-all duration-300 border-2 border-dashed ${isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-surface-200 dark:border-surface-700'}`}>
        <input {...getInputProps()} />
        <Upload size={32} className="mx-auto mb-3 text-surface-400" />
        <p className="text-surface-600 dark:text-surface-400">
          {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
        </p>
        <p className="text-xs text-surface-400 mt-1">PNG, JPG, PDF, DOCX, MP4 and more</p>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-9 py-2"
        />
      </div>

      {uploading && (
        <div className="glass-card p-4 text-center text-sm text-surface-500">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent inline-block mr-2" />
          Uploading files...
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="w-full aspect-square rounded-xl bg-surface-200 dark:bg-surface-700 mb-3" />
              <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-3/4 mb-2" />
              <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredFiles.length === 0 ? (
            <div className="col-span-full text-center py-12 text-surface-400">
              <FolderOpen size={48} className="mx-auto mb-3 opacity-50" />
              <p>No files found</p>
            </div>
          ) : (
            filteredFiles.map((file) => (
              <div key={file.id} className="glass-card p-4 group hover:shadow-lg transition-all duration-300">
                <div
                  onClick={() => setPreviewFile(file)}
                  className="w-full aspect-square rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-4xl mb-3 cursor-pointer hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                >
                  {isImage(file) ? (
                    <img src={`/uploads/${file.stored_name}`} alt={file.original_name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    getFileIcon(file.extension)
                  )}
                </div>
                <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{file.original_name}</p>
                <p className="text-xs text-surface-400">{formatFileSize(file.size)}</p>
                <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={`/uploads/${file.stored_name}`} download={file.original_name} className="btn-ghost p-1.5"><Download size={14} /></a>
                  <button onClick={() => setPreviewFile(file)} className="btn-ghost p-1.5"><Eye size={14} /></button>
                  <button onClick={() => handleDelete(file.id)} className="btn-ghost p-1.5 text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-50 dark:bg-surface-800">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Size</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Uploaded</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {filteredFiles.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-surface-400">No files found</td></tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getFileIcon(file.extension)}</span>
                        <span className="text-sm font-medium text-surface-900 dark:text-white">{file.original_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-500">{formatFileSize(file.size)}</td>
                    <td className="px-4 py-3"><span className="badge-primary text-xs">{file.mime_type?.split('/')[1] || file.extension?.replace('.', '')?.toUpperCase()}</span></td>
                    <td className="px-4 py-3 text-sm text-surface-500">{new Date(file.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <a href={`/uploads/${file.stored_name}`} download={file.original_name} className="btn-ghost p-1.5 inline-flex"><Download size={14} /></a>
                      <button onClick={() => setPreviewFile(file)} className="btn-ghost p-1.5"><Eye size={14} /></button>
                      <button onClick={() => handleDelete(file.id)} className="btn-ghost p-1.5 text-red-500"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setPreviewFile(null)}>
          <div className="bg-white dark:bg-surface-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-800">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl">{getFileIcon(previewFile.extension)}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{previewFile.original_name}</p>
                  <p className="text-xs text-surface-500">{formatFileSize(previewFile.size)}</p>
                </div>
              </div>
              <button onClick={() => setPreviewFile(null)} className="btn-ghost p-2">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {isImage(previewFile) ? (
                <img src={`/uploads/${previewFile.stored_name}`} alt={previewFile.original_name} className="max-w-full max-h-[50vh] mx-auto rounded-xl" />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-surface-400">
                  <FileText size={64} className="mb-4" />
                  <p className="text-sm">Preview not available for this file type</p>
                  <a
                    href={`/uploads/${previewFile.stored_name}`}
                    download={previewFile.original_name}
                    className="btn-primary mt-4 gap-2"
                  >
                    <Download size={16} /> Download
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
