"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { List } from 'lucide-react';

const TableOfContents = ({ content }) => {
    const [activeId, setActiveId] = useState('');

    const headings = useMemo(() => {
        const lines = (content ?? '').split('\n');
        return lines
            .filter(line => line.trim().startsWith('## ') || line.trim().startsWith('### '))
            .map(line => {
                const trimmedLine = line.trim();
                const level = trimmedLine.match(/^#+/)[0].length;
                const text = trimmedLine.replace(/^#+\s+/, '');
                const plainText = text.replace(/[*_\[\]()]+/g, '');
                const id = plainText.toLowerCase().replace(/[^a-z0-9äöüß]+/g, '-').replace(/(^-|-$)+/g, '');
                return { id, text, level };
            });
    }, [content]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -66% 0px' }
        );

        headings.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [headings]);

    if (headings.length === 0) return null;

    return (
        <div className="hidden lg:block sticky top-32 ml-8 w-64 p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg">
            <p className="flex items-center gap-2 font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">
                <List className="w-4 h-4 text-primary-600" />
                Inhalt
            </p>
            <nav className="space-y-1 relative">
                {/* Active Indicator Line matches list height via CSS or direct styling */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gray-100 rounded-full" />

                {headings.map(({ id, text, level }) => (
                    <a
                        key={id}
                        href={`#${id}`}
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                            setActiveId(id);
                        }}
                        className={`block text-sm py-2 pl-4 border-l-2 transition-all duration-300 ${activeId === id
                            ? 'border-primary-600 text-primary-700 font-medium -ml-[2px]'
                            : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300 -ml-[2px]'
                            }`}
                        style={{ marginLeft: level === 3 ? '1rem' : '0' }}
                    >
                        {text}
                    </a>
                ))}
            </nav>
        </div>
    );
};

export default TableOfContents;
