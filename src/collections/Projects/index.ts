// src/collections/Projects.ts
import type { CollectionConfig, Field, RowField } from 'payload'
import { slugField } from 'payload'
import { isLoggedIn, isEditorOrAbove } from '../../access/index'
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
                    // 1. Regex pro kontrolu formátu (pouze a-z, 0-9 a pomlčka)
                    // Pokud hodnota existuje a neodpovídá regexu, vrátíme chybovou hlášku.
                    if (val && !/^[a-z0-9-]+$/.test(val)) {
                      return 'Slug může obsahovat pouze malá písmena (a-z), čísla (0-9) a pomlčky (-). Bez mezer a diakritiky.'
                    }

                    // 2. Volitelné: Kontrola, zda nezačíná nebo nekončí pomlčkou
                    if (val && (val.startsWith('-') || val.endsWith('-'))) {
                      return 'Slug nesmí začínat ani končit pomlčkou.'
                    }

                    // 3. Zavoláme výchozí textový validátor (řeší 'required', 'maxLength' atd.)
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
                  name: 'cover',
                  label: { en: 'Cover Image', cs: 'Úvodní obrázek' },
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: {
                      en: 'Main project image for listings and headers',
                      cs: 'Hlavní obrázek projektu pro výpisy a záhlaví',
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
                  en: 'Select which content sections to display for this project. New tabs will appear for each selected section.',
                  cs: 'Vyberte, které obsahové sekce se mají zobrazit pro tento projekt. Pro každou vybranou sekci se objeví nová záložka.',
                },
              },
              options: [
                { label: { en: 'Location & Surroundings', cs: 'Lokalita a okolí' }, value: 'location' },
                { label: { en: 'Gallery / Views', cs: 'Galerie / Pohledy' }, value: 'gallery' },
                { label: { en: 'Standards / PDFs', cs: 'Standardy / PDF' }, value: 'standards' },
                { label: { en: 'Timeline', cs: 'Časová osa' }, value: 'timeline' },
                { label: { en: 'Units / Realpad', cs: 'Jednotky / Realpad' }, value: 'units' },
                { label: { en: '3D Model', cs: '3D model' }, value: 'model3d' },
                { label: { en: 'Amenities & Features', cs: 'Služby a vybavení' }, value: 'amenities' },
              ],
            },
          ],
        },

        // ==================== TAB 2: DASHBOARD ====================
        {
          label: { en: 'Dashboard', cs: 'Přehled' },
          description: {
            en: 'Configure how the project appears on the main dashboard',
            cs: 'Nastavení zobrazení projektu na hlavním přehledu',
          },
          fields: [
            {
              name: 'dashboard',
              label: { en: 'Dashboard Settings', cs: 'Nastavení přehledu' },
              type: 'group',
              admin: {
                description: {
                  en: 'Settings for project presentation on the dashboard view',
                  cs: 'Nastavení prezentace projektu na přehledové stránce',
                },
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'pinLat',
                      label: { en: 'Pin Latitude', cs: 'Zeměpisná šířka' },
                      type: 'number',
                      admin: {
                        width: '50%',
                        description: {
                          en: 'Latitude coordinate for map pin (e.g., 50.0875)',
                          cs: 'Souřadnice zeměpisné šířky pro pin na mapě (např. 50.0875)',
                        },
                      },
                    },
                    {
                      name: 'pinLng',
                      label: { en: 'Pin Longitude', cs: 'Zeměpisná délka' },
                      type: 'number',
                      admin: {
                        width: '50%',
                        description: {
                          en: 'Longitude coordinate for map pin (e.g., 14.4213)',
                          cs: 'Souřadnice zeměpisné délky pro pin na mapě (např. 14.4213)',
                        },
                      },
                    },
                  ],
                },
                {
                  name: 'badgeLabel',
                  label: { en: 'Badge Label', cs: 'Štítek' },
                  type: 'text',
                  localized: true,
                  admin: {
                    description: {
                      en: 'Short label shown on project badge (e.g., "New", "Bestseller")',
                      cs: 'Krátký text zobrazený na štítku projektu (např. "Novinka", "Bestseller")',
                    },
                  },
                },
              ],
            },
          ],
        },

        // ==================== TAB 3: LOCATION (conditional) ====================
        {
          name: 'locationTab',
          label: { en: 'Location', cs: 'Lokalita' },
          description: {
            en: 'Project location with map and points of interest',
            cs: 'Lokace projektu s mapou a body zájmu',
          },
          admin: {
            condition: (data) => data?.sections?.includes('location'),
          },
          fields: [
            {
              name: 'location',
              label: { en: 'Location Module', cs: 'Modul lokality' },
              type: 'relationship',
              relationTo: 'locations',
              admin: {
                description: {
                  en: 'Select location configuration with map data and nearby POIs',
                  cs: 'Vyberte konfiguraci lokality s mapovými daty a blízkými body zájmu',
                },
              },
            },
          ],
        },

        // ==================== TAB 4: GALLERY (conditional) ====================
        {
          name: 'galleryTab',
          label: { en: 'Gallery', cs: 'Galerie' },
          description: {
            en: 'Project images, renders, and visualizations',
            cs: 'Obrázky projektu, rendery a vizualizace',
          },
          admin: {
            condition: (data) => data?.sections?.includes('gallery'),
          },
          fields: [
            {
              name: 'gallery',
              label: { en: 'Gallery Media', cs: 'Galerie (média)' },
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              admin: {
                description: {
                  en: 'Upload/select images for the project gallery (stored in Media).',
                  cs: 'Nahrajte / vyberte obrázky pro galerii projektu (uloženo v Media).',
                },
              },
            },
          ],
        },

        // ==================== TAB 5: STANDARDS (conditional) ====================
        {
          name: 'standardsTab',
          label: { en: 'Standards', cs: 'Standardy' },
          description: {
            en: 'PDFs, brochures, and specification documents',
            cs: 'PDF soubory, brožury a dokumenty se specifikacemi',
          },
          admin: {
            condition: (data) => data?.sections?.includes('standards'),
          },
          fields: [
            {
              name: 'standards',
              label: { en: 'Documents', cs: 'Dokumenty' },
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              admin: {
                description: {
                  en: 'Upload PDF brochures, floor plans, and specification documents',
                  cs: 'Nahrajte PDF brožury, půdorysy a dokumenty se specifikacemi',
                },
              },
            },
          ],
        },

        // ==================== TAB 6: TIMELINE (conditional) ====================
        {
          name: 'timelineTab',
          label: { en: 'Timeline', cs: 'Časová osa' },
          description: {
            en: 'Project milestones and progress tracking',
            cs: 'Milníky projektu a sledování průběhu',
          },
          admin: {
            condition: (data) => data?.sections?.includes('timeline'),
          },
          fields: [
            {
              name: 'timelineItems',
              label: { en: 'Timeline Items', cs: 'Položky časové osy' },
              type: 'relationship',
              relationTo: 'timeline-items',
              hasMany: true,
              admin: {
                description: {
                  en: 'Select timeline items for this project (items are stored in Timeline Items collection).',
                  cs: 'Vyber položky časové osy pro tento projekt (položky jsou v kolekci Timeline Items).',
                },
              },
              filterOptions: ({ data }) => ({
                project: { equals: data?.id },
              }),
            },
          ],
        },

        // ==================== TAB 7: UNITS & REALPAD (conditional) ====================
        {
          name: 'unitsTab',
          label: { en: 'Units & Realpad', cs: 'Jednotky & Realpad' },
          description: {
            en: 'Unit listings, availability and Realpad integration',
            cs: 'Seznam jednotek, dostupnost a integrace s Realpad',
          },
          admin: {
            condition: (data) => data?.sections?.includes('units'),
          },
          fields: [
            {
              name: 'units',
              label: { en: 'Units Config', cs: 'Konfigurace jednotek' },
              type: 'relationship',
              relationTo: 'unitConfigs',
              admin: {
                description: {
                  en: 'Select configuration for unit listings and filters',
                  cs: 'Vyberte konfiguraci pro seznam jednotek a filtry',
                },
              },
            },
            {
              name: 'realpad',
              label: { en: 'Realpad Integration', cs: 'Integrace Realpad' },
              type: 'group',
              admin: {
                description: {
                  en: 'Configure automatic sync with Realpad pricelist. Credentials are stored securely and never exposed to frontend.',
                  cs: 'Nastavení automatické synchronizace s ceníkem Realpad. Přihlašovací údaje jsou bezpečně uloženy a nikdy nejsou vystaveny frontendu.',
                },
              },
              fields: [
                {
                  name: 'enabled',
                  label: { en: 'Enable Realpad Sync', cs: 'Povolit synchronizaci Realpad' },
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    description: {
                      en: 'Turn on automatic synchronization with Realpad',
                      cs: 'Zapnout automatickou synchronizaci s Realpad',
                    },
                  },
                },
                {
                  type: 'collapsible',
                  label: { en: 'API Credentials', cs: 'API přihlašovací údaje' },
                  admin: {
                    initCollapsed: true,
                    description: {
                      en: 'Realpad login credentials (stored server-side only)',
                      cs: 'Přihlašovací údaje Realpad (uloženy pouze na serveru)',
                    },
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'login',
                          label: { en: 'Username', cs: 'Uživatelské jméno' },
                          type: 'text',
                          admin: {
                            width: '50%',
                            description: {
                              en: 'Realpad account username',
                              cs: 'Uživatelské jméno účtu Realpad',
                            },
                          },
                        },
                        {
                          name: 'password',
                          label: { en: 'Password', cs: 'Heslo' },
                          type: 'text',
                          admin: {
                            width: '50%',
                            description: {
                              en: 'Realpad account password (never exposed to frontend)',
                              cs: 'Heslo účtu Realpad (nikdy nevystaveno frontendu)',
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: { en: 'Realpad IDs', cs: 'Realpad ID' },
                  admin: {
                    initCollapsed: false,
                    description: {
                      en: 'Identifiers from your Realpad account',
                      cs: 'Identifikátory z vašeho účtu Realpad',
                    },
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'screenId',
                          label: { en: 'Screen ID', cs: 'ID obrazovky' },
                          type: 'number',
                          admin: {
                            width: '33%',
                            description: {
                              en: 'Realpad screen identifier',
                              cs: 'Identifikátor obrazovky Realpad',
                            },
                          },
                        },
                        {
                          name: 'projectId',
                          label: { en: 'Project ID', cs: 'ID projektu' },
                          type: 'number',
                          admin: {
                            width: '33%',
                            description: {
                              en: 'Realpad project identifier',
                              cs: 'Identifikátor projektu Realpad',
                            },
                          },
                        },
                        {
                          name: 'developerId',
                          label: { en: 'Developer ID', cs: 'ID developera' },
                          type: 'number',
                          admin: {
                            width: '33%',
                            description: {
                              en: 'Realpad developer identifier',
                              cs: 'Identifikátor developera Realpad',
                            },
                          },
                        },
                      ],
                    },
                    {
                      name: 'syncFrequencyMinutes',
                      label: { en: 'Sync Frequency', cs: 'Frekvence synchronizace' },
                      type: 'number',
                      defaultValue: 60,
                      admin: {
                        description: {
                          en: 'How often to sync data from Realpad (in minutes). Default: 60',
                          cs: 'Jak často synchronizovat data z Realpad (v minutách). Výchozí: 60',
                        },
                      },
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: { en: 'Sync Status', cs: 'Stav synchronizace' },
                  admin: {
                    initCollapsed: true,
                    description: {
                      en: 'Automatically updated sync information (read-only)',
                      cs: 'Automaticky aktualizované informace o synchronizaci (pouze pro čtení)',
                    },
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'lastSyncAt',
                          label: { en: 'Last Sync Time', cs: 'Čas poslední synchronizace' },
                          type: 'date',
                          admin: {
                            readOnly: true,
                            width: '50%',
                            description: {
                              en: 'When the last sync occurred',
                              cs: 'Kdy proběhla poslední synchronizace',
                            },
                          },
                        },
                        {
                          name: 'lastSyncStatus',
                          label: { en: 'Last Sync Result', cs: 'Výsledek poslední synchronizace' },
                          type: 'select',
                          admin: {
                            readOnly: true,
                            width: '50%',
                            description: {
                              en: 'Status of the last sync attempt',
                              cs: 'Stav posledního pokusu o synchronizaci',
                            },
                          },
                          options: [
                            { label: { en: 'OK', cs: 'OK' }, value: 'ok' },
                            { label: { en: 'Error', cs: 'Chyba' }, value: 'error' },
                            { label: { en: 'Skipped', cs: 'Přeskočeno' }, value: 'skipped' },
                          ],
                        },
                      ],
                    },
                    {
                      name: 'lastSyncError',
                      label: { en: 'Error Details', cs: 'Detaily chyby' },
                      type: 'textarea',
                      admin: {
                        readOnly: true,
                        description: {
                          en: 'Error message if the last sync failed',
                          cs: 'Chybová zpráva, pokud poslední synchronizace selhala',
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ==================== TAB 8: 3D MODEL (conditional) ====================
        {
          name: 'model3dTab',
          label: { en: '3D Model', cs: '3D model' },
          description: {
            en: '3D visualization and interactive model',
            cs: '3D vizualizace a interaktivní model',
          },
          admin: {
            condition: (data) => data?.sections?.includes('model3d'),
          },
          fields: [
            {
              name: 'model3d',
              label: { en: '3D Model File', cs: 'Soubor 3D modelu' },
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: {
                  en: '3D visualization file (e.g., Unity WebGL build, glTF model)',
                  cs: '3D vizualizace (např. Unity WebGL build, glTF model)',
                },
              },
            },
          ],
        },

        // ==================== TAB 9: AMENITIES (conditional) ====================
        {
          name: 'amenitiesTab',
          label: { en: 'Amenities', cs: 'Služby a vybavení' },
          description: {
            en: 'Project amenities, features and highlights',
            cs: 'Služby, vybavení a přednosti projektu',
          },
          admin: {
            condition: (data) => data?.sections?.includes('amenities'),
          },
          fields: [
            {
              name: 'amenities',
              label: { en: 'Amenities', cs: 'Služby a vybavení' },
              type: 'array',
              admin: {
                description: {
                  en: 'List amenities/features shown on the project detail.',
                  cs: 'Seznam služeb/vybavení zobrazený na detailu projektu.',
                },
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'title',
                      label: { en: 'Title', cs: 'Název' },
                      type: 'text',
                      localized: true,
                      required: true,
                      admin: { width: '70%' },
                    },
                    {
                      name: 'icon',
                      label: { en: 'Icon', cs: 'Ikona' },
                      type: 'text',
                      admin: { width: '30%', description: { cs: 'Např. "parking", "lift", "wifi".' } },
                    },
                  ],
                },
                {
                  name: 'description',
                  label: { en: 'Description', cs: 'Popis' },
                  type: 'textarea',
                  localized: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}