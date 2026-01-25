"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useMapEvents } from "react-leaflet";

type Localized = { cs?: string; en?: string };

type POI = {
  id: string;
  project: string | { id: string };
  name?: Localized | string;
  category: string;
  lat: number;
  lng: number;
  distanceText?: Localized | string;
  description?: Localized | string;
};

const POI_CATEGORIES = [
  { label: { en: "School", cs: "Škola" }, value: "school" },
  { label: { en: "Shop", cs: "Obchod" }, value: "shop" },
  { label: { en: "Park", cs: "Park" }, value: "park" },
  { label: { en: "Public Transport", cs: "MHD" }, value: "transport" },
  { label: { en: "Restaurant", cs: "Restaurace" }, value: "restaurant" },
  { label: { en: "Pharmacy", cs: "Lékárna" }, value: "pharmacy" },
  { label: { en: "Hospital", cs: "Nemocnice" }, value: "hospital" },
  { label: { en: "Sport", cs: "Sport" }, value: "sport" },
] as const;

function getLabel(v: string, locale: "cs" | "en") {
  return POI_CATEGORIES.find((c) => c.value === v)?.label?.[locale] ?? v;
}

function readLocalized(val: Localized | string | undefined, locale: "cs" | "en") {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[locale] ?? val.en ?? val.cs ?? "";
}

// --- React-Leaflet dynamic imports (prevents SSR issues in Next.js) ---
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

const PAYLOAD_BASE_URL = ""; // pokud máš jiný origin: "https://payload.tvoje-domena.cz"

async function payloadFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${PAYLOAD_BASE_URL}${input}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Payload request failed (${res.status}): ${text}`);
  }
  return (await res.json()) as T;
}

function getProjectId(project: POI["project"]) {
  return typeof project === "string" ? project : project?.id;
}

type Props = {
  projectId: string;
  locale?: "cs" | "en";
  center?: { lat: number; lng: number };
  zoom?: number;
  canEdit?: boolean; // když chceš třeba vypnout edit v public view
};

export function POIMap({
  projectId,
  locale = "cs",
  center = { lat: 50.0755, lng: 14.4378 }, // default Praha
  zoom = 13,
  canEdit = true,
}: Props) {
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // draft při kliknutí do mapy
  const [draft, setDraft] = useState<null | { lat: number; lng: number }>(null);
  const [draftName, setDraftName] = useState("");
  const [draftCategory, setDraftCategory] = useState<(typeof POI_CATEGORIES)[number]["value"]>("school");
  const [saving, setSaving] = useState(false);

  // Leaflet icon fix – jen na klientu
  useEffect(() => {
    (async () => {
      try {
        const L = (await import("leaflet")).default;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "/leaflet/marker-icon-2x.png",
          iconUrl: "/leaflet/marker-icon.png",
          shadowUrl: "/leaflet/marker-shadow.png",
        });
      } catch {
        // ignore
      }
    })();
  }, []);

  const loadPOIs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Payload REST: /api/<collectionSlug>?where[project][equals]=<id>&limit=200
      const data = await payloadFetch<{ docs: POI[] }>(
        `/api/pointsOfInterests?where[project][equals]=${encodeURIComponent(projectId)}&limit=200`
      );
      setPois(data.docs ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadPOIs();
  }, [loadPOIs]);

  const onMapClick = useCallback(
    (lat: number, lng: number) => {
      if (!canEdit) return;
      setDraft({ lat, lng });
      setDraftName("");
      setDraftCategory("school");
    },
    [canEdit]
  );

  const ClickCatcher = useMemo(() => {
    // wrapper komponenta pro useMapEvents (musí být renderovaná uvnitř MapContainer)
    // eslint-disable-next-line react/display-name
    return function ClickCatcherImpl() {
      return useMapEvents({
        click(e: any) {
          onMapClick(e.latlng.lat, e.latlng.lng);
        },
      });
    };
  }, [onMapClick, useMapEvents]);

  const createPOI = useCallback(async () => {
    if (!draft) return;
    const name = draftName.trim();
    if (!name) {
      setError(locale === "cs" ? "Zadej název POI." : "Please enter a POI name.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const body = {
        project: projectId,
        name: { [locale]: name },
        category: draftCategory,
        lat: draft.lat,
        lng: draft.lng,
      };

      const created = await payloadFetch<POI>(`/api/pointsOfInterests`, {
        method: "POST",
        body: JSON.stringify(body),
      });

      setPois((prev) => [created, ...prev]);
      setDraft(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }, [draft, draftCategory, draftName, locale, projectId]);

  const deletePOI = useCallback(async (id: string) => {
    setError("");
    try {
      await payloadFetch(`/api/pointsOfInterests/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setPois((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }, []);

  const visiblePois = useMemo(
    () => pois.filter((p) => getProjectId(p.project) === projectId),
    [pois, projectId]
  );

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm">
          <div className="font-semibold">
            {locale === "cs" ? "Mapa POI" : "POI Map"}
          </div>
          <div className="text-muted-foreground">
            {canEdit
              ? locale === "cs"
                ? "Klikni do mapy pro přidání POI. V popupu lze mazat."
                : "Click the map to add a POI. Delete via marker popup."
              : locale === "cs"
                ? "Pouze prohlížení."
                : "View only."}
          </div>
        </div>

        <button
          className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
          onClick={loadPOIs}
          disabled={loading}
          type="button"
        >
          {loading ? (locale === "cs" ? "Načítám…" : "Loading…") : (locale === "cs" ? "Obnovit" : "Refresh")}
        </button>
      </div>

      {error ? (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-xl border">
          <div className="h-[520px] w-full">
            <MapContainer center={[center.lat, center.lng]} zoom={zoom} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* klik do mapy */}
              {/* @ts-expect-error dynamic component */}
              <ClickCatcher />

              {/* existující POI */}
              {visiblePois.map((p) => (
                <Marker key={p.id} position={[p.lat, p.lng]}>
                  <Popup>
                    <div className="space-y-2">
                      <div>
                        <div className="font-semibold">
                          {readLocalized(p.name as any, locale) || "POI"}
                        </div>
                        <div className="text-xs opacity-70">
                          {getLabel(p.category, locale)}
                        </div>
                        <div className="text-xs opacity-70">
                          {p.lat.toFixed(6)}, {p.lng.toFixed(6)}
                        </div>
                      </div>

                      {canEdit ? (
                        <button
                          type="button"
                          className="w-full rounded-md border px-3 py-2 text-sm hover:bg-accent"
                          onClick={() => deletePOI(p.id)}
                        >
                          {locale === "cs" ? "Smazat" : "Delete"}
                        </button>
                      ) : null}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* draft marker */}
              {draft ? (
                <Marker position={[draft.lat, draft.lng]}>
                  <Popup>
                    <div className="text-sm">
                      {locale === "cs" ? "Nový POI" : "New POI"}: {draft.lat.toFixed(6)}, {draft.lng.toFixed(6)}
                    </div>
                  </Popup>
                </Marker>
              ) : null}
            </MapContainer>
          </div>
        </div>

        {/* panel pro vytvoření */}
        <div className="rounded-xl border p-4">
          <div className="mb-2 text-sm font-semibold">
            {locale === "cs" ? "Přidat POI" : "Add POI"}
          </div>

          {!canEdit ? (
            <div className="text-sm text-muted-foreground">
              {locale === "cs" ? "Nemáš oprávnění k úpravám." : "You don't have edit permissions."}
            </div>
          ) : !draft ? (
            <div className="text-sm text-muted-foreground">
              {locale === "cs" ? "Klikni do mapy a vyplň název + kategorii." : "Click the map, then fill name + category."}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs opacity-70">
                {draft.lat.toFixed(6)}, {draft.lng.toFixed(6)}
              </div>

              <label className="block text-sm">
                <span className="mb-1 block text-xs opacity-70">{locale === "cs" ? "Název" : "Name"}</span>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder={locale === "cs" ? "Např. ZŠ Komenského" : "e.g. Central School"}
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-xs opacity-70">{locale === "cs" ? "Kategorie" : "Category"}</span>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={draftCategory}
                  onChange={(e) => setDraftCategory(e.target.value as any)}
                >
                  {POI_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label[locale]}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-md border px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
                  onClick={createPOI}
                  disabled={saving}
                >
                  {saving ? (locale === "cs" ? "Ukládám…" : "Saving…") : (locale === "cs" ? "Uložit" : "Save")}
                </button>

                <button
                  type="button"
                  className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
                  onClick={() => setDraft(null)}
                >
                  {locale === "cs" ? "Zrušit" : "Cancel"}
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 border-t pt-3 text-xs opacity-70">
            {locale === "cs"
              ? `POI v projektu: ${visiblePois.length}`
              : `POIs in project: ${visiblePois.length}`}
          </div>
        </div>
      </div>
    </div>
  );
}