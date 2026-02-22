import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import { Loader2, CheckCircle2, AlertCircle, Upload, File as FileIcon } from 'lucide-react';

import { CATEGORIES } from '../constants';

const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Price must be a positive number',
  }),
  thumbnail: z.string().min(1, 'Thumbnail is required'),
  file_url: z.string().min(1, 'Product file is required'),
  demo_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  author_name: z.string().min(2, 'Author name must be at least 2 characters').optional().or(z.literal('')),
  category_id: z.string().min(1, 'Category is required'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  file_url: string;
  demo_url?: string;
  author_name?: string;
  category_id: number;
}

interface ProductFormProps {
  initialData?: Product | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ProductForm({ initialData, onSuccess, onCancel }: ProductFormProps) {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      price: initialData?.price?.toString() || '',
      thumbnail: initialData?.thumbnail || '',
      file_url: initialData?.file_url || '',
      demo_url: initialData?.demo_url || '',
      author_name: initialData?.author_name || '',
      category_id: initialData?.category_id?.toString() || '',
    },
  });

  const thumbnail = watch('thumbnail');
  const file_url = watch('file_url');

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    setError('');
    setSuccess(false);

    const url = initialData ? `/api/products/${initialData.id}` : '/api/products';
    const method = initialData ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          price: parseFloat(data.price),
          category_id: parseInt(data.category_id)
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || 'Failed to save product');
      }

      setSuccess(true);
      if (!initialData) {
        reset();
      }
      
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'file_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'thumbnail') setUploadingThumbnail(true);
    else setUploadingFile(true);
    setError('');

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setValue(type, data.url, { shouldValidate: true });
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      if (type === 'thumbnail') setUploadingThumbnail(false);
      else setUploadingFile(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        {initialData ? 'Edit Product' : 'Add New Product'}
      </h2>

      {(error || Object.keys(errors).length > 0) && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex flex-col gap-1 text-red-600 dark:text-red-400 text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error || 'Please fix the errors below'}
          </div>
          {Object.entries(errors).map(([key, err]) => (
            <p key={key} className="ml-8 text-xs">• {err?.message}</p>
          ))}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Product saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Product Title</label>
            <input
              type="text"
              {...register('title')}
              className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.title ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-all`}
              placeholder="e.g. Modern E-commerce Template"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Category</label>
            <select
              {...register('category_id')}
              className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.category_id ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-all`}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Price ($)</label>
            <input
              type="text"
              {...register('price')}
              className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.price ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-all`}
              placeholder="29.99"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Author Name</label>
            <input
              type="text"
              {...register('author_name')}
              className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.author_name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-all`}
              placeholder="e.g. ThemeFusion"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Live Preview URL</label>
            <input
              type="text"
              {...register('demo_url')}
              className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.demo_url ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-all`}
              placeholder="https://example.com/demo"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
            <textarea
              rows={4}
              {...register('description')}
              className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.description ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-all`}
              placeholder="Describe your product..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Thumbnail Image</label>
            <div 
              onClick={() => thumbnailInputRef.current?.click()}
              className={`relative aspect-video bg-slate-50 dark:bg-slate-800 border-2 border-dashed ${errors.thumbnail ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-all overflow-hidden group`}
            >
              {thumbnail ? (
                <>
                  <img src={thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                </>
              ) : (
                <>
                  {uploadingThumbnail ? (
                    <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-slate-400 mb-2" />
                      <span className="text-xs text-slate-500">Click to upload thumbnail</span>
                    </>
                  )}
                </>
              )}
              <input 
                type="file" 
                ref={thumbnailInputRef}
                onChange={(e) => handleFileUpload(e, 'thumbnail')}
                className="hidden" 
                accept="image/*"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Product File (ZIP, PDF, etc.)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative aspect-video bg-slate-50 dark:bg-slate-800 border-2 border-dashed ${errors.file_url ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-all group`}
            >
              {file_url ? (
                <div className="flex flex-col items-center">
                  <FileIcon className="h-10 w-10 text-emerald-600 mb-2" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">File Uploaded</span>
                  <span className="text-[10px] text-slate-400 mt-1 truncate max-w-[150px]">{file_url.split('/').pop()}</span>
                </div>
              ) : (
                <>
                  {uploadingFile ? (
                    <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-slate-400 mb-2" />
                      <span className="text-xs text-slate-500">Click to upload product file</span>
                    </>
                  )}
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e, 'file_url')}
                className="hidden" 
              />
            </div>
          </div>
        </div>

        <div className="pt-6 flex gap-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-grow py-4 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-grow py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : initialData ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
