import React, { useRef, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { appStore } from '../stores/AppStore';

interface BeforeAfterSliderProps {
    beforeImage: string;
    afterImage: string;
    className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = observer(({
    beforeImage,
    afterImage,
    className = ''
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        appStore.setSliderPosition(percentage);
    }, []);

    const handleMouseDown = useCallback(() => {
        setIsDragging(true);
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging) {
            handleMove(e.clientX);
        }
    }, [isDragging, handleMove]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length > 0) {
            handleMove(e.touches[0].clientX);
        }
    }, [handleMove]);

    React.useEffect(() => {
        const handleGlobalMouseUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full overflow-hidden select-none ${className}`}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
        >
            {/* Before Image (Original) */}
            <div className="absolute inset-0">
                <img
                    src={beforeImage}
                    alt="Original"
                    className="w-full h-full object-contain"
                    draggable={false}
                />
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                    Original
                </div>
            </div>

            {/* After Image (Processed) - with clip */}
            <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 0 0 ${appStore.sliderPosition}%)` }}
            >
                {/* White opaque base layer to block the original image */}
                <div className="absolute inset-0 bg-white" />

                {/* Checkerboard pattern background for transparency */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                    }}
                />

                {/* Processed image with transparency on top of background */}
                <img
                    src={afterImage}
                    alt="Processed"
                    className="absolute inset-0 w-full h-full object-contain"
                    draggable={false}
                />

                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                    Processed
                </div>
            </div>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-lg"
                style={{ left: `${appStore.sliderPosition}%`, transform: 'translateX(-50%)' }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
            >
                {/* Handle Circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-primary">
                    <div className="flex gap-1">
                        <span className="material-symbols-outlined text-primary text-[20px]">chevron_left</span>
                        <span className="material-symbols-outlined text-primary text-[20px]">chevron_right</span>
                    </div>
                </div>
            </div>
        </div>
    );
});
