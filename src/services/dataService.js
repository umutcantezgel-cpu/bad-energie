/**
 * Data Service
 * Handles reading and writing content data.
 * Implements a "Local-First" strategy:
 * 1. Checks localStorage for overrides.
 * 2. Falls back to default config files (Single Source of Truth).
 */

import COMPANY_DATA from '@/config/company';
import SERVICES from '@/config/services';
import PORTFOLIO_PROJECTS from '@/config/projects';
import { categories as blogCategories } from '@/config/blog';
import { posts as blogPosts } from '@/config/posts';
import { teamMembers } from '@/config/team';
import { schemas as validationSchemas } from '@/schemas/validation';

const STORAGE_KEYS = {
    SITE: 'baris_content_site',
    SERVICES: 'baris_content_services',
    COMPANY: 'baris_content_company',
    PROJECTS: 'baris_content_projects',
    BLOG_CATEGORIES: 'baris_content_blog_categories',
    BLOG_POSTS: 'baris_content_blog_posts',
    TEAM: 'baris_content_team',
    SETTINGS: 'baris_content_settings'
};

// Adapter to map COMPANY_DATA to legacy siteConfig structure for UI compatibility
const getAdaptedSiteConfig = () => ({
    name: COMPANY_DATA?.legalName || "Bad & Energie GmbH",
    description: "Ihr Meisterbetrieb für Badsanierung, Heizung und Haustechnik in Wetzlar und Umgebung.",
    contact: {
        phone: COMPANY_DATA?.contact?.phone || "06441 20 39 053",
        phoneLink: (COMPANY_DATA?.contact?.phone || "064412039053").replace(/[^0-9+]/g, ''),
        email: COMPANY_DATA?.contact?.email || "anfrage@bad-energie-profi.de",
        address: {
            street: COMPANY_DATA?.address?.street || "Hans-Sachs-Straße 12",
            zipCity: `${COMPANY_DATA?.address?.postalCode || "35576"} ${COMPANY_DATA?.address?.city || "Wetzlar"}`
        },
        hours: {
            weekdays: COMPANY_DATA?.hours?.formattedWeekdays || "Mo - Do: 07:00 – 16:45 Uhr",
            saturday: "Notdienst für Bestandskunden"
        }
    },
    social: {
        instagram: COMPANY_DATA?.social?.instagram || "https://www.instagram.com/badundenergie"
    },
    serviceAreas: COMPANY_DATA?.business?.serviceArea || ["Wetzlar", "Gießen", "Lahn-Dill-Kreis"],
    legal: {
        owner: COMPANY_DATA?.owner?.fullName || "Sabri Demir",
        taxId: COMPANY_DATA?.tax?.ustId || "DE215 933 612",
        register: COMPANY_DATA?.authority?.name || "Handwerkskammer Wiesbaden"
    }
});

const DEFAULTS = {
    [STORAGE_KEYS.SITE]: getAdaptedSiteConfig(),
    [STORAGE_KEYS.SERVICES]: SERVICES,
    [STORAGE_KEYS.COMPANY]: COMPANY_DATA,
    [STORAGE_KEYS.PROJECTS]: { projects: PORTFOLIO_PROJECTS, categories: [] },
    [STORAGE_KEYS.BLOG_CATEGORIES]: blogCategories,
    [STORAGE_KEYS.BLOG_POSTS]: blogPosts,
    [STORAGE_KEYS.SETTINGS]: {
        notifications: {
            emailNotifications: true,
            contactFormAlerts: true,
            weeklyReports: false,
            securityAlerts: true
        },
        appearance: {
            theme: 'light',
            compactMode: false
        }
    },
    [STORAGE_KEYS.TEAM]: teamMembers
};

export const dataService = {
    get(key) {
        try {
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem(key);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (key === STORAGE_KEYS.SITE) {
                        const freshConfig = getAdaptedSiteConfig();
                        return {
                            ...parsed,
                            contact: {
                                ...freshConfig.contact,
                                ...parsed.contact
                            },
                            legal: freshConfig.legal
                        };
                    }
                    return parsed;
                }
            }
        } catch (e) {
            console.error(`Error reading ${key} from storage:`, e);
        }
        return DEFAULTS[key];
    },

    save(key, data) {
        try {
            if (validationSchemas[key]) {
                const result = validationSchemas[key].safeParse(data);
                if (!result.success) {
                    console.error(`Validation failed for ${key}:`, result.error);
                    return false;
                }
            }
            if (typeof window !== 'undefined') {
                localStorage.setItem(key, JSON.stringify(data));
                window.dispatchEvent(new Event('content-updated'));
            }
            return true;
        } catch (e) {
            console.error(`Error saving ${key} to storage:`, e);
            return false;
        }
    },

    getSiteConfig() { return this.get(STORAGE_KEYS.SITE); },
    getServices() { return this.get(STORAGE_KEYS.SERVICES); },
    getCompany() { return this.get(STORAGE_KEYS.COMPANY); },
    getProjects() { return this.get(STORAGE_KEYS.PROJECTS); },
    getBlogCategories() { return this.get(STORAGE_KEYS.BLOG_CATEGORIES); },
    getBlogPosts() { return this.get(STORAGE_KEYS.BLOG_POSTS); },
    getTeam() { return this.get(STORAGE_KEYS.TEAM); },
    getSettings() { return this.get(STORAGE_KEYS.SETTINGS); },

    reset(key) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
            window.dispatchEvent(new Event('content-updated'));
        }
    },

    clearAll() {
        if (typeof window !== 'undefined') {
            Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
            localStorage.removeItem('baris_auth_config'); // Also clear auth config
            // Don't clear session automatically, let frontend handle it related to reload
            window.dispatchEvent(new Event('content-updated'));
        }
    },

    exportAll() {
        return {
            site: this.getSiteConfig(),
            services: this.getServices(),
            company: this.getCompany(),
            projects: this.getProjects(),
            blog: this.getBlogCategories(),
            team: this.getTeam(),
            settings: this.getSettings(),
            exportedAt: new Date().toISOString()
        };
    }
};

export const KEYS = STORAGE_KEYS;
