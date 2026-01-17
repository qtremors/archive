/**
 * ContactModal - Modal contact form
 * Opens from footer button, allows quick message sending
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Mail, User, MessageSquare } from "lucide-react";

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    // Close on click outside
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("sending");

        // Create mailto link as fallback (works without backend)
        const subject = encodeURIComponent(`Portfolio Contact from ${formData.name}`);
        const body = encodeURIComponent(
            `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
        );

        // Open email client - use email from site config
        window.location.href = `mailto:singhamankumar207@gmail.com?subject=${subject}&body=${body}`;

        setStatus("sent");
        setTimeout(() => {
            setFormData({ name: "", email: "", message: "" });
            setStatus("idle");
            onClose();
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className="relative w-full max-w-md bg-[var(--bg)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Mail className="w-5 h-5 text-[var(--accent)]" />
                        Get in Touch
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
                            Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent)] transition-colors"
                                placeholder="Your name"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent)] transition-colors"
                                placeholder="your@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
                            Message
                        </label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-[var(--text-muted)]" />
                            <textarea
                                required
                                rows={4}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                                placeholder="What would you like to discuss?"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={status === "sending" || status === "sent"}
                        className="w-full py-3 px-4 bg-[var(--btn-bg)] text-[var(--btn-text)] rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[var(--btn-hover)] transition-colors disabled:opacity-50"
                    >
                        {status === "idle" && (
                            <>
                                <Send className="w-4 h-4" />
                                Send Message
                            </>
                        )}
                        {status === "sending" && "Opening email..."}
                        {status === "sent" && "✓ Email client opened!"}
                        {status === "error" && "Failed to send"}
                    </button>
                </form>
            </div>
        </div>
    );
}
