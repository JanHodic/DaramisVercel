// src/collections/Projects.ts
import type { CollectionConfig } from 'payload'
import { isEditorOrAbove } from '../../access/index'
import { text } from 'payload/shared'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: { en: 'Project', cs: 'Projekt' },
    plural: { en: 'Projects', cs: 'Projekty' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'city', 'updatedAt'],
    description: {
      en: 'Manage real estate development projects',
      cs: 'Správa developerských projektů',
    },
  },
  access: {
    read: () => true,
    create: isEditorOrAbove,
    update: isEditorOrAbove,
    delete: isEditorOrAbove,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ==================== TAB 1: BASIC INFO ====================
        {
          label: { en: 'Basic Info', cs: 'Základní info' },
          description: {
            en: 'Core project information and identification',
            cs: 'Základní informace a identifikace projektu',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'title',
                  label: { en: 'Project Title', cs: 'Název projektu' },
                  type: 'text',
                  localized: true,
                  required: true,
                  admin: {
                    description: {
                      en: 'Main project name displayed to users',
                      cs: 'Hlavní název projektu zobrazovaný uživatelům',
                    },
                  },
                },
                {
                  type: 'text',
                  name: 'slug',
                  unique: true,
                  required: true,
                  label: { en: 'URL project Slug', cs: 'URL slug projektu' },
                  admin: {
                    description: {
                      en: '',
                      cs: '',
                    },
                  },
                  validate: async (val: any, options: any) => {
                    if (val && !/^[a-z0-9-]+$/.test(val)) {
                      return 'Slug může obsahovat pouze malá písmena (a-z), čísla (0-9) a pomlčky (-). Bez mezer a diakritiky.'
                    }
                    if (val && (val.startsWith('-') || val.endsWith('-'))) {
                      return 'Slug nesmí začínat ani končit pomlčkou.'
                    }
                    return text(val, options)
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'subtitle',
                  label: { en: 'Subtitle', cs: 'Podtitulek' },
                  type: 'text',
                  localized: true,
                  admin: {
                    description: {
                      en: 'Optional tagline or secondary title',
                      cs: 'Volitelný slogan nebo sekundární název',
                    },
                  },
                },
                {
                  name: 'city',
                  label: { en: 'City', cs: 'Město' },
                  type: 'text',
                  localized: true,
                  admin: {
                    description: {
                      en: 'City where the project is located',
                      cs: 'Město, kde se projekt nachází',
                    },
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'status',
                  label: { en: 'Project Status', cs: 'Stav projektu' },
                  type: 'select',
                  required: true,
                  defaultValue: 'current',
                  admin: {
                    description: {
                      en: 'Current phase of the project',
                      cs: 'Aktuální fáze projektu',
                    },
                  },
                  options: [
                    { label: { en: 'Planned', cs: 'Plánovaný' }, value: 'planned' },
                    { label: { en: 'Current', cs: 'Aktuální' }, value: 'current' },
                    { label: { en: 'Finished', cs: 'Dokončený' }, value: 'finished' },
                  ],
                },
                {
                  name: 'logo',
                  label: { en: 'Project Logo', cs: 'Logo projektu' },
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: {
                      en: 'Optional project logo (stored in Media).',
                      cs: 'Volitelné logo projektu (uloženo v Media).',
                    },
                  },
                },
              ],
            },

            // --- Sections select (hasMany) ---
            {
              name: 'sections',
              label: { en: 'Enabled Sections', cs: 'Povolené sekce' },
              type: 'select',
              hasMany: true,
              admin: {
                description: {
                  en: 'Select which content sections to display for this project. Tabs will appear only for selected sections.',
                  cs: 'Vyberte, které sekce se mají zobrazit pro tento projekt. Záložky se zobrazí pouze pro vybrané sekce.',
                },
              },
              options: [
                { label: { en: 'Location & Surroundings', cs: 'Lokalita a okolí' }, value: 'location' },
                { label: { en: 'Gallery / Views', cs: 'Galerie / Pohledy' }, value: 'gallery' },
                { label: { en: 'Standards / PDFs', cs: 'Standardy / PDF' }, value: 'standards' },
                { label: { en: 'Timeline', cs: 'Časová osa' }, value: 'timeline' },
                { label: { en: 'Realpad', cs: 'Realpad' }, value: 'units' },
                { label: { en: '3D Model', cs: '3D model' }, value: 'model3d' },
                { label: { en: 'Amenities & Features', cs: 'Služby a vybavení' }, value: 'amenities' },
              ],
            },

            // --- Hero media type selector (image / uploaded video / YouTube) ---
            {
              name: 'heroType',
              label: { en: 'Hero Type', cs: 'Typ úvodního média' },
              type: 'select',
              required: true,
              defaultValue: 'image',
              options: [
                { label: { en: 'Image', cs: 'Obrázek' }, value: 'image' },
                { label: { en: 'Uploaded Video', cs: 'Video (nahrané)' }, value: 'video' },
                { label: { en: 'YouTube', cs: 'YouTube' }, value: 'youtube' },
              ],
              admin: {
                description: {
                  en: 'Choose whether the project hero is an image, an uploaded video, or a YouTube video.',
                  cs: 'Zvolte, zda úvodní médium bude obrázek, nahrané video nebo YouTube video.',
                },
              },
            },
            {
              name: 'cover',
              label: { en: 'Cover Image', cs: 'Úvodní obrázek' },
              type: 'upload',
              relationTo: 'media',
              admin: {
                condition: (data) => (data as any)?.heroType === 'image',
                description: {
                  en: 'Main project image for listings and headers',
                  cs: 'Hlavní obrázek projektu pro výpisy a záhlaví',
                },
              },
            },
            {
              name: 'heroVideo',
              label: { en: 'Hero Video File', cs: 'Úvodní video (soubor)' },
              type: 'upload',
              relationTo: 'media',
              admin: {
                condition: (data) => (data as any)?.heroType === 'video',
                description: {
                  en: 'Upload a video file to use as the hero media.',
                  cs: 'Nahrajte video soubor pro úvodní sekci.',
                },
              },
            },
            {
              name: 'heroYouTubeUrl',
              label: { en: 'YouTube URL', cs: 'YouTube URL' },
              type: 'text',
              admin: {
                condition: (data) => (data as any)?.heroType === 'youtube',
                description: {
                  en: 'Paste a full YouTube URL (watch or youtu.be).',
                  cs: 'Vložte celou YouTube URL (watch nebo youtu.be).',
                },
              },
              validate: (val: any) => {
                if (!val) return true
                const s = String(val).trim()
                if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(s)) {
                  return 'Zadejte platnou YouTube URL.'
                }
                return true
              },
            },

            {
              type: 'row',
              fields: [
                { name: 'centerLat', label: { en: 'Center Latitude', cs: 'Střed mapy (lat)' }, type: 'number', required: true },
                { name: 'centerLng', label: { en: 'Center Longitude', cs: 'Střed mapy (lng)' }, type: 'number', required: true },
                { name: 'defaultZoom', label: { en: 'Default Zoom', cs: 'Výchozí zoom' }, type: 'number', defaultValue: 13 },
              ],
              admin: {
                condition: (data) => !data?.id || data?.sections?.includes('location'),
              },
            },
            {
              type: 'ui',
              name: 'projectMap',
              admin: {
                condition: () => true,
                components: {
                  Field: 'src/components/admin/ProjectMapField#ProjectMapField',
                },
              },
            },
            
            // ✅ changed: POI are now owned objects on Project (no relationship)
            {
              name: 'pointsOfInterests',
              label: { en: 'Points of Interest', cs: 'Body zájmu (POI)' },
              type: 'array',
              admin: {
                condition: (data) => data?.sections?.includes('location'),
                description: {
                  en: 'POIs are stored directly on the Project (owned objects).',
                  cs: 'POI se ukládají přímo na Projekt (vlastněné objekty).',
                },
              },
              fields: [
                { name: 'name', label: { en: 'Name', cs: 'Název' }, type: 'text', localized: true, required: true },
                {
                  name: 'category',
                  label: { en: 'Category', cs: 'Kategorie' },
                  type: 'select',
                  required: true,
                  options: [
                    { label: { en: 'School', cs: 'Škola' }, value: 'school' },
                    { label: { en: 'Shop', cs: 'Obchod' }, value: 'shop' },
                    { label: { en: 'Park', cs: 'Park' }, value: 'park' },
                    { label: { en: 'Public Transport', cs: 'MHD' }, value: 'transport' },
                    { label: { en: 'Restaurant', cs: 'Restaurace' }, value: 'restaurant' },
                    { label: { en: 'Pharmacy', cs: 'Lékárna' }, value: 'pharmacy' },
                    { label: { en: 'Hospital', cs: 'Nemocnice' }, value: 'hospital' },
                    { label: { en: 'Sport', cs: 'Sport' }, value: 'sport' },
                  ],
                  admin: {
                    description: {
                      en: 'Category enum (stored directly on the POI).',
                      cs: 'Kategorie jako enum (uloženo přímo v POI).',
                    },
                  },
                },
                { name: 'lat', label: { en: 'Latitude', cs: 'Zeměpisná šířka' }, type: 'number', required: true },
                { name: 'lng', label: { en: 'Longitude', cs: 'Zeměpisná délka' }, type: 'number', required: true },
                { name: 'distanceText', label: { en: 'Distance Text', cs: 'Text vzdálenosti' }, type: 'text', localized: true },
                { name: 'description', label: { en: 'Description', cs: 'Popis' }, type: 'textarea', localized: true },
                {
                  name: 'logo',
                  label: { en: 'Logo', cs: 'Logo' },
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'links',
                  label: { en: 'Links', cs: 'Odkazy' },
                  type: 'array',
                  fields: [
                    { name: 'label', label: { en: 'Label', cs: 'Popisek' }, type: 'text', localized: true },
                    { name: 'url', label: { en: 'URL', cs: 'URL' }, type: 'text' },
                  ],
                },
              ],
            },
          ],
        },

        // ==================== TAB 3: GALLERY (conditional) ====================
        {
          name: 'galleryTab',
          label: { en: 'Gallery', cs: 'Galerie' },
          description: {
            en: 'Project images, renders, and visualizations',
            cs: 'Obrázky projektu, rendery a vizualizace',
          },
          admin: { condition: (data) => data?.sections?.includes('gallery') },
          fields: [
            {
              name: 'gallery',
              label: { en: 'Project Uploads', cs: 'Nahraná média projektu' },
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              admin: {
                description: {
                  en: 'Upload media directly here. Captions are stored on the uploaded Media item (Title/Caption).',
                  cs: 'Nahrajte média přímo zde. Popisky řešte přímo u nahraného souboru v Media (Title/Caption).',
                },
              },
            },
          ],
        },

        // ==================== TAB 4: STANDARDS (conditional) ====================
        {
          name: 'standardsTab',
          label: { en: 'Standards', cs: 'Standardy' },
          description: {
            en: 'PDFs, brochures, and specification documents',
            cs: 'PDF soubory, brožury a dokumenty se specifikacemi',
          },
          admin: { condition: (data) => data?.sections?.includes('standards') },
          fields: [
            {
              name: 'standards',
              label: { en: 'Documents', cs: 'Dokumenty' },
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
            },
          ],
        },

        // ==================== TAB 5: TIMELINE (conditional) ====================
        {
          name: 'timelineTab',
          label: { en: 'Timeline', cs: 'Časová osa' },
          description: {
            en: 'Project milestones and progress tracking',
            cs: 'Milníky projektu a sledování průběhu',
          },
          admin: { condition: (data) => data?.sections?.includes('timeline') },
          fields: [
            {
              name: 'timelineItems',
              label: { en: 'Timeline Items', cs: 'Položky časové osy' },
              type: 'relationship',
              relationTo: 'timeline-items',
              hasMany: true,
            },
          ],
        },

        // ==================== TAB 6: REALPAD (conditional) ====================
        {
          name: 'unitsTab',
          label: { en: 'Realpad', cs: 'Realpad' },
          description: {
            en: 'Realpad integration',
            cs: 'Integrace Realpad',
          },
          admin: { condition: (data) => data?.sections?.includes('units') },
          fields: [
            {
              name: 'realpad',
              label: { en: 'Realpad Integration', cs: 'Integrace Realpad' },
              type: 'group',
              fields: [
                { name: 'enabled', label: { en: 'Enable Realpad Sync', cs: 'Povolit synchronizaci Realpad' }, type: 'checkbox', defaultValue: false },
                {
                  type: 'collapsible',
                  label: { en: 'API Credentials', cs: 'API přihlašovací údaje' },
                  admin: { initCollapsed: true },
                  fields: [
                    { name: 'baseUrl', label: { en: 'Base URL', cs: 'Base URL' }, type: 'text' },
                    {
                      type: 'row',
                      fields: [
                        { name: 'login', label: { en: 'Username', cs: 'Uživatelské jméno' }, type: 'text', admin: { width: '50%' } },
                        { name: 'password', label: { en: 'Password', cs: 'Heslo' }, type: 'text', admin: { width: '50%' } },
                      ],
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: { en: 'Realpad IDs', cs: 'Realpad ID' },
                  admin: { initCollapsed: false },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'screenId', label: { en: 'Screen ID', cs: 'ID obrazovky' }, type: 'number', admin: { width: '33%' } },
                        { name: 'projectId', label: { en: 'Project ID', cs: 'ID projektu' }, type: 'text', admin: { width: '33%' } },
                        { name: 'developerId', label: { en: 'Developer ID', cs: 'ID developera' }, type: 'number', admin: { width: '33%' } },
                      ],
                    },
                    { name: 'syncFrequencyMinutes', label: { en: 'Sync Frequency', cs: 'Frekvence synchronizace' }, type: 'number', defaultValue: 60 },
                  ],
                },
                {
                  type: 'collapsible',
                  label: { en: 'Sync Status', cs: 'Stav synchronizace' },
                  admin: { initCollapsed: true },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'lastSyncAt', label: { en: 'Last Sync Time', cs: 'Čas poslední synchronizace' }, type: 'date', admin: { readOnly: true, width: '50%' } },
                        {
                          name: 'lastSyncStatus',
                          label: { en: 'Last Sync Result', cs: 'Výsledek poslední synchronizace' },
                          type: 'select',
                          admin: { readOnly: true, width: '50%' },
                          options: [
                            { label: { en: 'OK', cs: 'OK' }, value: 'ok' },
                            { label: { en: 'Error', cs: 'Chyba' }, value: 'error' },
                            { label: { en: 'Skipped', cs: 'Přeskočeno' }, value: 'skipped' },
                          ],
                        },
                      ],
                    },
                    { name: 'lastSyncError', label: { en: 'Error Details', cs: 'Detaily chyby' }, type: 'textarea', admin: { readOnly: true } },
                  ],
                },
              ],
            },
          ],
        },

        // ==================== TAB 7: 3D MODEL (conditional) ====================
        {
          name: 'model3dTab',
          label: { en: '3D Model', cs: '3D model' },
          description: {
            en: '3D visualization and interactive model',
            cs: '3D vizualizace a interaktivní model',
          },
          admin: { condition: (data) => data?.sections?.includes('model3d') },
          fields: [
            {
              name: 'model3d',
              label: { en: '3D Model File', cs: 'Soubor 3D modelu' },
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },

        // ==================== TAB 8: AMENITIES (conditional) ====================
        {
          name: 'amenitiesTab',
          label: { en: 'Amenities', cs: 'Služby a vybavení' },
          description: {
            en: 'Project amenities, features and highlights',
            cs: 'Služby, vybavení a přednosti projektu',
          },
          admin: { condition: (data) => data?.sections?.includes('amenities') },
          fields: [
            {
              name: 'amenities',
              label: { en: 'Amenities', cs: 'Služby a vybavení' },
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'title', label: { en: 'Title', cs: 'Název' }, type: 'text', localized: true, required: true, admin: { width: '70%' } },
                    { name: 'icon', label: { en: 'Icon', cs: 'Ikona' }, type: 'text', admin: { width: '30%' } },
                  ],
                },
                { name: 'description', label: { en: 'Description', cs: 'Popis' }, type: 'textarea', localized: true },
              ],
            },
          ],
        },
      ],
    },
  ],
}