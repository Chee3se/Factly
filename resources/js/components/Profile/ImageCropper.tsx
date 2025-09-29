import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {Dialog, DialogContent, DialogTitle} from '@/components/ui/dialog';
import { Check, X } from 'lucide-react';

interface ImageCropperProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    imageFile: File | null;
    onCropComplete: (croppedFile: File) => void;
}

interface CropArea {
    x: number;
    y: number;
    size: number;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
                                                              open,
                                                              onOpenChange,
                                                              imageFile,
                                                              onCropComplete
                                                          }) => {
    const [imageSrc, setImageSrc] = useState<string>('');
    const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, size: 200 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [previewSrc, setPreviewSrc] = useState<string>('');

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const cropperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (imageFile && open) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setImageSrc(result);
            };
            reader.readAsDataURL(imageFile);
        }
    }, [imageFile, open]);

    useEffect(() => {
        if (imageSrc) {
            const img = new Image();
            img.onload = () => {
                const containerWidth = 600;
                const containerHeight = 600;

                let displayWidth = img.naturalWidth;
                let displayHeight = img.naturalHeight;

                const scale = Math.min(containerWidth / displayWidth, containerHeight / displayHeight);
                displayWidth *= scale;
                displayHeight *= scale;

                setImageSize({ width: displayWidth, height: displayHeight });

                const maxSize = Math.min(displayWidth, displayHeight) * 0.6;
                setCropArea({
                    x: (displayWidth - maxSize) / 2,
                    y: (displayHeight - maxSize) / 2,
                    size: maxSize
                });
            };
            img.src = imageSrc;
        }
    }, [imageSrc]);

    useEffect(() => {
        if (imageSrc && imageSize.width > 0) {
            updatePreview();
        }
    }, [cropArea, imageSrc, imageSize]);

    const updatePreview = () => {
        if (!imageRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = imageRef.current;

        const scaleX = img.naturalWidth / imageSize.width;
        const scaleY = img.naturalHeight / imageSize.height;

        const sourceX = cropArea.x * scaleX;
        const sourceY = cropArea.y * scaleY;
        const sourceSize = cropArea.size * Math.min(scaleX, scaleY);

        canvas.width = 80;
        canvas.height = 80;

        ctx.drawImage(
            img,
            sourceX, sourceY, sourceSize, sourceSize,
            0, 0, 80, 80
        );

        setPreviewSrc(canvas.toDataURL());
    };

    const handleMouseDown = (e: React.MouseEvent, action: 'drag' | 'resize') => {
        e.preventDefault();
        if (!cropperRef.current) return;

        const rect = cropperRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * imageSize.width;
        const y = ((e.clientY - rect.top) / rect.height) * imageSize.height;

        setDragStart({
            x: (x - cropArea.x) * rect.width / imageSize.width,
            y: (y - cropArea.y) * rect.height / imageSize.height
        });

        if (action === 'drag') {
            setIsDragging(true);
        } else {
            setIsResizing(true);
        }
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!cropperRef.current || !imageSize.width || !imageSize.height) return;

        const rect = cropperRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * imageSize.width;
        const y = ((e.clientY - rect.top) / rect.height) * imageSize.height;

        if (isDragging) {
            const newX = Math.max(0, Math.min(x - (dragStart.x * imageSize.width / rect.width), imageSize.width - cropArea.size));
            const newY = Math.max(0, Math.min(y - (dragStart.y * imageSize.height / rect.height), imageSize.height - cropArea.size));

            setCropArea(prev => ({ ...prev, x: newX, y: newY }));
        } else if (isResizing) {
            const centerX = cropArea.x + cropArea.size / 2;
            const centerY = cropArea.y + cropArea.size / 2;

            const distance = Math.max(Math.abs(x - centerX), Math.abs(y - centerY)) * 2;
            const maxSize = Math.min(
                imageSize.width - cropArea.x,
                imageSize.height - cropArea.y,
                cropArea.x + cropArea.size,
                cropArea.y + cropArea.size
            ) * 2;

            const newSize = Math.max(50, Math.min(distance, maxSize, imageSize.width, imageSize.height));
            const newX = Math.max(0, Math.min(centerX - newSize / 2, imageSize.width - newSize));
            const newY = Math.max(0, Math.min(centerY - newSize / 2, imageSize.height - newSize));

            setCropArea({ x: newX, y: newY, size: newSize });
        }
    }, [isDragging, isResizing, cropArea, imageSize, dragStart]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setIsResizing(false);
    }, []);

    useEffect(() => {
        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

    const handleCrop = async () => {
        if (!imageRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = imageRef.current;

        const scaleX = img.naturalWidth / imageSize.width;
        const scaleY = img.naturalHeight / imageSize.height;

        const sourceX = cropArea.x * scaleX;
        const sourceY = cropArea.y * scaleY;
        const sourceSize = cropArea.size * Math.min(scaleX, scaleY);

        canvas.width = 400;
        canvas.height = 400;

        ctx.drawImage(
            img,
            sourceX, sourceY, sourceSize, sourceSize,
            0, 0, 400, 400
        );

        canvas.toBlob((blob) => {
            if (blob) {
                const croppedFile = new File([blob], imageFile?.name || 'cropped-image.jpg', {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });
                onCropComplete(croppedFile);
                onOpenChange(false);
            }
        }, 'image/jpeg', 0.9);
    };

    if (!open || !imageSrc) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange} >
            <DialogContent className="p-0 border-0 -ml-11 w-fit h-fit overflow-visible bg-transparent data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                showCloseButton={false}
            >
                <DialogTitle></DialogTitle>
                {/* Container with padding to ensure buttons are visible */}
                <div className="rounded-xl">
                    <div
                        className="relative bg-black rounded-xl"
                        style={{
                            width: `${imageSize.width}px`,
                            height: `${imageSize.height}px`,
                            maxWidth: 'calc(90vw - 3rem)',
                            maxHeight: 'calc(90vh - 3rem)'
                        }}
                    >
                        {/* Close button - positioned absolutely in top right */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onOpenChange(false)}
                            className="absolute top-6 right-6 z-20 cursor-pointer bg-black/50 hover:bg-black/70 text-white hover:text-gray-400 w-10 h-10 rounded-full"
                        >
                            <X className="h-6 w-6" />
                        </Button>

                        {/* Cropping Area */}
                        <div
                            ref={cropperRef}
                            className="relative w-full h-full overflow-hidden rounded-xl"
                        >
                            <img
                                ref={imageRef}
                                src={imageSrc}
                                alt="Crop"
                                className="w-full h-full object-cover select-none rounded-xl"
                                draggable={false}
                            />

                            {/* Crop overlay */}
                            <div className="absolute inset-0">
                                {/* Dark overlay */}
                                <div className="absolute inset-0 bg-black/50" />

                                {/* Clear crop area - forced to be square */}
                                <div
                                    className="absolute bg-transparent border-2 border-white cursor-move shadow-lg"
                                    style={{
                                        left: `${(cropArea.x / imageSize.width) * 100}%`,
                                        top: `${(cropArea.y / imageSize.height) * 100}%`,
                                        width: `${(cropArea.size / imageSize.width) * 100}%`,
                                        height: `${(cropArea.size / imageSize.height) * 100}%`,
                                        aspectRatio: '1 / 1'
                                    }}
                                    onMouseDown={(e) => handleMouseDown(e, 'drag')}
                                >
                                    {/* Remove overlay from crop area */}
                                    <div className="absolute inset-0 bg-black/50" style={{ mixBlendMode: 'difference' }} />

                                    {/* Grid lines for better visibility */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        <div className="absolute top-0 left-1/3 w-px h-full bg-white/40" />
                                        <div className="absolute top-0 left-2/3 w-px h-full bg-white/40" />
                                        <div className="absolute top-1/3 left-0 w-full h-px bg-white/40" />
                                        <div className="absolute top-2/3 left-0 w-full h-px bg-white/40" />
                                    </div>

                                    {/* Resize handle */}
                                    <div
                                        className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full border-2 border-gray-300 cursor-se-resize flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            handleMouseDown(e, 'resize');
                                        }}
                                    >
                                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                    </div>
                                </div>
                            </div>

                            {/* Preview positioned at bottom center */}
                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                                <div className="w-20 h-20 rounded-full overflow-hidden bg-white shadow-lg">
                                    {previewSrc && (
                                        <img
                                            src={previewSrc}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Crop button positioned outside the image area */}
                        <div className="absolute bottom-6 right-6 z-10">
                            <Button
                                size="sm"
                                onClick={handleCrop}
                                className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                            >
                                <Check className="h-4 w-4 mr-2" />
                                Crop
                            </Button>
                        </div>
                    </div>
                </div>

                <canvas ref={canvasRef} className="hidden" />
            </DialogContent>
        </Dialog>
    );
};
