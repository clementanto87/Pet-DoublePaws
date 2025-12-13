import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ImageUploadProps {
    value?: string | string[];
    onChange: (value: string | string[]) => void;
    multiple?: boolean;
    maxFiles?: number;
    className?: string;
    label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    value,
    onChange,
    multiple = false,
    maxFiles = 5,
    className,
    label
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Normalize value to array for easier handling
    const currentImages = Array.isArray(value) ? value : value ? [value] : [];

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await handleFiles(e.target.files);
        }
    };

    const handleFiles = async (files: FileList) => {
        setIsUploading(true);
        try {
            const formData = new FormData();

            if (multiple) {
                // If multiple allowed, append all
                Array.from(files).forEach(file => {
                    formData.append('images', file);
                });

                const response = await fetch('http://localhost:5001/api/upload/multiple', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                if (!response.ok) throw new Error('Upload failed');

                const data = await response.json();
                const newUrls = data.files.map((f: any) => f.url);

                // Combine with existing
                const updated = [...currentImages, ...newUrls].slice(0, maxFiles);
                onChange(updated);
            } else {
                // Single file
                formData.append('image', files[0]);

                const response = await fetch('http://localhost:5001/api/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                if (!response.ok) throw new Error('Upload failed');

                const data = await response.json();
                onChange(data.url);
            }
        } catch (error) {
            console.error("Upload error", error);
            // In a real app, show error toast
        } finally {
            setIsUploading(false);
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        }
    };

    const removeImage = (urlToRemove: string) => {
        if (multiple) {
            onChange(currentImages.filter(url => url !== urlToRemove));
        } else {
            onChange('');
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            {label && <label className="text-sm font-medium text-foreground">{label}</label>}

            {/* Image Preview Grid */}
            {currentImages.length > 0 && (
                <div className={cn(
                    "grid gap-4 mb-4",
                    multiple ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1 max-w-[200px]"
                )}>
                    {currentImages.map((url, index) => (
                        <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-border">
                            <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeImage(url)}
                                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Area */}
            {(multiple ? currentImages.length < maxFiles : currentImages.length === 0) && (
                <div
                    className={cn(
                        "border-2 border-dashed rounded-xl p-8 transition-colors text-center cursor-pointer",
                        dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50",
                        isUploading && "pointer-events-none opacity-50"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        multiple={multiple}
                        accept="image/*"
                        onChange={handleChange}
                    />

                    <div className="flex flex-col items-center gap-2">
                        {isUploading ? (
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        ) : (
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <Upload className="w-6 h-6 text-primary" />
                            </div>
                        )}
                        <p className="font-medium text-foreground">
                            {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {multiple ? `Max ${maxFiles} images` : 'Single image'} (JPG, PNG, GIF up to 5MB)
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
