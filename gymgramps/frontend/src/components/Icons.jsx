import React from 'react';

const svgProps = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
};

export const Icons = {
    Home: ({ className = "w-5 h-5" }) => (
        <svg {...svgProps} className={className}>
            <path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9" />
        </svg>
    ),
    Dumbbell: ({ className = "w-5 h-5" }) => (
        <svg {...svgProps} className={className}>
            <path d="M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11" />
        </svg>
    ),
    Apple: ({ className = "w-5 h-5" }) => (
        <svg {...svgProps} className={className}>
            <path d="M16.5 8.5c1.7-1.7 4-1.2 4-1.2s.5 2.5-1.5 4.2c1 .3 2 1.6 2 3.5 0 3-2.3 6-4.8 6-1 0-1.5-.6-3.2-.6s-2.3.6-3.3.6c-2.4 0-5-3.2-5-6.6 0-3.4 2.1-5.4 4.3-5.4 1.2 0 2.2.7 3 .7.7 0 1.9-.8 3.2-.8" /><path d="M12.3 6.2c.3-1.2 1.5-2.2 2.7-2.2 0 1.3-1 2.5-2.7 2.2Z" />
        </svg>
    ),
    Chat: ({ className = "w-5 h-5" }) => (
        <svg {...svgProps} className={className}>
            <path d="M4 5h16v11H8l-4 4V5Z" />
        </svg>
    ),
    User: ({ className = "w-5 h-5" }) => (
        <svg {...svgProps} className={className}>
            <circle cx="12" cy="8" r="3.2" /><path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" />
        </svg>
    ),
    Sun: ({ className = "w-5 h-5" }) => (
        <svg {...svgProps} className={className}>
            <circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
    ),
    Moon: ({ className = "w-5 h-5" }) => (
        <svg {...svgProps} className={className}>
            <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
        </svg>
    ),
    ChevronRight: ({ className = "w-5 h-5" }) => (
        <svg {...svgProps} className={className}>
            <path d="m9 6 6 6-6 6" />
        </svg>
    ),
    Clock: ({ className = "w-5 h-5" }) => (
        <svg {...svgProps} className={className}>
            <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" />
        </svg>
    ),
    Flame: ({ className = "w-5 h-5" }) => (
        <svg {...svgProps} className={className}>
            <path d="M12 3c1 3-3 4-3 7.5a3 3 0 0 0 6 0c0-1-.5-2-1-2.5 1.5.5 3 2.5 3 5.5a5.5 5.5 0 1 1-11 0C6 9 9 7 12 3Z" />
        </svg>
    ),
    Mail: ({ className = "w-5 h-5" }) => (
        <svg {...svgProps} className={className}>
            <rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4 6.5 8 6.5 8-6.5" />
        </svg>
    ),
    Lock: ({ className = "w-5 h-5" }) => (
        <svg {...svgProps} className={className}>
            <rect x="5" y="10.5" width="14" height="9" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
        </svg>
    ),
    Target: ({ className = "w-5 h-5" }) => (
        <svg {...svgProps} className={className}>
            <circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none" />
        </svg>
    ),
    Briefcase: ({ className = "w-5 h-5" }) => (
        <svg {...svgProps} className={className}>
            <rect x="3.5" y="7.5" width="17" height="12" rx="2" /><path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" /><path d="M3.5 12.5h17" />
        </svg>
    ),
    Book: ({ className = "w-5 h-5" }) => (
        <svg {...svgProps} className={className}>
            <path d="M4 5.5A2 2 0 0 1 6 4h5v16H6a2 2 0 0 1-2-2V5.5Z" /><path d="M20 5.5A2 2 0 0 0 18 4h-5v16h5a2 2 0 0 0 2-2V5.5Z" />
        </svg>
    ),
    Bed: ({ className = "w-5 h-5" }) => (
        <svg {...svgProps} className={className}>
            <path d="M3 10.5v7.5M3 15h18v3M21 15v-3a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v1" /><rect x="3" y="12" width="8" height="4" rx="1.4" />
        </svg>
    ),
    Plus: ({ className = "w-5 h-5" }) => (
        <svg {...svgProps} className={className}>
            <path d="M12 5v14M5 12h14" />
        </svg>
    ),
    Trash: ({ className = "w-5 h-5" }) => (
        <svg {...svgProps} className={className}>
            <path d="M4 7h16" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" /><path d="M10 11v6M14 11v6" />
        </svg>
    ),
    Check: ({ className = "w-5 h-5" }) => (
        <svg {...svgProps} className={className}>
            <path d="m5 12.5 4.5 4.5L19 7" />
        </svg>
    ),
    Send: ({ className = "w-5 h-5" }) => (
        <svg {...svgProps} className={className}>
            <path d="m4 4 16 8-16 8 4-8-4-8Z" />
        </svg>
    ),
    Logout: ({ className = "w-5 h-5" }) => (
        <svg {...svgProps} className={className}>
            <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" /><path d="M15 16l4-4-4-4" /><path d="M19 12H9" />
        </svg>
    ),
    Dots: ({ className = "w-5 h-5" }) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <circle cx="6" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="18" cy="12" r="1.5" />
        </svg>
    ),
    Eye: ({ className = "w-5 h-5" }) => (
        <svg {...svgProps} className={className}>
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
        </svg>
    ),
    EyeOff: ({ className = "w-5 h-5" }) => (
        <svg {...svgProps} className={className}>
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" />
        </svg>
    )
};
