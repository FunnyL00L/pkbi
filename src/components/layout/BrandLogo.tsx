import React, { useState } from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
}

export const PKBI_LOGO_IMAGE_URL =
  'https://res.cloudinary.com/diuclq0nb/image/upload/v1788677533/Screenshot_20260906-145038_ug9vvz.png';

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 40, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div
      className={`relative flex items-center justify-center select-none shrink-0 rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {imgFailed ? (
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full"
          aria-label="Logo PKBI Kabupaten Buleleng"
        >
          <circle cx="32" cy="32" r="30" fill="#1d4ed8" />
          <circle cx="32" cy="32" r="24" fill="none" stroke="#93c5fd" strokeWidth="2" />
          <path
            d="M32 16c-5 0-9 4-9 9 0 7 9 16 9 16s9-9 9-16c0-5-4-9-9-9zm0 12.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"
            fill="#ffffff"
          />
          <text
            x="32"
            y="53"
            textAnchor="middle"
            fill="#e0f2fe"
            fontSize="8"
            fontWeight="700"
            fontFamily="sans-serif"
          >
            PKBI
          </text>
        </svg>
      ) : (
        <img
          src={PKBI_LOGO_IMAGE_URL}
          alt="Logo PKBI Kabupaten Buleleng"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-contain rounded-full"
        />
      )}
    </div>
  );
};
