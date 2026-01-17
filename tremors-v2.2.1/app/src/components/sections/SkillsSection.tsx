/**
 * SkillsSection - Animated horizontal scrolling skill icons by category
 */

"use client";

import { SKILLS } from "@/config/site";
import {
    SiPython,
    SiDjango,
    SiFastapi,
    SiPostgresql,
    SiSqlite,
    SiReact,
    SiTypescript,
    SiJavascript,
    SiHtml5,
    SiCss,
    SiTailwindcss,
    SiPrisma,
    SiTensorflow,
    SiGoogle,
    SiNumpy,
    SiPandas,
    SiPlotly,
    SiStreamlit,
    SiScikitlearn,
    SiOpencv,
    SiGit,
    SiGithub,
    SiDocker,
    SiLinux,
    SiJupyter,

} from "@icons-pack/react-simple-icons";
import { Code2, FlaskConical, Monitor } from "lucide-react";

// Map skill names to Simple Icons with brand colors
const iconMap: Record<string, { icon: React.ElementType; color: string }> = {
    // Frontend
    HTML: { icon: SiHtml5, color: "#E34F26" },
    CSS: { icon: SiCss, color: "#1572B6" },
    Tailwind: { icon: SiTailwindcss, color: "#06B6D4" },
    JavaScript: { icon: SiJavascript, color: "#F7DF1E" },
    TypeScript: { icon: SiTypescript, color: "#3178C6" },
    React: { icon: SiReact, color: "#61DAFB" },
    // Backend
    Python: { icon: SiPython, color: "#3776AB" },
    Django: { icon: SiDjango, color: "#092E20" },
    FastAPI: { icon: SiFastapi, color: "#009688" },
    SQLite: { icon: SiSqlite, color: "#003B57" },
    Prisma: { icon: SiPrisma, color: "#2D3748" },
    PostgreSQL: { icon: SiPostgresql, color: "#4169E1" },
    // Data
    NumPy: { icon: SiNumpy, color: "#013243" },
    Pandas: { icon: SiPandas, color: "#150458" },
    Matplotlib: { icon: FlaskConical, color: "#11557C" },
    Plotly: { icon: SiPlotly, color: "#3F4F75" },
    BeautifulSoup: { icon: FlaskConical, color: "#3776AB" },
    Streamlit: { icon: SiStreamlit, color: "#FF4B4B" },
    // AI/ML
    TensorFlow: { icon: SiTensorflow, color: "#FF6F00" },
    "scikit-learn": { icon: SiScikitlearn, color: "#F7931E" },
    OpenCV: { icon: SiOpencv, color: "#5C3EE8" },
    "Gemini API": { icon: SiGoogle, color: "#4285F4" },
    // Tools
    Git: { icon: SiGit, color: "#F05032" },
    GitHub: { icon: SiGithub, color: "currentColor" },
    "VS Code": { icon: Code2, color: "#007ACC" },
    Jupyter: { icon: SiJupyter, color: "#F37626" },
    Docker: { icon: SiDocker, color: "#2496ED" },
    Linux: { icon: SiLinux, color: "#FCC624" },
    Windows: { icon: Monitor, color: "#0078D4" },
};

// Skill icon component
const SkillIcon = ({ name }: { name: string }) => {
    const iconData = iconMap[name];
    if (!iconData) return null;

    const IconComponent = iconData.icon;
    if (IconComponent === Code2) {
        return <IconComponent className="w-5 h-5" style={{ color: iconData.color }} />;
    }
    return <IconComponent size={20} color={iconData.color} />;
};

export function SkillsSection() {
    return (
        <section id="skills" className="mb-24">
            <div className="flex items-center gap-4 mb-10">
                <h2 className="text-3xl font-bold">Skills</h2>
                <span className="flex-1 h-px bg-[var(--border)]" />
            </div>

            {/* Each category on its own row */}
            <div className="space-y-4">
                {SKILLS.map((category, idx) => (
                    <div key={category.id} className="relative overflow-hidden">
                        {/* Fade edges */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-24 bg-gradient-to-r from-[var(--bg)] to-transparent z-10" />
                        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-24 bg-gradient-to-l from-[var(--bg)] to-transparent z-10" />

                        {/* Scrolling container - alternate direction for visual interest */}
                        <div
                            className={`flex gap-16 py-3 ${idx % 2 === 0 ? 'animate-marquee' : 'animate-marquee-reverse'}`}
                        >
                            {[...category.skills, ...category.skills, ...category.skills, ...category.skills].map((skill, i) => (
                                <div
                                    key={`${skill}-${i}`}
                                    className="flex items-center gap-2 shrink-0 hover:opacity-70 transition-opacity"
                                >
                                    <SkillIcon name={skill} />
                                    <span className="text-sm text-[var(--text-muted)] whitespace-nowrap">{skill}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
