"use client";
import React, { useState } from 'react';
import { Share2, Mail, Link as LinkIcon, MessageCircle, Check } from 'lucide-react';
import { FacebookLogo as Facebook, TwitterLogo as Twitter, LinkedinLogo as Linkedin } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

/**
 * Share Buttons Component
 * Provides social media sharing options
 */
const ShareButtons = ({ url, title, description }) => {
    const [copied, setCopied] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);

    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://bad-energie.de');
    const shareTitle = title || (typeof document !== 'undefined' ? document.title : 'Bad & Energie GmbH');
    const shareDescription = description || '';

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`,
        email: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareDescription + '\n\n' + shareUrl)}`
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareDescription,
                    url: shareUrl
                });
            } catch (err) {
                // User cancelled or share failed
                console.log('Share cancelled or failed:', err);
            }
        } else {
            setShowShareMenu(!showShareMenu);
        }
    };

    return (
        <div className="relative">
            {/* Main Share Button */}
            <Button
                onClick={handleNativeShare}
                variant="outline"
                className="min-h-[44px] group"
            >
                <Share2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Teilen
            </Button>

            {/* Share Menu (fallback for desktop) */}
            {showShareMenu && (
                <div className="absolute top-full mt-2 right-0 z-50">
                    <div className="relative">
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl" />
                        <div className="relative p-4 min-w-[250px]">
                            <h4 className="font-bold text-[#1a3a52] mb-4">Artikel teilen</h4>

                            <div className="space-y-2">
                                {/* Facebook */}
                                <a
                                    href={shareLinks.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Facebook className="w-5 h-5 text-[#1877f2]" />
                                    <span className="text-sm font-medium text-[#2c3e50]">Facebook</span>
                                </a>

                                {/* Twitter/X */}
                                <a
                                    href={shareLinks.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Twitter className="w-5 h-5 text-[#1da1f2]" />
                                    <span className="text-sm font-medium text-[#2c3e50]">Twitter/X</span>
                                </a>

                                {/* LinkedIn */}
                                <a
                                    href={shareLinks.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Linkedin className="w-5 h-5 text-[#0a66c2]" />
                                    <span className="text-sm font-medium text-[#2c3e50]">LinkedIn</span>
                                </a>

                                {/* WhatsApp */}
                                <a
                                    href={shareLinks.whatsapp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <MessageCircle className="w-5 h-5 text-[#25d366]" />
                                    <span className="text-sm font-medium text-[#2c3e50]">WhatsApp</span>
                                </a>

                                {/* Email */}
                                <a
                                    href={shareLinks.email}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Mail className="w-5 h-5 text-[#ea4335]" />
                                    <span className="text-sm font-medium text-[#2c3e50]">E-Mail</span>
                                </a>

                                {/* Copy Link */}
                                <button
                                    onClick={handleCopyLink}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-5 h-5 text-[#c69c6d]" />
                                            <span className="text-sm font-medium text-[#c69c6d]">Link kopiert!</span>
                                        </>
                                    ) : (
                                        <>
                                            <LinkIcon className="w-5 h-5 text-[#2c3e50]" />
                                            <span className="text-sm font-medium text-[#2c3e50]">Link kopieren</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Close button */}
                            <button
                                onClick={() => setShowShareMenu(false)}
                                className="mt-4 w-full p-2 text-sm text-[#2c3e50]/60 hover:text-[#1a3a52] transition-colors"
                            >
                                Schließen
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Backdrop */}
            {showShareMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowShareMenu(false)}
                />
            )}
        </div>
    );
};

export default ShareButtons;
