import { X } from "lucide-react";
import { NEWS_AGENT } from "@/config/site";

interface PersonalitySettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedPersonalityId: string;
    onSelectPersonality: (id: string) => void;
}

export function PersonalitySettingsModal({
    isOpen,
    onClose,
    selectedPersonalityId,
    onSelectPersonality,
}: PersonalitySettingsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[var(--np-paper)] w-full max-w-[500px] border-2 border-[var(--np-ink)] shadow-[8px_8px_0px_var(--np-ink)] p-6 relative animate-in fade-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 hover:bg-[var(--np-ink)] hover:text-[var(--np-paper)] transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <h3 className="font-display text-[1.5rem] font-bold uppercase tracking-widest mb-2 border-b-2 border-[var(--np-accent)] pb-2 inline-block">
                    Skye
                </h3>
                <p className="text-[0.9rem] italic text-[var(--np-ink-light)] mb-6">
                    Assign a new editor to the desk.
                </p>

                {/* Personality List */}
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {NEWS_AGENT.personalities.map((p) => (
                        <div
                            key={p.id}
                            onClick={() => onSelectPersonality(p.id)}
                            className={`
                                group relative p-4 border border-[var(--np-ink)] cursor-pointer transition-all duration-200
                                ${selectedPersonalityId === p.id
                                    ? "bg-[var(--np-ink)] text-[var(--np-paper)] ring-2 ring-[var(--np-accent)] ring-offset-2 ring-offset-[var(--np-paper)]"
                                    : "hover:bg-[color-mix(in_srgb,var(--np-ink)_5%,transparent)]"
                                }
                            `}
                        >
                            <div className="flex justify-between items-baseline mb-1">
                                <span className={`font-display font-bold uppercase tracking-wider ${selectedPersonalityId === p.id ? "text-[var(--np-paper)]" : "text-[var(--np-accent)]"}`}>
                                    {p.name}
                                </span>
                                {selectedPersonalityId === p.id && (
                                    <span className="text-[0.7rem] uppercase bg-[var(--np-accent)] text-[var(--np-paper)] px-2 py-0.5 rounded-full">
                                        Active
                                    </span>
                                )}
                            </div>
                            <p className={`text-[0.85rem] leading-relaxed ${selectedPersonalityId === p.id ? "text-[var(--np-paper)]/90" : "text-[var(--np-ink)]"}`}>
                                {p.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Footer Action */}
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-[var(--np-ink)] text-[var(--np-paper)] px-6 py-2 font-display font-bold uppercase tracking-widest hover:bg-[var(--np-accent)] transition-colors"
                    >
                        Back to Desk
                    </button>
                </div>
            </div>
        </div>
    );
}
