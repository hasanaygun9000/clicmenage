import type { Bilingual, BilingualList } from './types';

/**
 * ============================================================================
 *  SERVICE AREA CONFIGURATION — ClicMénage
 * ============================================================================
 * Single source of truth for every municipality/sector ClicMénage serves.
 *
 * To add a new city later:
 *   1. Add an entry to `serviceAreas` below with a unique `slug`.
 *   2. Provide `fsaPrefixes` (Canada Post "Forward Sortation Area" — the
 *      first 3 characters of a postal code) so the booking form's postal
 *      code checker recognizes addresses there.
 *   3. Set `hasLandingPage: true` and fill in `landingContent` if you want
 *      a dedicated SEO page at /fr/menage-{slug} and /en/cleaning-{slug}.
 *      Leaving it false still includes the city in service-area checks and
 *      the "Areas served" grid, without generating a thin page.
 *
 * ⚠️ FSA prefixes below are a reasonable approximation of each
 * municipality's postal boundaries for a functioning demo. Canada Post is
 * the authoritative source — double-check/refine these lists before
 * launch, especially near borough boundaries.
 *
 * The South Shore / Roussillon entries added after `saint-hubert` (Candiac,
 * La Prairie, Saint-Constant, Sainte-Catherine, Delson, Châteauguay,
 * Mercier, Saint-Philippe) were cross-checked against public Canada Post
 * FSA data before being added. Where a municipality's FSA could not be
 * confidently confirmed (Saint-Philippe), it was left with an empty
 * `fsaPrefixes` array rather than guessed — see the comment on that entry.
 * ============================================================================
 */

export type ServiceAreaRegion = 'montreal' | 'laval' | 'south-shore' | 'west-island';

export interface ServiceArea {
  slug: string;
  name: Bilingual;
  region: ServiceAreaRegion;
  /** True for the "West Island" hub page that groups several suburb pages. */
  isHub?: boolean;
  /** For West Island suburbs, links back to the hub for breadcrumbs/related-area links. */
  parentSlug?: string;
  fsaPrefixes: string[];
  active: boolean;
  hasLandingPage: boolean;
  landingContent?: {
    heroNote: Bilingual;
    housingNote: Bilingual;
    neighborhoods: BilingualList;
  };
}

export const serviceAreas: ServiceArea[] = [
  {
    slug: 'montreal',
    name: { fr: 'Montréal', en: 'Montreal' },
    region: 'montreal',
    fsaPrefixes: ['H1', 'H2', 'H3', 'H4'],
    active: true,
    hasLandingPage: true,
    landingContent: {
      heroNote: {
        fr: "Du Plateau à Verdun, un ménage professionnel adapté aux condos, plex et maisons de ville montréalais.",
        en: 'From the Plateau to Verdun, professional cleaning suited to Montreal condos, plexes and townhouses.',
      },
      housingNote: {
        fr: "Montréal se distingue par une grande variété de logements : condos en hauteur, plex avec escaliers extérieurs, lofts et maisons de ville. Notre approche s'ajuste à chaque type d'habitation, y compris les accès par escalier et les espaces plus compacts du centre-ville.",
        en: "Montreal has a wide mix of housing: high-rise condos, walk-up plexes with exterior staircases, lofts, and townhouses. Our approach adapts to each type of home, including staircase access and the more compact spaces found downtown.",
      },
      neighborhoods: {
        fr: ['Le Plateau-Mont-Royal', 'Rosemont–La Petite-Patrie', 'Verdun', 'Ville-Marie (centre-ville)', 'Notre-Dame-de-Grâce', 'Villeray'],
        en: ['Le Plateau-Mont-Royal', 'Rosemont–La Petite-Patrie', 'Verdun', 'Ville-Marie (Downtown)', 'Notre-Dame-de-Grâce', 'Villeray'],
      },
    },
  },
  {
    slug: 'laval',
    name: { fr: 'Laval', en: 'Laval' },
    region: 'laval',
    fsaPrefixes: ['H7'],
    active: true,
    hasLandingPage: true,
    landingContent: {
      heroNote: {
        fr: 'Un service de ménage fiable pour les maisons familiales et les condos de Laval.',
        en: 'Reliable cleaning for Laval’s family homes and condos.',
      },
      housingNote: {
        fr: "Laval compte surtout des maisons unifamiliales, des jumelés et de plus en plus de condos près des stations de métro. Nos ménages sont pensés pour les grandes surfaces, les sous-sols aménagés et les familles au rythme chargé.",
        en: "Laval is home to mostly single-family houses, semi-detached homes, and a growing number of condos near metro stations. Our cleanings are built for larger floor plans, finished basements, and busy family schedules.",
      },
      neighborhoods: {
        fr: ['Chomedey', 'Sainte-Rose', 'Duvernay', 'Fabreville', 'Vimont', 'Laval-des-Rapides'],
        en: ['Chomedey', 'Sainte-Rose', 'Duvernay', 'Fabreville', 'Vimont', 'Laval-des-Rapides'],
      },
    },
  },
  {
    slug: 'longueuil',
    name: { fr: 'Longueuil', en: 'Longueuil' },
    region: 'south-shore',
    fsaPrefixes: ['J4G', 'J4H', 'J4J', 'J4K', 'J4L', 'J4M', 'J4N'],
    active: true,
    hasLandingPage: true,
    landingContent: {
      heroNote: {
        fr: 'Ménage résidentiel pour le Vieux-Longueuil, Saint-Hubert et les secteurs environnants.',
        en: 'Residential cleaning for Vieux-Longueuil, Saint-Hubert, and surrounding sectors.',
      },
      housingNote: {
        fr: "Longueuil mélange quartiers historiques, tours à condos près du métro et secteurs résidentiels calmes. Que vous soyez en appartement au centre-ville ou en maison dans un quartier plus tranquille, on adapte notre visite à votre espace.",
        en: "Longueuil blends historic neighbourhoods, condo towers near the metro, and quiet residential sectors. Whether you're in a downtown apartment or a house in a quieter area, we tailor the visit to your space.",
      },
      neighborhoods: {
        fr: ['Vieux-Longueuil', 'Saint-Hubert', 'Greenfield Park', 'Le Vieux-Port', 'Fatima'],
        en: ['Vieux-Longueuil', 'Saint-Hubert', 'Greenfield Park', 'Le Vieux-Port', 'Fatima'],
      },
    },
  },
  {
    slug: 'brossard',
    name: { fr: 'Brossard', en: 'Brossard' },
    region: 'south-shore',
    fsaPrefixes: ['J4W', 'J4X', 'J4Y', 'J4Z'],
    active: true,
    hasLandingPage: true,
    landingContent: {
      heroNote: {
        fr: 'Un ménage impeccable pour les condos modernes et maisons familiales de Brossard.',
        en: 'Spotless cleaning for Brossard’s modern condos and family homes.',
      },
      housingNote: {
        fr: "Brossard connaît une croissance rapide avec de nombreux nouveaux condos et maisons de ville, en plus de ses quartiers résidentiels établis. Nous connaissons bien les particularités des constructions récentes comme des maisons plus anciennes.",
        en: "Brossard has grown quickly, with many new condos and townhouses alongside established residential neighbourhoods. We're comfortable with the specifics of newer builds as well as older homes.",
      },
      neighborhoods: {
        fr: ['Le Quartier DIX30', 'Rive-Sud Centre', 'Secteur Chevrier', 'Saint-François'],
        en: ['Quartier DIX30', 'Rive-Sud Centre', 'Chevrier sector', 'Saint-François'],
      },
    },
  },
  {
    slug: 'saint-lambert',
    name: { fr: 'Saint-Lambert', en: 'Saint-Lambert' },
    region: 'south-shore',
    fsaPrefixes: ['J4R', 'J4S'],
    active: true,
    hasLandingPage: true,
    landingContent: {
      heroNote: {
        fr: 'Ménage soigné pour les maisons de caractère de Saint-Lambert.',
        en: 'Careful cleaning for Saint-Lambert’s character homes.',
      },
      housingNote: {
        fr: "Saint-Lambert se distingue par ses maisons de caractère, souvent plus anciennes, près du fleuve. Notre équipe porte une attention particulière aux finitions et boiseries qu'on retrouve dans ce type de résidence.",
        en: 'Saint-Lambert is known for its character homes, often older builds close to the river. Our team pays close attention to the finishes and woodwork typical of this kind of home.',
      },
      neighborhoods: {
        fr: ['Vieux Saint-Lambert', 'Préville', 'Secteur de la gare'],
        en: ['Old Saint-Lambert', 'Préville', 'Train station sector'],
      },
    },
  },
  {
    slug: 'boucherville',
    name: { fr: 'Boucherville', en: 'Boucherville' },
    region: 'south-shore',
    fsaPrefixes: ['J4B'],
    active: true,
    hasLandingPage: true,
    landingContent: {
      heroNote: {
        fr: 'Un service de ménage fiable pour les familles de Boucherville.',
        en: 'Dependable cleaning for Boucherville families.',
      },
      housingNote: {
        fr: "Boucherville est reconnue pour ses maisons familiales spacieuses et ses quartiers verdoyants. Nos ménages réguliers aident les familles occupées à garder une maison propre sans y consacrer leurs week-ends.",
        en: 'Boucherville is known for spacious family homes and leafy neighbourhoods. Our recurring cleanings help busy families keep a tidy home without giving up their weekends.',
      },
      neighborhoods: {
        fr: ['Vieux-Boucherville', 'Le Boisé', 'Normandie', 'Mortagne'],
        en: ['Vieux-Boucherville', 'Le Boisé', 'Normandie', 'Mortagne'],
      },
    },
  },
  {
    slug: 'saint-bruno',
    name: { fr: 'Saint-Bruno-de-Montarville', en: 'Saint-Bruno' },
    region: 'south-shore',
    fsaPrefixes: ['J3V'],
    active: true,
    hasLandingPage: true,
    landingContent: {
      heroNote: {
        fr: 'Ménage résidentiel au pied du Mont-Saint-Bruno.',
        en: 'Residential cleaning at the foot of Mont-Saint-Bruno.',
      },
      housingNote: {
        fr: "Entre le parc national du Mont-Saint-Bruno et ses quartiers résidentiels paisibles, Saint-Bruno compte surtout des maisons unifamiliales avec grandes cours. On s'adapte à cet espace, garage et sous-sol compris au besoin.",
        en: 'Between Mont-Saint-Bruno National Park and its quiet residential streets, Saint-Bruno is mostly single-family homes with large yards. We adapt to that footprint, including garages and basements when needed.',
      },
      neighborhoods: {
        fr: ['Centre-ville de Saint-Bruno', 'Secteur du Boisé', 'Domaine Bruno'],
        en: ['Saint-Bruno town centre', 'Boisé sector', 'Domaine Bruno'],
      },
    },
  },
  {
    slug: 'saint-hubert',
    name: { fr: 'Saint-Hubert', en: 'Saint-Hubert' },
    region: 'south-shore',
    fsaPrefixes: ['J3Y', 'J4T'],
    active: true,
    hasLandingPage: true,
    landingContent: {
      heroNote: {
        fr: 'Ménage fiable pour les résidents de Saint-Hubert.',
        en: 'Reliable cleaning for Saint-Hubert residents.',
      },
      housingNote: {
        fr: "Arrondissement de Longueuil au passé aéronautique, Saint-Hubert regroupe des bungalows, des maisons de ville et plusieurs nouveaux développements. Nos ménages s'ajustent aussi bien aux constructions récentes qu'aux résidences plus anciennes.",
        en: 'A borough of Longueuil with aviation roots, Saint-Hubert has a mix of bungalows, townhouses, and several newer developments. Our cleanings adapt to both newer builds and older homes.',
      },
      neighborhoods: {
        fr: ['Cégep Édouard-Montpetit', 'Secteur de l’aéroport', 'Havre-des-Brises'],
        en: ['Cégep Édouard-Montpetit area', 'Airport sector', 'Havre-des-Brises'],
      },
    },
  },
  {
    slug: 'candiac',
    name: { fr: 'Candiac', en: 'Candiac' },
    region: 'south-shore',
    // FSA confirmed: J5R (verified against Canada Post FSA data). Candiac and
    // La Prairie share the J5R forward sortation area — see the note on the
    // `la-prairie` entry below.
    fsaPrefixes: ['J5R'],
    active: true,
    hasLandingPage: true,
    landingContent: {
      heroNote: {
        fr: 'Ménage résidentiel pour les maisons et condos de Candiac.',
        en: 'Residential cleaning for Candiac’s houses and condos.',
      },
      housingNote: {
        fr: "Candiac est une ville planifiée reconnue pour ses rues bordées d'arbres et ses maisons familiales, avec un mélange de secteurs plus anciens et de développements récents près de la gare. Nos ménages s'adaptent aussi bien aux grandes maisons qu'aux copropriétés.",
        en: "Candiac is a planned suburb known for its tree-lined streets and family homes, with a mix of older sectors and newer developments near the train station. Our cleanings adapt to larger homes as well as condos.",
      },
      neighborhoods: {
        fr: ['Secteur du Golf', 'Centre-ville de Candiac', 'Secteur de la gare'],
        en: ['Golf sector', 'Candiac town centre', 'Train station sector'],
      },
    },
  },
  {
    slug: 'la-prairie',
    name: { fr: 'La Prairie', en: 'La Prairie' },
    region: 'south-shore',
    // FSA confirmed: J5R (verified against Canada Post FSA data). Note that
    // La Prairie and Candiac share this same FSA — Canada Post does not
    // separate them at the 3-character level. Because `matchServiceAreaByPostalCode`
    // returns the first matching active area, a J5R postal code will resolve
    // to whichever of the two entries appears first in this array (currently
    // Candiac). This does not affect service-area eligibility (both are
    // served), only which city name is shown back to the customer — a
    // reasonable trade-off given the shared FSA, but worth knowing about.
    fsaPrefixes: ['J5R'],
    active: true,
    hasLandingPage: true,
    landingContent: {
      heroNote: {
        fr: 'Ménage résidentiel à La Prairie, du Vieux-La Prairie aux nouveaux quartiers.',
        en: 'Residential cleaning in La Prairie, from Vieux-La Prairie to the newer neighbourhoods.',
      },
      housingNote: {
        fr: "La Prairie combine un secteur historique au bord du fleuve et des quartiers résidentiels en pleine croissance. On s'adapte aussi bien aux maisons de caractère du Vieux-La Prairie qu'aux constructions plus récentes.",
        en: 'La Prairie combines a historic riverside sector with fast-growing residential neighbourhoods. We adapt to the character homes of Vieux-La Prairie as well as newer builds.',
      },
      neighborhoods: {
        fr: ['Vieux-La Prairie', 'Secteur riverain', 'Nouveaux développements'],
        en: ['Vieux-La Prairie (Old La Prairie)', 'Riverside sector', 'Newer developments'],
      },
    },
  },
  {
    slug: 'saint-constant',
    name: { fr: 'Saint-Constant', en: 'Saint-Constant' },
    region: 'south-shore',
    // FSA confirmed: J5A (verified against Canada Post FSA data).
    fsaPrefixes: ['J5A'],
    active: true,
    hasLandingPage: true,
    landingContent: {
      heroNote: {
        fr: 'Un service de ménage fiable pour les familles de Saint-Constant.',
        en: 'Reliable cleaning for Saint-Constant families.',
      },
      housingNote: {
        fr: "Saint-Constant est une ville familiale en croissance, avec des bungalows, des maisons de ville et de nouveaux quartiers résidentiels. Nos ménages réguliers conviennent bien aux horaires chargés des familles.",
        en: 'Saint-Constant is a growing family town with bungalows, townhouses, and newer residential neighbourhoods. Our recurring cleanings suit busy family schedules well.',
      },
      neighborhoods: {
        fr: ['Centre-ville de Saint-Constant', 'Secteur du Boisé', 'Nouveaux quartiers'],
        en: ['Saint-Constant town centre', 'Boisé sector', 'Newer neighbourhoods'],
      },
    },
  },
  {
    slug: 'sainte-catherine',
    name: { fr: 'Sainte-Catherine', en: 'Sainte-Catherine' },
    region: 'south-shore',
    // FSA confirmed: J5C (verified against Canada Post FSA data).
    fsaPrefixes: ['J5C'],
    active: true,
    hasLandingPage: true,
    landingContent: {
      heroNote: {
        fr: 'Ménage résidentiel pour les maisons riveraines et familiales de Sainte-Catherine.',
        en: 'Residential cleaning for Sainte-Catherine’s riverside and family homes.',
      },
      housingNote: {
        fr: "Sainte-Catherine borde le fleuve Saint-Laurent et regroupe surtout des maisons unifamiliales dans des quartiers résidentiels calmes. Nos ménages s'ajustent à la taille et à la disposition de chaque propriété.",
        en: 'Sainte-Catherine sits along the St. Lawrence River and is mostly single-family homes in quiet residential neighbourhoods. Our cleanings adjust to each property’s size and layout.',
      },
      neighborhoods: {
        fr: ['Centre-ville de Sainte-Catherine', 'Secteur riverain'],
        en: ['Sainte-Catherine town centre', 'Riverside sector'],
      },
    },
  },
  {
    slug: 'delson',
    name: { fr: 'Delson', en: 'Delson' },
    region: 'south-shore',
    // FSA confirmed: J5B (verified against Canada Post FSA data).
    fsaPrefixes: ['J5B'],
    active: true,
    hasLandingPage: true,
    landingContent: {
      heroNote: {
        fr: 'Ménage résidentiel pour les résidents de Delson.',
        en: 'Residential cleaning for Delson residents.',
      },
      housingNote: {
        fr: "Delson est une petite ville résidentielle et familiale du Roussillon, avec surtout des bungalows et des maisons unifamiliales. On adapte facilement nos ménages à ce type de propriété.",
        en: 'Delson is a small, family-oriented town in the Roussillon area, mostly bungalows and single-family homes. We adapt easily to this kind of property.',
      },
      neighborhoods: {
        fr: ['Centre-ville de Delson', 'Secteur de la gare'],
        en: ['Delson town centre', 'Train station sector'],
      },
    },
  },
  {
    slug: 'chateauguay',
    name: { fr: 'Châteauguay', en: 'Châteauguay' },
    region: 'south-shore',
    // FSA confirmed: J6J (Châteauguay North) and J6K (Châteauguay South),
    // verified against Canada Post FSA data.
    fsaPrefixes: ['J6J', 'J6K'],
    active: true,
    hasLandingPage: true,
    landingContent: {
      heroNote: {
        fr: 'Ménage résidentiel pour les secteurs nord et sud de Châteauguay.',
        en: 'Residential cleaning for both the north and south sectors of Châteauguay.',
      },
      housingNote: {
        fr: "Châteauguay est l'une des plus grandes villes de la Rive-Sud, avec des quartiers résidentiels établis de part et d'autre de la rivière Châteauguay. Nos ménages s'adaptent aux maisons unifamiliales comme aux copropriétés.",
        en: 'Châteauguay is one of the larger South Shore towns, with established residential neighbourhoods on both sides of the Châteauguay River. Our cleanings adapt to single-family homes as well as condos.',
      },
      neighborhoods: {
        fr: ['Secteur nord', 'Secteur sud', 'Centre-ville'],
        en: ['North sector', 'South sector', 'Town centre'],
      },
    },
  },
  {
    slug: 'mercier',
    name: { fr: 'Mercier', en: 'Mercier' },
    region: 'south-shore',
    // FSA confirmed: J6R (verified against Canada Post FSA data).
    fsaPrefixes: ['J6R'],
    active: true,
    hasLandingPage: true,
    landingContent: {
      heroNote: {
        fr: 'Ménage résidentiel fiable pour les familles de Mercier.',
        en: 'Dependable residential cleaning for Mercier families.',
      },
      housingNote: {
        fr: "Mercier est une ville résidentielle tranquille du Roussillon, avec principalement des maisons unifamiliales. On propose des visites ponctuelles ou récurrentes selon le rythme de chaque famille.",
        en: 'Mercier is a quiet residential town in the Roussillon area, mostly single-family homes. We offer one-time or recurring visits depending on each family’s rhythm.',
      },
      neighborhoods: {
        fr: ['Centre-ville de Mercier', 'Secteur résidentiel'],
        en: ['Mercier town centre', 'Residential sector'],
      },
    },
  },
  {
    slug: 'saint-philippe',
    name: { fr: 'Saint-Philippe', en: 'Saint-Philippe' },
    region: 'south-shore',
    // ⚠️ NOT YET MAPPED — do not guess. Saint-Philippe's postal codes fall
    // under FSA J0L, a large rural forward sortation area shared with many
    // unrelated municipalities well outside ClicMénage's service area. Adding
    // "J0L" here would incorrectly accept addresses from towns we don't
    // serve, so it is intentionally left empty until a precise mapping (e.g.
    // specific 6-character postal codes, or a confirmed narrower boundary)
    // is available. Saint-Philippe still appears in "areas served" content
    // and can get a landing page, but a Saint-Philippe postal code will not
    // currently pass the booking form's automated check — this needs owner
    // input before launch (see LAUNCH_CHECKLIST.md).
    fsaPrefixes: [],
    active: true,
    hasLandingPage: true,
    landingContent: {
      heroNote: {
        fr: 'Ménage résidentiel pour les maisons de Saint-Philippe.',
        en: 'Residential cleaning for Saint-Philippe homes.',
      },
      housingNote: {
        fr: "Saint-Philippe est une municipalité résidentielle du Roussillon, avec surtout de grandes maisons unifamiliales sur des terrains spacieux. Nos ménages s'ajustent à ce type de propriété.",
        en: 'Saint-Philippe is a residential municipality in the Roussillon area, mostly larger single-family homes on spacious lots. Our cleanings adjust to this kind of property.',
      },
      neighborhoods: {
        fr: ['Secteur résidentiel'],
        en: ['Residential sector'],
      },
    },
  },
  {
    slug: 'west-island',
    name: { fr: "L'Ouest-de-l'Île", en: 'West Island' },
    region: 'west-island',
    isHub: true,
    fsaPrefixes: ['H8Y', 'H8Z', 'H9A', 'H9B', 'H9C', 'H9G', 'H9H', 'H9J', 'H9K', 'H9P', 'H9R', 'H9S', 'H9W', 'H9X'],
    active: true,
    hasLandingPage: true,
    landingContent: {
      heroNote: {
        fr: "Un service de ménage local pour Dorval, Pointe-Claire, Kirkland, DDO, Beaconsfield et Pierrefonds.",
        en: 'A local cleaning service for Dorval, Pointe-Claire, Kirkland, DDO, Beaconsfield and Pierrefonds.',
      },
      housingNote: {
        fr: "L'Ouest-de-l'Île regroupe plusieurs municipalités résidentielles bordant le lac Saint-Louis et la rivière des Prairies, avec de grandes maisons familiales, des bungalows et des quartiers calmes et verdoyants.",
        en: "The West Island includes several residential municipalities along Lac Saint-Louis and the Rivière des Prairies, with large family homes, bungalows, and quiet, leafy streets.",
      },
      neighborhoods: {
        fr: ['Dorval', 'Pointe-Claire', 'Kirkland', 'Dollard-des-Ormeaux', 'Beaconsfield', 'Pierrefonds'],
        en: ['Dorval', 'Pointe-Claire', 'Kirkland', 'Dollard-des-Ormeaux', 'Beaconsfield', 'Pierrefonds'],
      },
    },
  },
  {
    slug: 'dorval',
    name: { fr: 'Dorval', en: 'Dorval' },
    region: 'west-island',
    parentSlug: 'west-island',
    fsaPrefixes: ['H9P', 'H9S'],
    active: true,
    hasLandingPage: true,
    landingContent: {
      heroNote: {
        fr: 'Ménage résidentiel près de l’aéroport et du bord de l’eau à Dorval.',
        en: 'Residential cleaning near the airport and waterfront in Dorval.',
      },
      housingNote: {
        fr: "Dorval combine secteurs résidentiels calmes, condos et proximité de l'aéroport Trudeau. On comprend les horaires chargés des voyageurs fréquents et on s'y adapte facilement.",
        en: 'Dorval combines quiet residential sectors, condos, and proximity to Trudeau Airport. We understand the busy schedules of frequent travellers and adapt easily.',
      },
      neighborhoods: {
        fr: ['Dorval-Gardens', 'Secteur du bord de l’eau', 'Les Jardins Dorval'],
        en: ['Dorval Gardens', 'Waterfront sector', 'Les Jardins Dorval'],
      },
    },
  },
  {
    slug: 'pointe-claire',
    name: { fr: 'Pointe-Claire', en: 'Pointe-Claire' },
    region: 'west-island',
    parentSlug: 'west-island',
    fsaPrefixes: ['H9R', 'H9S'],
    active: true,
    hasLandingPage: true,
    landingContent: {
      heroNote: {
        fr: 'Ménage pour les maisons familiales et condos de Pointe-Claire.',
        en: 'Cleaning for Pointe-Claire’s family homes and condos.',
      },
      housingNote: {
        fr: "Pointe-Claire propose un bon mélange de maisons établies près du lac Saint-Louis et de développements plus récents près du Village. Nos ménages s'ajustent à chaque type de propriété.",
        en: "Pointe-Claire offers a good mix of established homes near Lac Saint-Louis and newer developments near the Village. Our cleanings adjust to each property type.",
      },
      neighborhoods: {
        fr: ['Village de Pointe-Claire', 'Cedar Park', 'Valois'],
        en: ['Pointe-Claire Village', 'Cedar Park', 'Valois'],
      },
    },
  },
  {
    slug: 'kirkland',
    name: { fr: 'Kirkland', en: 'Kirkland' },
    region: 'west-island',
    parentSlug: 'west-island',
    fsaPrefixes: ['H9H', 'H9J'],
    active: true,
    hasLandingPage: true,
    landingContent: {
      heroNote: {
        fr: 'Ménage résidentiel pour les familles de Kirkland.',
        en: 'Residential cleaning for Kirkland families.',
      },
      housingNote: {
        fr: "Kirkland est un secteur résidentiel tranquille avec de grandes maisons unifamiliales et de nombreuses familles. On propose des visites récurrentes qui s'intègrent bien à un horaire familial chargé.",
        en: 'Kirkland is a quiet residential area with large single-family homes and many families. We offer recurring visits that fit well into a busy family schedule.',
      },
      neighborhoods: {
        fr: ['Secteur des parcs', 'Kirkland Centre'],
        en: ['Parks sector', 'Kirkland Centre'],
      },
    },
  },
  {
    slug: 'dollard-des-ormeaux',
    name: { fr: 'Dollard-des-Ormeaux', en: 'Dollard-des-Ormeaux' },
    region: 'west-island',
    parentSlug: 'west-island',
    fsaPrefixes: ['H9A', 'H9B', 'H9G'],
    active: true,
    hasLandingPage: true,
    landingContent: {
      heroNote: {
        fr: 'Ménage résidentiel pour les grandes maisons de DDO.',
        en: 'Residential cleaning for DDO’s larger homes.',
      },
      housingNote: {
        fr: "Dollard-des-Ormeaux (DDO) est l'une des municipalités les plus peuplées de l'Ouest-de-l'Île, avec de grandes maisons familiales et une communauté très diversifiée. Nos ménages en profondeur sont particulièrement populaires ici.",
        en: 'Dollard-des-Ormeaux (DDO) is one of the most populous West Island municipalities, with large family homes and a very diverse community. Our deep cleanings are especially popular here.',
      },
      neighborhoods: {
        fr: ['Secteur du parc Sunnybrooke', 'Secteur du Centre civique'],
        en: ['Sunnybrooke Park sector', 'Civic Centre sector'],
      },
    },
  },
  {
    slug: 'beaconsfield',
    name: { fr: 'Beaconsfield', en: 'Beaconsfield' },
    region: 'west-island',
    parentSlug: 'west-island',
    fsaPrefixes: ['H9W'],
    active: true,
    hasLandingPage: true,
    landingContent: {
      heroNote: {
        fr: 'Ménage soigné pour les résidences établies de Beaconsfield.',
        en: 'Careful cleaning for Beaconsfield’s established homes.',
      },
      housingNote: {
        fr: "Beaconsfield est un secteur résidentiel bien établi, réputé pour ses grandes propriétés arborées près du lac Saint-Louis. On y offre un service discret et minutieux.",
        en: 'Beaconsfield is a well-established residential area known for its large, tree-lined properties near Lac Saint-Louis. We offer a discreet, thorough service there.',
      },
      neighborhoods: {
        fr: ['Beaconsfield Village', 'Beacon Hill', 'Beaurepaire'],
        en: ['Beaconsfield Village', 'Beacon Hill', 'Beaurepaire'],
      },
    },
  },
  {
    slug: 'pierrefonds',
    name: { fr: 'Pierrefonds-Roxboro', en: 'Pierrefonds' },
    region: 'west-island',
    parentSlug: 'west-island',
    fsaPrefixes: ['H8Y', 'H8Z', 'H9H', 'H9J', 'H9K'],
    active: true,
    hasLandingPage: true,
    landingContent: {
      heroNote: {
        fr: 'Ménage résidentiel près de la rivière des Prairies à Pierrefonds.',
        en: 'Residential cleaning near the Rivière des Prairies in Pierrefonds.',
      },
      housingNote: {
        fr: "Pierrefonds-Roxboro compte de nombreuses familles et des maisons de tailles variées, du bungalow à la grande propriété en bord de rivière. On adapte la durée du ménage à la taille réelle de chaque domicile.",
        en: 'Pierrefonds-Roxboro is home to many families and homes of varying sizes, from bungalows to larger riverside properties. We adjust the length of the visit to each home’s actual size.',
      },
      neighborhoods: {
        fr: ['Secteur riverain', 'Pierrefonds Centre', 'Roxboro'],
        en: ['Riverside sector', 'Pierrefonds Centre', 'Roxboro'],
      },
    },
  },
];

export function getActiveServiceAreas(): ServiceArea[] {
  return serviceAreas.filter((a) => a.active);
}

export function getServiceAreaBySlug(slug: string): ServiceArea | undefined {
  return serviceAreas.find((a) => a.slug === slug);
}

export function getLandingPageAreas(): ServiceArea[] {
  return serviceAreas.filter((a) => a.active && a.hasLandingPage);
}

/**
 * Normalizes and checks a Canadian postal code against the active service
 * area FSA prefixes. Returns the matched area, or null if out of area /
 * invalid.
 */
export function matchServiceAreaByPostalCode(rawPostalCode: string): ServiceArea | null {
  const normalized = rawPostalCode.replace(/\s+/g, '').toUpperCase();
  const canadianPostalCodeRegex = /^[A-CEGHJ-NPRSTVXY]\d[A-CEGHJ-NPRSTV-Z]\d[A-CEGHJ-NPRSTV-Z]\d$/;

  if (!canadianPostalCodeRegex.test(normalized)) {
    return null;
  }

  const fsa3 = normalized.slice(0, 3);
  const fsa2 = normalized.slice(0, 2);

  for (const area of getActiveServiceAreas()) {
    if (area.fsaPrefixes.some((prefix) => prefix === fsa3 || prefix === fsa2)) {
      return area;
    }
  }

  return null;
}

export function isValidCanadianPostalCode(rawPostalCode: string): boolean {
  const normalized = rawPostalCode.replace(/\s+/g, '').toUpperCase();
  return /^[A-CEGHJ-NPRSTVXY]\d[A-CEGHJ-NPRSTV-Z]\d[A-CEGHJ-NPRSTV-Z]\d$/.test(normalized);
}
