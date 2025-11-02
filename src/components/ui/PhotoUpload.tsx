'use client';

import React, { useRef, useState } from 'react';
import { Camera, X, Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';

export interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

export default function PhotoUpload({
  photos,
  onChange,
  maxPhotos = 10,
  disabled = false
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Verificar limite
    if (photos.length + files.length > maxPhotos) {
      alert(`Você pode adicionar no máximo ${maxPhotos} fotos`);
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        // Validar tipo
        if (!file.type.startsWith('image/')) {
          throw new Error('Apenas imagens são permitidas');
        }

        // Validar tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Imagem muito grande. Tamanho máximo: 5MB');
        }

        // Criar FormData
        const formData = new FormData();
        formData.append('file', file);

        // Upload para Cloudinary via API
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          // Se Cloudinary não estiver configurado, usar placeholder
          if (error.error === 'Cloudinary não configurado') {
            console.warn('Cloudinary não configurado. Usando placeholder.');
            return `https://via.placeholder.com/400x300?text=${encodeURIComponent(file.name)}`;
          }
          throw new Error(error.error || 'Erro ao fazer upload');
        }

        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onChange([...photos, ...uploadedUrls]);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert(error instanceof Error ? error.message : 'Erro ao fazer upload das fotos');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onChange(newPhotos);
  };

  const canAddMore = photos.length < maxPhotos;

  return (
    <div className="space-y-4">
      {/* Grid de fotos */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden bg-secondary-100 group"
            >
              <Image
                src={photo}
                alt={`Foto ${index + 1}`}
                fill
                className="object-cover"
              />

              {/* Botão remover */}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  aria-label="Remover foto"
                >
                  <X size={16} />
                </button>
              )}

              {/* Badge de número */}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botão de adicionar */}
      {canAddMore && !disabled && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full px-4 py-8 border-2 border-dashed border-secondary-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors flex flex-col items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                <span className="text-sm text-secondary-600">
                  Fazendo upload...
                </span>
              </>
            ) : (
              <>
                <div className="p-3 bg-primary-100 rounded-full">
                  <Camera className="w-6 h-6 text-primary-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-secondary-900">
                    Adicionar fotos
                  </p>
                  <p className="text-xs text-secondary-600 mt-1">
                    {photos.length} de {maxPhotos} fotos
                  </p>
                </div>
              </>
            )}
          </button>
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-secondary-500 text-center">
        Formatos aceitos: JPG, PNG, WEBP • Tamanho máximo: 5MB por foto
      </p>
    </div>
  );
}
