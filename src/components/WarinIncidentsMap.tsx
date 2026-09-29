import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Car,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
  Plus,
  Compass,
  Layers,
  ThumbsUp,
  Share2,
  Navigation,
  Info,
  CheckCircle2,
  X,
  Code2,
  Copy,
  Check
} from 'lucide-react';
import { WarinIncident, IncidentType, IncidentSeverity } from '../types/warinIncident';
import { INITIAL_WARIN_INCIDENTS, WARIN_CHAMRAP_CENTER } from '../data/warinIncidentsData';

interface WarinIncidentsMapProps {
  onBackToHub?: () => void;
}

export const WarinIncidentsMap: React.FC<WarinIncidentsMapProps> = ({ onBackToHub }) => {
  const [incidents, setIncidents] = useState<WarinIncident[]>(() => {
    try {
      const saved = localStorage.getItem('warin_incidents_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return INITIAL_WARIN_INCIDENTS;
  });

  const [activeFilter, setActiveFilter] = useState<'all' | IncidentType>('all');
  const [activeSeverity, setActiveSeverity] = useState<'all' | IncidentSeverity>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<WarinIncident | null>(null);
  const [mapTileStyle, setMapTileStyle] = useState<'standard' | 'humanitarian' | 'satellite'>('standard');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isApiSnippetModalOpen, setIsApiSnippetModalOpen] = useState(false);
  const [hasCopiedSnippet, setHasCopiedSnippet] = useState(false);

  // Form state for reporting new incident
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<IncidentType>('accident');
  const [newSeverity, setNewSeverity] = useState<IncidentSeverity>('warning');
  const [newLocationName, setNewLocationName] = useState('');
  const [newSubdistrict, setNewSubdistrict] = useState('ต.วารินชำราบ');
  const [newDescription, setNewDescription] = useState('');
  const [newDetour, setNewDetour] = useState('');
  const [newReporter, setNewReporter] = useState('');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Save to local storage on update
  useEffect(() => {
    try {
      localStorage.setItem('warin_incidents_v1', JSON.stringify(incidents));
    } catch {
      // Ignore
    }
  }, [incidents]);

  // Filtered incidents
  const filteredIncidents = incidents.filter((item) => {
    if (activeFilter !== 'all' && item.type !== activeFilter) return false;
    if (activeSeverity !== 'all' && item.severity !== activeSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchLoc = item.locationName.toLowerCase().includes(q);
      const matchSub = item.subdistrict.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      if (!matchTitle && !matchLoc && !matchSub && !matchDesc) return false;
    }
    return true;
  });

  // Tile URL based on style
  const getTileUrl = (style: 'standard' | 'humanitarian' | 'satellite') => {
    if (style === 'humanitarian') {
      return 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
    }
    if (style === 'satellite') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  };

  // Switch Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newTiles = L.tileLayer(getTileUrl(mapTileStyle), {
      maxZoom: 19,
      attribution: mapTileStyle === 'satellite' ? '&copy; Esri & Maxar' : '&copy; OpenStreetMap contributors',
    });
    newTiles.addTo(mapInstanceRef.current);
    tileLayerRef.current = newTiles;
  }, [mapTileStyle]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [WARIN_CHAMRAP_CENTER.lat, WARIN_CHAMRAP_CENTER.lng],
      zoom: WARIN_CHAMRAP_CENTER.zoom,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    const initialTiles = L.tileLayer(getTileUrl(mapTileStyle), {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    });
    initialTiles.addTo(map);
    tileLayerRef.current = initialTiles;

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    const handleResize = () => {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when incidents or filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    filteredIncidents.forEach((item) => {
      // Determine Pin Color & Icon HTML
      let badgeBg = 'bg-rose-600 border-rose-700 text-white';
      let iconSymbol = '🚗';
      let pulseAnim = 'animate-pulse';

      if (item.type === 'accident') {
        badgeBg = 'bg-rose-600 border-rose-800 text-white';
        iconSymbol = '💥';
      } else if (item.type === 'flood_road') {
        badgeBg = 'bg-sky-600 border-sky-800 text-white';
        iconSymbol = '🌊';
      } else if (item.type === 'road_closed') {
        badgeBg = 'bg-amber-600 border-amber-800 text-white';
        iconSymbol = '⛔';
      } else if (item.type === 'hazard') {
        badgeBg = 'bg-orange-600 border-orange-800 text-white';
        iconSymbol = '⚠️';
      } else if (item.type === 'news') {
        badgeBg = 'bg-blue-600 border-blue-800 text-white';
        iconSymbol = '📢';
        pulseAnim = '';
      }

      const isSelected = selectedIncident?.id === item.id;
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-10 h-10 rounded-2xl ${badgeBg} border-2 shadow-lg flex items-center justify-center text-base transition-transform duration-200 ${
            isSelected ? 'scale-125 ring-4 ring-rose-400 z-50' : 'hover:scale-110'
          } ${pulseAnim}">
            <span>${iconSymbol}</span>
          </div>
          <div class="absolute -bottom-1 w-2 h-2 bg-slate-900 rotate-45"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-incident-pin',
        html: markerHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 42],
        popupAnchor: [0, -42],
      });

      const marker = L.marker([item.coordinates.lat, item.coordinates.lng], {
        icon: customIcon,
      });

      // InfoWindow HTML Popup
      const popupHtml = `
        <div class="font-['Sarabun',sans-serif] text-slate-800 p-1 min-w-[240px] max-w-[280px]">
          <div class="flex items-center gap-1.5 text-[11px] font-bold ${
            item.severity === 'critical'
              ? 'text-rose-600'
              : item.severity === 'warning'
              ? 'text-amber-600'
              : 'text-blue-600'
          }">
            <span>${item.type === 'accident' ? '💥 อุบัติเหตุ' : item.type === 'flood_road' ? '🌊 น้ำท่วมถนน' : item.type === 'road_closed' ? '⛔ ปิดถนน' : '⚠️ แจ้งเตือน'}</span>
            <span>&bull;</span>
            <span>${item.reportedTime}</span>
          </div>
          <h4 class="font-bold text-xs text-slate-900 mt-1 leading-snug">${item.title}</h4>
          <p class="text-[11px] text-slate-500 mt-1 leading-relaxed">${item.locationName}</p>
          <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span class="text-slate-400">${item.subdistrict}</span>
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${item.coordinates.lat},${item.coordinates.lng}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5"
            >
              นำทาง Google Maps &rarr;
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setSelectedIncident(item);
      });

      markersGroup.addLayer(marker);
    });
  }, [filteredIncidents, selectedIncident]);

  // Center on incident
  const handleSelectIncident = (incident: WarinIncident) => {
    setSelectedIncident(incident);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([incident.coordinates.lat, incident.coordinates.lng], 15, {
        duration: 1.2,
      });
    }
  };

  // Reset to Warin center
  const handleResetWarinCenter = () => {
    setSelectedIncident(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [WARIN_CHAMRAP_CENTER.lat, WARIN_CHAMRAP_CENTER.lng],
        WARIN_CHAMRAP_CENTER.zoom,
        { duration: 1 }
      );
    }
  };

  // Upvote incident
  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIncidents((prev) =>
      prev.map((item) => (item.id === id ? { ...item, upvotes: (item.upvotes || 0) + 1 } : item))
    );
  };

  // Submit new incident
  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newLocationName.trim()) return;

    // Place randomly near Warin Center
    const randomOffsetLat = (Math.random() - 0.5) * 0.02;
    const randomOffsetLng = (Math.random() - 0.5) * 0.02;

    const created: WarinIncident = {
      id: `warin-usr-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      severity: newSeverity,
      locationName: newLocationName.trim(),
      subdistrict: newSubdistrict,
      coordinates: {
        lat: Number((WARIN_CHAMRAP_CENTER.lat + randomOffsetLat).toFixed(5)),
        lng: Number((WARIN_CHAMRAP_CENTER.lng + randomOffsetLng).toFixed(5)),
      },
      reportedTime: 'เพิ่งแจ้งเมื่อสักครู่',
      timestamp: Date.now(),
      description: newDescription.trim() || 'ได้รับแจ้งจากประชาชนในพื้นที่ โปรดเพิ่มความระมัดระวัง',
      trafficStatus: newSeverity === 'critical' ? 'heavy_delay' : 'normal_caution',
      detourAdvice: newDetour.trim() || 'ชะลอความเร็วและปฏิบัติตามสัญญาณของเจ้าหน้าที่',
      reporterSource: newReporter.trim() || 'พลเมืองดีแจ้งเหตุ (วารินชำราบ)',
      upvotes: 1,
    };

    setIncidents((prev) => [created, ...prev]);
    setIsReportModalOpen(false);
    setSelectedIncident(created);

    // Reset inputs
    setNewTitle('');
    setNewLocationName('');
    setNewDescription('');
    setNewDetour('');
    setNewReporter('');

    // Fly to new incident
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([created.coordinates.lat, created.coordinates.lng], 15, {
        duration: 1.2,
      });
    }
  };

  // Google Maps JS API Standalone Code Sample
  const googleMapsCodeSnippet = `<!-- Google Maps JavaScript API: แผนที่แจ้งเตือนอุบัติเหตุ อำเภอวารินชำราบ จ.อุบลราชธานี -->
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>Warin Chamrap Incidents Map - Google Maps</title>
  <style>
    #map { height: 100vh; width: 100%; }
    .custom-window { font-family: 'Sarabun', sans-serif; font-size: 13px; line-height: 1.4; }
  </style>
</head>
<body>
  <div id="map"></div>

  <!-- โหลด Google Maps JavaScript API (ใส่ YOUR_API_KEY) -->
  <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=marker&callback=initMap" async defer></script>

  <script>
    // 1. กำหนดจุดศูนย์กลางที่ อำเภอวารินชำราบ จ.อุบลราชธานี
    const WARIN_CHAMRAP_CENTER = { lat: 15.1950, lng: 104.8580 };

    // 2. จำลองข้อมูลอุบัติเหตุและเหตุการณ์ในพื้นที่
    const warinIncidents = ${JSON.stringify(INITIAL_WARIN_INCIDENTS.slice(0, 3), null, 2)};

    function initMap() {
      // สร้างอ็อบเจ็กต์แผนที่
      const map = new google.maps.Map(document.getElementById("map"), {
        center: WARIN_CHAMRAP_CENTER,
        zoom: 13,
        mapId: "DEMO_MAP_ID", // หรือ Map ID ของคุณ
        mapTypeControl: true,
        streetViewControl: false,
      });

      const infoWindow = new google.maps.InfoWindow();

      // วนลูปสร้างหมุดแจ้งเตือน
      warinIncidents.forEach((item) => {
        const marker = new google.maps.Marker({
          position: item.coordinates,
          map: map,
          title: item.title,
          // ปรับสีหมุดตามประเภท: อุบัติเหตุ (แดง) / น้ำท่วม (ฟ้า)
          icon: {
            url: item.type === 'accident'
              ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
              : 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          },
        });

        // เปิด InfoWindow เมื่อคลิกหมุด
        marker.addListener("click", () => {
          const content = \`
            <div class="custom-window">
              <strong style="color: #dc2626;">\${item.type === 'accident' ? '💥 อุบัติเหตุ' : '🌊 น้ำท่วมผิวถนน'}</strong>
              <h4 style="margin: 4px 0;">\${item.title}</h4>
              <p style="color: #64748b; margin: 2px 0;">\${item.locationName} (\${item.subdistrict})</p>
              <p style="margin: 4px 0;">\${item.description}</p>
              <small style="color: #2563eb;">แหล่งข่าว: \${item.reporterSource}</small>
            </div>
          \`;
          infoWindow.setContent(content);
          infoWindow.open(map, marker);
        });
      });
    }
  </script>
</body>
</html>`;

  const copySnippet = () => {
    navigator.clipboard.writeText(googleMapsCodeSnippet);
    setHasCopiedSnippet(true);
    setTimeout(() => setHasCopiedSnippet(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto w-full pb-16">
      {/* 1. TOP HEADER & NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                พื้นที่เป้าหมาย: อ.วารินชำราบ
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                พิกัด: 15.1950° N, 104.8580° E &bull; จ.อุบลราชธานี
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 leading-snug">
              แผนที่แจ้งเตือนอุบัติเหตุ & ข่าวสารจราจรอำเภอวารินชำราบ
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ตรวจจุดเกิดอุบัติเหตุ น้ำท่วมผิวจราจร เส้นทางปิดซ่อมแซม และวางแผนหลีกเลี่ยงเส้นทางแบบเรียลไทม์
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>แจ้งเหตุใหม่</span>
          </button>

          <button
            onClick={() => setIsApiSnippetModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="ดูโค้ดตัวอย่าง Google Maps JavaScript API (Standalone)"
          >
            <Code2 className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Google Maps API Setup</span>
          </button>

          {onBackToHub && (
            <button
              onClick={onBackToHub}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              กลับสู่ศูนย์รวมเมนู
            </button>
          )}
        </div>
      </div>

      {/* 2. STATS & INCIDENT SUMMARY BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">เหตุการณ์ทั้งหมดในวารินฯ</div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {incidents.length} <span className="text-xs font-normal text-slate-400">จุด</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
          <div className="text-[11px] font-medium text-rose-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            <span>อุบัติเหตุทางถนน</span>
          </div>
          <div className="text-2xl font-black text-rose-600 mt-0.5">
            {incidents.filter((i) => i.type === 'accident').length} <span className="text-xs font-normal text-slate-400">เคส</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
          <div className="text-[11px] font-medium text-sky-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>น้ำเอ่อท่วมผิวจราจร</span>
          </div>
          <div className="text-2xl font-black text-sky-700 mt-0.5">
            {incidents.filter((i) => i.type === 'flood_road').length} <span className="text-xs font-normal text-slate-400">จุด</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
          <div className="text-[11px] font-medium text-amber-700 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>ปิดทาง / ทางขาด</span>
          </div>
          <div className="text-2xl font-black text-amber-800 mt-0.5">
            {incidents.filter((i) => i.type === 'road_closed').length} <span className="text-xs font-normal text-slate-400">จุด</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN SPLIT INTERFACE: FILTER BAR + MAP + INCIDENTS FEED */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Filter Controls Row */}
        <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/60">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              ทั้งหมด ({incidents.length})
            </button>
            <button
              onClick={() => setActiveFilter('accident')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeFilter === 'accident'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
              }`}
            >
              <span>💥 อุบัติเหตุ</span>
              <span>({incidents.filter((i) => i.type === 'accident').length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('flood_road')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeFilter === 'flood_road'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-white text-sky-700 border border-sky-200 hover:bg-sky-50'
              }`}
            >
              <span>🌊 น้ำท่วมผิวทาง</span>
              <span>({incidents.filter((i) => i.type === 'flood_road').length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('road_closed')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeFilter === 'road_closed'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              <span>⛔ ปิดจราจร</span>
              <span>({incidents.filter((i) => i.type === 'road_closed').length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('news')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeFilter === 'news'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              <span>📢 ข่าวสารแม่น้ำมูล</span>
              <span>({incidents.filter((i) => i.type === 'news').length})</span>
            </button>
          </div>

          {/* Search Box & Center Reset */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาถนน, ตลาด, จุดเกิดเหตุ..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <button
              onClick={handleResetWarinCenter}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title="รีเซ็ตมุมมองกลับไปที่ศูนย์กลางอำเภอวารินชำราบ"
            >
              <Compass className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">ศูนย์กลางวารินฯ</span>
            </button>

            {/* Tile Layer Selector */}
            <select
              value={mapTileStyle}
              onChange={(e) => setMapTileStyle(e.target.value as any)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="standard">แผนที่ถนน</option>
              <option value="humanitarian">แผนที่กู้ภัย (HOT)</option>
              <option value="satellite">ภาพดาวเทียม</option>
            </select>
          </div>
        </div>

        {/* Map + Side Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px] h-[640px]">
          {/* Map Column (7 cols on Desktop) */}
          <div className="lg:col-span-7 h-full relative bg-slate-100">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Floating Overlay Indicator */}
            <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center gap-2 pointer-events-none">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              <span>อ.วารินชำราบ (Live GIS Monitor)</span>
            </div>

            {/* Quick Map Legend */}
            <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-2 rounded-xl shadow-md border border-slate-200 text-[10px] text-slate-700 flex items-center gap-2.5">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span>อุบัติเหตุ</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                <span>น้ำท่วมผิวทาง</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                <span>ปิดการจราจร</span>
              </span>
            </div>
          </div>

          {/* Incident Feed & Detail Column (5 cols on Desktop) */}
          <div className="lg:col-span-5 h-full flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 bg-white">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>รายการเหตุการณ์ในพื้นที่ ({filteredIncidents.length})</span>
              </div>
              <span className="text-[11px] text-slate-400">คลิกเพื่อซูมดูพิกัด</span>
            </div>

            {/* Scrollable Incident Cards List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100">
              {filteredIncidents.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  ไม่พบเหตุการณ์ตรงตามคำค้นหา
                </div>
              ) : (
                filteredIncidents.map((item) => {
                  const isSelected = selectedIncident?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectIncident(item)}
                      className={`pt-2.5 first:pt-0 p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-50/60 border-rose-300 shadow-2xs'
                          : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              item.type === 'accident'
                                ? 'bg-rose-100 text-rose-700'
                                : item.type === 'flood_road'
                                ? 'bg-sky-100 text-sky-700'
                                : item.type === 'road_closed'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.type === 'accident'
                              ? '💥 อุบัติเหตุ'
                              : item.type === 'flood_road'
                              ? '🌊 น้ำท่วมผิวทาง'
                              : item.type === 'road_closed'
                              ? '⛔ ปิดถนน'
                              : '⚠️ เตือนภัย'}
                          </span>

                          <span className="text-[11px] text-slate-400 font-medium">
                            {item.reportedTime}
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleUpvote(item.id, e)}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 cursor-pointer"
                          title="ยืนยันว่าเหตุการณ์นี้ยังเกิดขึ้นจริง"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{item.upvotes || 0}</span>
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 mt-1.5 leading-snug">
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-700">{item.locationName}</span>
                        <span className="text-slate-400">({item.subdistrict})</span>
                      </p>

                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>

                      {/* Detour Warning Bar */}
                      {item.detourAdvice && (
                        <div className="mt-2 bg-amber-50/80 border border-amber-200/80 rounded-lg p-2 text-[11px] text-amber-900 flex items-start gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                          <div className="leading-snug">
                            <strong>เส้นทางแนะนำ:</strong> {item.detourAdvice}
                          </div>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 truncate max-w-[170px]">
                          รายงาน: {item.reporterSource}
                        </span>

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${item.coordinates.lat},${item.coordinates.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold hover:underline"
                        >
                          <span>เปิดนำทาง Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. MODAL: REPORT NEW INCIDENT */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">แจ้งเหตุอุบัติเหตุ/น้ำท่วมในวารินชำราบ</h3>
                  <p className="text-[11px] text-slate-500">รายงานข้อมูลเรียลไทม์เพื่อเตือนประชาชนหลีกเลี่ยงเส้นทาง</p>
                </div>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block font-semibold mb-1">หัวข้อเหตุการณ์ *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="เช่น รถบรรทุกเฉี่ยวชน หรือ น้ำท่วมขังฟุตบาท 30 ซม."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">ประเภทเหตุการณ์</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as IncidentType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="accident">💥 อุบัติเหตุทางถนน</option>
                    <option value="flood_road">🌊 น้ำท่วมผิวจราจร</option>
                    <option value="road_closed">⛔ ปิดการจราจร/ทางขาด</option>
                    <option value="hazard">⚠️ สิ่งกีดขวาง/เสาไฟล้ม</option>
                    <option value="news">📢 ข่าวสารแม่น้ำมูล</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">ระดับความรุนแรง</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as IncidentSeverity)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="critical">🔴 วิกฤต (รถติดหนัก/ผ่านไม่ได้)</option>
                    <option value="warning">🟡 เฝ้าระวัง (ชะลอตัว/ทางแคบ)</option>
                    <option value="info">🔵 ข้อมูลข่าวสารทั่วไป</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">จุดเกิดเหตุ / ชื่อถนน *</label>
                  <input
                    type="text"
                    required
                    value={newLocationName}
                    onChange={(e) => setNewLocationName(e.target.value)}
                    placeholder="เช่น ถนนสถลมาร์ค หน้าตลาดเจริญศรี"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">ตำบลในอำเภอวารินชำราบ</label>
                  <select
                    value={newSubdistrict}
                    onChange={(e) => setNewSubdistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="ต.วารินชำราบ">ต.วารินชำราบ</option>
                    <option value="ต.แสนสุข">ต.แสนสุข</option>
                    <option value="ต.คำน้ำแซบ">ต.คำน้ำแซบ</option>
                    <option value="ต.หนองกินเพล">ต.หนองกินเพล</option>
                    <option value="ต.เมืองศรีไค">ต.เมืองศรีไค</option>
                    <option value="ต.สระสมิง">ต.สระสมิง</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">รายละเอียดเหตุการณ์</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="สภาพการจราจร, ความเสียหาย, หรือการให้ความช่วยเหลือ"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">เส้นทางเลี่ยงแนะนำ (ถ้ามี)</label>
                <input
                  type="text"
                  value={newDetour}
                  onChange={(e) => setNewDetour(e.target.value)}
                  placeholder="เช่น แนะนำให้ใช้ถนนเลี่ยงเมือง ทล.231 แทน"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ชื่อผู้แจ้ง / หน่วยงาน</label>
                <input
                  type="text"
                  value={newReporter}
                  onChange={(e) => setNewReporter(e.target.value)}
                  placeholder="เช่น กู้ชีพสว่างบูชาธรรม หรือ พลเมืองดี"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  บันทึกและขึ้นหมุดบนแผนที่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: GOOGLE MAPS API SETUP & REFERENCE CODE */}
      {isApiSnippetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Google Maps JavaScript API Architecture</h3>
                  <p className="text-[11px] text-slate-500">ตัวอย่างโค้ดมาตรฐานสำหรับฝัง Google Maps API ที่ อ.วารินชำราบ</p>
                </div>
              </div>
              <button
                onClick={() => setIsApiSnippetModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-800 mb-1">
                  1. จุดศูนย์กลางเริ่มต้น (Default Center Coordinates)
                </div>
                <code className="text-blue-600 font-mono text-[11px]">
                  lat: 15.1950, lng: 104.8580, zoom: 13 (พื้นที่อำเภอวารินชำราบ จ.อุบลราชธานี)
                </code>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between bg-slate-800 text-slate-200 px-3 py-1.5 rounded-t-xl text-[11px] font-mono">
                  <span>warin-google-maps.html</span>
                  <button
                    onClick={copySnippet}
                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-xs"
                  >
                    {hasCopiedSnippet ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอกโค้ด</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 text-[11px] font-mono rounded-b-xl overflow-x-auto max-h-72 leading-relaxed">
                  {googleMapsCodeSnippet}
                </pre>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-blue-900 text-[11px] space-y-1">
                <div className="font-bold">เคล็ดลับการใช้งานกับ Google Maps API Key:</div>
                <p>
                  เพียงนำ API Key ที่ได้จาก Google Cloud Console มาแทนที่ <code className="bg-blue-100 px-1 rounded">YOUR_API_KEY</code> ใน URL สคริปต์ ระบบจะทำงานร่วมกับ Google Maps เต็มรูปแบบได้ทันที
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsApiSnippetModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
