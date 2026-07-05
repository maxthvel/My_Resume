export type FreelanceProject = {
    title: string;
    client: string;
    url: string;
    tags: string[];
    image?: string;
    description: string;
    highlights: string[];
    stack: string[];
};

export const freelance: FreelanceProject[] = [
    {
        title: "MyGirivalam.in",
        client: "Spiritual tourism · Tiruvannamalai",
        url: "https://mygirivalam.in",
        tags: ["React", "Supabase", "SEO", "PWA"],
        image: "/freelance/mygirivalam.png",
        description:
            "A complete pilgrimage companion for the sacred 14 km Girivalam walk around Arunachala Hill — live GPS path tracking, Ashta Lingam temple timings, Pournami calendar with countdown, live weather, service bookings, and emergency contacts.",
        highlights: [
            "Deep SEO: structured metadata, Open Graph, geo-tags, and sitemap — ranks for high-intent pilgrimage queries",
            "Installable PWA with offline-friendly design for pilgrims walking with patchy connectivity",
            "Live GPS tracking of the 14 km circumambulation path with saved custom locations",
            "Supabase backend: auth, bookings, and user-saved spots",
        ],
        stack: ["React", "Supabase", "PWA", "Geolocation API", "SEO"],
    },
    {
        title: "JENT Journal Formatter",
        client: "IENT Publication",
        url: "http://carbonhorse.in/automatic_journal_formatter",
        tags: ["Python", "Document Automation"],
        image: "/freelance/journal-formatter.png", // JENT Formatter
        description:
            "Automated manuscript formatting for a 9-journal academic publisher: authors upload a raw .docx, the tool parses 11 manuscript sections and renders a camera-ready, journal-templated document in seconds instead of hours of manual typesetting.",
        highlights: [
            "28-step formatting pipeline: title, authors, affiliations, abstract, figures, tables, references, declarations",
            "Auto-detection of dates, captions, and DOI links; preserves Word equations (OMath) through conversion",
            "Multi-journal template system with per-journal headers, abbreviations, and DOI prefixes",
            "Turned a manual typesetting workflow into a self-serve upload → download tool",
        ],
        stack: ["Python", "python-docx", "Flask", "Document parsing"],
    },
    {
        title: "True Money Gold ERP",
        client: "Regulated precious-metal trading firm",
        url: "https://true-money-gold.vercel.app",
        tags: ["React", "Node.js", "ERP"],
        image: "/freelance/true-money-gold.png",   // True Money Gold
        description:
            "Procurement management system for regulated precious-metal trading — purchase capture, rate management, and compliance-friendly record keeping for a business where every gram must reconcile.",
        highlights: [
            "Procurement workflows built for auditability in a regulated domain",
            "Deployed on Vercel with environment-driven configuration",
        ],
        stack: ["React", "TypeScript", "Vercel"],
    },
    {
        title: "Loomline ERP",
        client: "Garment manufacturing",
        url: "https://onetexerp.vercel.app",
        tags: ["React", "Node.js", "ERP"],
        image: "/freelance/loomline.png",          // Loomline
        description:
            "ERP for garment manufacturing operations — order-to-production tracking with role-based access for factory staff and administrators.",
        highlights: [
            "Role-gated admin and operations views",
            "Production tracking tailored to textile workflows",
        ],
        stack: ["React", "TypeScript", "Vercel"],
    },
];