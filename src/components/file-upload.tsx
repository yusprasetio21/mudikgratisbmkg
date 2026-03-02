'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, FileText, Video } from 'lucide-react';

interface FileUploadProps {
  type: 'image' | 'pdf' | 'video';
  onUpload: (url: string, path: string) => void;
  currentFile?: string | null;
  accept?: string;
  maxSize?: number; // in MB
}

export default function FileUpload({
  type,
  onUpload,
  currentFile,
  accept,
  maxSize = 5,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const defaultAccept = {
    image: 'image/jpeg,image/jpg,image/png,image/webp',
    pdf: 'application/pdf',
    video: 'video/mp4,video/webm,video/ogg',
  }[type];

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File size must be less than ${maxSize}MB`);
        return;
      }

      setUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        const data = await response.json();
        onUpload(data.url, data.path);

        // Set preview for images
        if (type === 'image') {
          setPreview(data.url);
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert(error instanceof Error ? error.message : 'Failed to upload file');
      } finally {
        setUploading(false);
      }
    },
    [type, maxSize, onUpload]
  );

  const handleRemove = () => {
    onUpload('', '');
    setPreview(null);
  };

  const getIcon = () => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-8 w-8" />;
      case 'pdf':
        return <FileText className="h-8 w-8" />;
      case 'video':
        return <Video className="h-8 w-8" />;
      default:
        return <Upload className="h-8 w-8" />;
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'image':
        return 'Upload Image';
      case 'pdf':
        return 'Upload PDF';
      case 'video':
        return 'Upload Video';
      default:
        return 'Upload File';
    }
  };

  const displayFile = preview || currentFile;

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {!displayFile ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-muted p-4">{getIcon()}</div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">{getLabel()}</p>
              <p className="text-xs text-muted-foreground">
                Max file size: {maxSize}MB
              </p>
            </div>
            <input
              type="file"
              accept={accept || defaultAccept}
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
              id={`file-upload-${type}`}
            />
            <label htmlFor={`file-upload-${type}`}>
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                asChild
                className="cursor-pointer"
              >
                <span>
                  {uploading ? 'Uploading...' : 'Choose File'}
                </span>
              </Button>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            {type === 'image' && displayFile && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                <img
                  src={displayFile}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            {type === 'video' && displayFile && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                <video
                  src={displayFile}
                  controls
                  className="h-full w-full"
                />
              </div>
            )}
            {type === 'pdf' && (
              <div className="flex items-center space-x-3 rounded-lg border p-4">
                <FileText className="h-10 w-10 text-red-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {displayFile.split('/').pop()}
                  </p>
                  <p className="text-xs text-muted-foreground">PDF Document</p>
                </div>
              </div>
            )}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
