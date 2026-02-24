
import React from 'react';
import { useTVDisplay } from "@/hooks/useTVDisplay";

const SocialLinks = () => {
    // Hidden on TV mode to keep it clean, or maybe show small? User didn't specify, but usually TV is for display.
    // However, user said "add these social links", implying they want them visible.
    // Let's make them visible everywhere but maybe adjust size/spacing for TV if needed.

    return (
        <div className="flex items-center justify-center gap-3 mt-2">
            {/* Facebook */}
            <a
                href="https://www.facebook.com/profile.php?id=61571951906145"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-b from-[#18ACFE] to-[#0163E0] text-white w-10 h-10 flex items-center justify-center rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                aria-label="Facebook"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            </a>

            {/* Instagram */}
            <a
                href="https://www.instagram.com/ilmstudent.halls/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-bl from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white w-10 h-10 flex items-center justify-center rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                aria-label="Instagram"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.225-.149-4.771-1.664-4.919-4.919-.058-1.265-.071-1.644-.071-4.849 0-3.204.013-3.583.071-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.073-4.947-.2-4.356-2.623-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
            </a>

            {/* TikTok */}
            <a
                href="https://www.tiktok.com/@ilm.student.halls"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white w-10 h-10 flex items-center justify-center rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                aria-label="TikTok"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.65-1.62-1.12-1.76-1.57-2.35-4.33-2.35-6.6a.7.7 0 0 0-.08-.3zM9.54 1.88h-.13a.03.03 0 0 0-.03.03v15.25c.03 2.66-3.2 3.94-4.58 1.94-1.39-2.01.21-5.11 2.62-4.73a.85.85 0 0 0 .5-.05.88.88 0 0 0 .42-.56v-3.78c-4.43-.88-8.24 3.7-6.52 7.79 1.71 4.09 7.82 4.65 10.23 1.13.06-.09.11-.18.15-.28.16-.36.26-.75.29-1.14V1.9a.03.03 0 0 0-.03-.02z" />
                </svg>
            </a>

            {/* WhatsApp */}
            <a
                href="https://api.whatsapp.com/send?phone=447395202486&text=Hello%2C+I+clicked+on+your+link+for+Rose+House+student+accommodation+and+would+like+some+more+information+please."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-t from-[#25D366] to-[#4ce58b] text-white w-10 h-10 flex items-center justify-center rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                aria-label="WhatsApp"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            </a>
        </div>
    );
};

export default SocialLinks;
