"use client";
import React, { useState } from 'react';
import { Search, Calendar, User, ArrowRight, Sparkles, Clock, BookOpen } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';
import BlogCard from '@/components/blog/BlogCard';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { IconWrapper } from '@/utils/iconMapper';
import Link from 'next/link';
import QualityPromise from '@/components/sections/QualityPromise';

export default function BlogPage() {
  const { blogCategories = [], blogPosts = [] } = useContent();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter posts based on category and search query
  const filteredPosts = (blogPosts || []).filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = (blogPosts || []).find(post => post.featured);

  return (
    <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="ambient-glow-blue -top-20 -left-20" />
      <div className="ambient-glow-cyan top-96 -right-20" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
        <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-14 text-center space-y-4 relative overflow-hidden">
          <span className="text-xs uppercase font-black tracking-wider text-cyan-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
            Ratgeber &amp; Meisterwissen
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Ratgeber &amp; Neuigkeiten rund um Haustechnik in Wetzlar
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-3xl mx-auto leading-relaxed font-normal">
            Praxisnahe Leitfäden zu Badsanierung, NIBE Wärmepumpen, bis zu 70% KfW-Förderung, Trinkwasserhygiene und Solarenergie von Ihrem Meisterbetrieb Bad &amp; Energie GmbH.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* MAIN CONTENT */}
          <div className="flex-1">

            {/* Search and Category Filter (Mobile & Tablet) */}
            <div className="lg:hidden mb-8 space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ratgeber durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white/90 shadow-sm text-xs font-bold focus:ring-2 focus:ring-[#0C3A87]"
                />
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              </div>

              <div className="overflow-x-auto pb-2 flex gap-2 scrollbar-hide">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-black transition-all ${
                    activeCategory === 'all'
                      ? 'bg-[#0C3A87] text-white shadow-md'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  Alle Themen
                </button>
                {blogCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-black transition-all ${
                      activeCategory === category.id
                        ? 'bg-[#0C3A87] text-white shadow-md'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Post Hero Card - Double Bezel */}
            {featuredPost && activeCategory === 'all' && !searchQuery && (
              <div className="mb-10">
                <div className="glass-bezel-outer shadow-2xl">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="glass-bezel-inner p-6 sm:p-8 block group"
                  >
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="relative h-60 sm:h-72 rounded-2xl overflow-hidden shadow-md">
                        <img
                          src={featuredPost.image}
                          alt={featuredPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <span className="absolute top-3 left-3 bg-[#E4040E] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">
                          ⭐ Empfohlener Leitfaden
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-bold">
                          <span className="flex items-center gap-1.5 bg-blue-50 text-[#0C3A87] px-3 py-1 rounded-full">
                            <Calendar className="w-3.5 h-3.5" />
                            {featuredPost.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {featuredPost.reading_time || '5'} Min. Lesezeit
                          </span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#0C3A87] transition-colors leading-tight">
                          {featuredPost.title}
                        </h2>

                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed font-medium">
                          {featuredPost.excerpt}
                        </p>

                        <div className="inline-flex items-center text-[#0C3A87] font-black text-xs group-hover:text-[#0E1C76] transition-colors pt-2">
                          Vollständigen Leitfaden lesen &rarr;
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            )}

            {/* Post Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredPosts.map((post) => (
                <div key={post.id}>
                  <BlogCard post={post} />
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredPosts.length === 0 && (
              <div className="glass-surface p-12 rounded-[2.5rem] text-center space-y-4">
                <Search className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-slate-600 font-bold text-sm">Keine Artikel zur Suchanfrage gefunden.</p>
                <button
                  onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                  className="px-6 py-2.5 bg-[#0C3A87] text-white font-black text-xs rounded-full shadow-md"
                >
                  Filter zurücksetzen
                </button>
              </div>
            )}
          </div>

          {/* SIDEBAR (Desktop) */}
          <div className="hidden lg:block w-80 shrink-0">
            <BlogSidebar
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>

        </div>
      </div>

      <QualityPromise />
    </div>
  );
}
