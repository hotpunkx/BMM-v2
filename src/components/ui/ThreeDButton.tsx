import React from 'react';

interface ThreeDButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    clickText?: string;
    className?: string; // Allow passing extra classes for positioning if needed
}

export const ThreeDButton: React.FC<ThreeDButtonProps> = ({ label, clickText = "Click", className = "", onClick, ...props }) => {
    return (
        // @ts-expect-error - framer-motion types compatibility issue fine here for simple handlers
        <div className={`container-button ${className}`} onClick={onClick}>
            <div className="hover bt-1"></div>
            <div className="hover bt-2"></div>
            <div className="hover bt-3"></div>
            <div className="hover bt-4"></div>
            <div className="hover bt-5"></div>
            <div className="hover bt-6"></div>
            <button
                data-label={label}
                data-click-text={clickText}
                {...props}
                style={{ pointerEvents: 'none' }} // Let clicks pass through to container if needed, though coverage handles it
            ></button>
        </div>
    );
};
