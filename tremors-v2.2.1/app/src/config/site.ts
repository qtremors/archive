/**
 * Site Configuration
 * Centralized configuration for easy customization
 */

import type { ContactLink, SkillCategory, SectionConfig } from "@/types";

// Site URL (for RSS feeds, meta tags, etc.)
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tremors.vercel.app";

// Personal Info
export const PERSONAL = {
    name: "Tremors",
    handle: "Tremors",
    tagline: "Full-Stack Python Developer",
    bio: "Building AI-powered platforms, real-time systems, and advanced developer tooling.",
    location: "India",
    availableForWork: true,
} as const;

// Contact Links
export const CONTACT_LINKS: ContactLink[] = [
    {
        id: "email",
        label: "Email",
        url: "mailto:singhamankumar207@gmail.com",
        icon: "📧",
    },
    {
        id: "github",
        label: "GitHub",
        url: "https://github.com/qtremors",
        icon: "🐙",
    },
    {
        id: "linkedin",
        label: "LinkedIn",
        url: "https://www.linkedin.com/in/aman-singh-0a1938301",
        icon: "💼",
    },
    {
        id: "resume",
        label: "Resume",
        url: "/Aman_Singh.pdf",
        icon: "📄",
    },
];

// Skills organized by category
export const SKILLS: SkillCategory[] = [
    {
        id: "frontend",
        label: "Frontend",
        skills: ["HTML", "CSS", "Tailwind", "JavaScript", "TypeScript", "React"],
    },
    {
        id: "backend",
        label: "Backend",
        skills: ["Python", "Django", "FastAPI", "SQLite", "Prisma", "PostgreSQL"],
    },
    {
        id: "data",
        label: "Data",
        skills: ["NumPy", "Pandas", "Matplotlib", "Plotly", "BeautifulSoup", "Streamlit"],
    },
    {
        id: "ai-ml",
        label: "AI / ML",
        skills: ["TensorFlow", "scikit-learn", "OpenCV", "Gemini API"],
    },
    {
        id: "tools",
        label: "Tools",
        skills: ["Git", "GitHub", "VS Code", "Jupyter", "Docker", "Linux", "Windows"],
    },
];

// Sections configuration (order and visibility)
export const SECTIONS: SectionConfig[] = [
    { id: "hero", title: "Hero", enabled: true, order: 0 },
    { id: "about", title: "About", enabled: true, order: 1 },
    { id: "skills", title: "Skills", enabled: true, order: 2 },
    { id: "projects", title: "Projects", enabled: true, order: 3 },
    { id: "activity", title: "Activity", enabled: true, order: 4 },
    { id: "contact", title: "Contact", enabled: true, order: 5 },
];

// GitHub configuration
export const GITHUB_CONFIG = {
    username: process.env.GITHUB_USERNAME || "qtremors",
    excludeTopic: "x",           // Repos with this topic are hidden
    featuredTopic: "portfolio",   // Repos with this topic are featured
    maxFeatured: 6,
    maxActivity: 10,
} as const;

// Data fetching limits (Q-002: centralized magic numbers)
export const DATA_LIMITS = {
    recentCommits: 30,      // Number of commits to fetch/cache
    recentActivity: 30,     // Number of activity items to display
    maxCommitsRefresh: 50,  // Max commits during admin refresh
    initialProjects: 5,     // Projects shown before "Load More"
    featuredProjects: 8,    // Max featured projects in newspaper mode
} as const;

// News Agent Configuration (Skye)
export const NEWS_AGENT = {
    name: "Skye",
    personalities: [
        {
            id: "tabloid",
            name: "The Void Crawler",
            description: "Sensationalist, dramatic 1920s tabloid style with a dash of The Onion.",
            prompt: "1920s tabloid + The Onion. Absurdly dramatic about coding. Sarcastic developer humor.",
        },
        {
            id: "senior",
            name: "Cynical Lead",
            description: "Passive-aggressive senior developer obsessed with clean code and technical debt.",
            prompt: "Passive-aggressive senior developer. Cynical about new frameworks. Obsessed with technical debt and 'the right way' to do things. Bitter but funny.",
        },
        {
            id: "scholar",
            name: "Dr. Quant",
            description: "Overly formal academic AI who treats commits like profound scientific discoveries.",
            prompt: "Pompous academic scholar. Uses overly complex vocabulary. Treats code commits like significant archaeological or scientific breakthroughs.",
        },
        {
            id: "hacker",
            name: "Shadow_Root",
            description: "Cyberpunk hacker from the depths of the mainframe.",
            prompt: "Cyberpunk hacker aesthetic. Use occasional leetspeak. Obsessed with 'the mainframe', 'the grid', and 'penetrating the firewall'. Gritty and mysterious.",
        }
    ]
} as const;

// Hero Section Terminal Configuration
// Edit this to change what appears in the code block
export const HERO_TERMINAL = {
    filename: "developer.py",
    lines: [
        { text: "class Developer:", color: "accent-cyan" },
        { text: `    name = "${PERSONAL.name}"`, color: "text" },
        { text: `    role = "${PERSONAL.tagline}"`, color: "text" },
        { text: '    focus = ["AI", "Backend", "DevTools"]', color: "text" },
        // The "available" line is handled dynamically - don't include it here
    ],
    // Animation speed in milliseconds (how long each line stays highlighted)
    highlightInterval: 2000,
} as const;

// Resume Page Configuration
export const RESUME = {
    // Summary paragraph
    summary: `Python Developer with a CSE degree, specializing in full-stack web applications and developer tooling. Built projects ranging from AI-powered learning platforms to high-performance desktop applications. Skilled in Django, FastAPI, React, and TypeScript with a focus on clean architecture and user experience.`,

    // About Me paragraphs (configurable)
    about: [
        `I am a Computer Science graduate and a Full-Stack Python Developer focused on the Django and FastAPI ecosystems. I build scalable backend systems and web applications, with experience ranging from real-time features using WebSockets to integrating generative AI models into production-ready apps.`,
        `Beyond application development, I enjoy building utilities that improve workflows or solve specific system-level problems. My recent work includes creating a CLI for Git visualization, a remote control API for system management, and a custom Terminal UI. I appreciate the details of how software interacts with the underlying system and strive to write clean, efficient code.`,
        `Currently, I am working on combining traditional web engineering with LLM capabilities to create smarter applications. I am looking for a developer role where I can apply my skills in Python and modern web technologies to build reliable and practical software.`,
    ],

    // Education
    education: [
        {
            institution: "L.J. Institute of Engineering and Technology, Ahmedabad",
            degree: "B.Tech in Computer Science Engineering",
            cgpa: "6.4",
            graduation: "September 2025",
        },
    ],

    // Experience
    experience: [
        {
            title: "Python Django Intern",
            company: "Maxgen Technologies Pvt. Ltd.",
            location: "Ahmedabad",
            period: "March 2025 – September 2025",
            bullets: [
                "Learned Django by extending an e-commerce template with custom features including user auth, wishlists, cart, and order management.",
                "Integrated Razorpay payment gateway for secure transactions.",
                "Identified code quality issues post-internship, leading to a full rebuild of the platform with improved architecture.",
            ],
        },
    ],

    // Certifications
    certifications: [
        { name: "HTML, CSS & JavaScript for Web Devs", issuer: "Johns Hopkins University (Coursera)", date: "January 2023" },
        { name: "Exploratory Data Analysis for Machine Learning", issuer: "IBM (Coursera)", date: "July 2023" },
        { name: "Algorithmic Thinking", issuer: "Rice University (Coursera)", date: "January 2024" },
        { name: "Building Generative AI-Powered Applications with Python", issuer: "IBM (Coursera)", date: "October 2024" },
        { name: "Machine Learning with Python", issuer: "IBM (Coursera)", date: "December 2024" },
    ],
} as const;

