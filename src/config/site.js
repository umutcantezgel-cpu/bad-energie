// Global site configuration - Bad & Energie GmbH
import { COMPANY_DATA } from './company';

export const siteConfig = {
    name: COMPANY_DATA.legalName,
    tradeName: COMPANY_DATA.tradeName,
    description: 'Bad & Energie GmbH ist Ihr Meisterbetrieb für Badsanierung, innovative Wärmepumpen, Heiztechnik, Klimatechnik und Haustechnik in Wetzlar, Gießen und dem Lahn-Dill-Kreis. Meisterqualität seit 2001, NIBE Effizienz Partner.',
    url: 'https://bad-energie.de',

    contact: {
        phone: COMPANY_DATA.contact.phone,
        phoneSecondary: COMPANY_DATA.contact.phoneSecondary,
        phoneLink: COMPANY_DATA.contact.phoneLink,
        phoneSecondaryLink: COMPANY_DATA.contact.phoneSecondaryLink,
        email: COMPANY_DATA.contact.email,
        emailSecondary: COMPANY_DATA.contact.emailSecondary,
        fax: COMPANY_DATA.contact.fax,
        headquarters: {
            street: COMPANY_DATA.headquarters.street,
            zipCity: `${COMPANY_DATA.headquarters.postalCode} ${COMPANY_DATA.headquarters.city}`,
            fullAddress: COMPANY_DATA.headquarters.fullAddress,
            mapsUrl: COMPANY_DATA.headquarters.mapsUrl
        },
        branch: {
            street: COMPANY_DATA.branchLahnDill.street,
            zipCity: `${COMPANY_DATA.branchLahnDill.postalCode} ${COMPANY_DATA.branchLahnDill.city}`,
            fullAddress: COMPANY_DATA.branchLahnDill.fullAddress
        },
        address: {
            street: COMPANY_DATA.address.street,
            zipCity: `${COMPANY_DATA.address.postalCode} ${COMPANY_DATA.address.city}`,
            country: COMPANY_DATA.address.country
        },
        hours: {
            weekdays: COMPANY_DATA.hours.formattedWeekdays,
            friday: COMPANY_DATA.hours.formattedFriday,
            emergency: COMPANY_DATA.contact.emergency.note
        }
    },

    social: {
        instagram: 'https://www.instagram.com/badundenergie'
    },

    serviceAreas: COMPANY_DATA.business.serviceArea,

    legal: {
        owner: COMPANY_DATA.owner.fullName,
        director: COMPANY_DATA.owner.fullName,
        taxId: COMPANY_DATA.tax.ustId,
        taxNumber: COMPANY_DATA.tax.taxNumber,
        registerNumber: COMPANY_DATA.tax.registerNumber,
        court: COMPANY_DATA.tax.court,
        authority: COMPANY_DATA.authority.name,
        dataProtectionAuthority: {
            name: 'Der Hessische Beauftragte für Datenschutz und Informationsfreiheit',
            street: 'Gustav-Stresemann-Ring 1',
            zipCity: '65189 Wiesbaden',
            website: 'https://datenschutz.hessen.de'
        }
    },

    legalName: COMPANY_DATA.legalName
};

export default siteConfig;
