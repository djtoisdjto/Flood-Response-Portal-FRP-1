import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NeedItem, Shelter, Evacuee, OfflineQueueItem, UserLocation } from '../types';
import { INITIAL_NEEDS, INITIAL_SHELTERS, INITIAL_EVACUEES } from '../data/initialData';
import { playTallyBeep, playClaimSuccessSound } from '../utils/audio';
import { updateAllDistancesUI, UBON_FALLBACK_LOCATION } from '../utils/distance';

const STORAGE_KEYS = {
  NEEDS: 'matchneed_needs_v2_ubon',
  SHELTERS: 'matchneed_shelters_v3_real_coords',
  EVACUEES: 'matchneed_evacuees_v3_ubon_922',
  QUEUE: 'matchneed_offline_queue_v2_ubon',
  LOW_BW: 'matchneed_low_bandwidth_v2_ubon',
};

interface DisasterContextType {
  needs: NeedItem[];
  shelters: Shelter[];
  evacuees: Evacuee[];
  offlineQueue: OfflineQueueItem[];
  isOnline: boolean;
  isSimulatedOffline: boolean;
  lowBandwidthMode: boolean;
  userLocation: UserLocation | null;
  selectedShelterId: string | null;
  selectedNeedId: string | null;
  toggleSimulatedOffline: () => void;
  toggleLowBandwidth: () => void;
  setUserLocation: (loc: UserLocation | null) => void;
  refreshDeviceGPS: () => void;
  setUserLocationToUbonCityHall: () => void;
  setSelectedShelterId: (id: string | null) => void;
  setSelectedNeedId: (id: string | null) => void;
  // Core Feature 1: Match-Need Actions
  claimNeed: (needId: string, donor: { name: string; phone: string; vehicleOrNote?: string; estimatedArrivalMinutes?: number }) => boolean;
  createNeed: (newNeed: Omit<NeedItem, 'id' | 'createdAt' | 'status'>) => string;
  completeNeed: (needId: string) => void;
  // Core Feature 2: Shelter Actions
  tallyShelter: (shelterId: string, delta: number) => void;
  updateShelterMax: (shelterId: string, newMax: number) => void;
  addShelter: (newShelter: Omit<Shelter, 'id' | 'lastUpdated'>) => string;
  // Evacuee Management & Global Search
  addEvacuee: (evacuee: Omit<Evacuee, 'id' | 'registeredAt'>) => string;
  removeEvacuee: (evacueeId: string) => void;
  // Synchronization
  syncOfflineQueue: () => Promise<number>;
  resetToDefaultData: () => void;
  lastSyncMessage: string | null;
}

const DisasterContext = createContext<DisasterContextType | undefined>(undefined);

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('matchneed_ubon_realtime_channel');
  }
} catch {
  // Graceful fallback
}

export const DisasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State from localStorage
  const [needs, setNeeds] = useState<NeedItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NEEDS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return INITIAL_NEEDS;
  });

  const [shelters, setShelters] = useState<Shelter[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHELTERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return INITIAL_SHELTERS;
  });

  const [evacuees, setEvacuees] = useState<Evacuee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVACUEES);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return INITIAL_EVACUEES;
  });

  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUEUE);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return [];
  });

  const [lowBandwidthMode, setLowBandwidthMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.LOW_BW) === 'true';
    } catch {
      return false;
    }
  });

  const [hardwareOnline, setHardwareOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const isOnline = hardwareOnline && !isSimulatedOffline;

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedShelterId, setSelectedShelterId] = useState<string | null>(null);
  const [selectedNeedId, setSelectedNeedId] = useState<string | null>(null);
  const [lastSyncMessage, setLastSyncMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NEEDS, JSON.stringify(needs));
    } catch {
      // Ignore
    }
  }, [needs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SHELTERS, JSON.stringify(shelters));
    } catch {
      // Ignore
    }
  }, [shelters]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVACUEES, JSON.stringify(evacuees));
    } catch {
      // Ignore
    }
  }, [evacuees]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(offlineQueue));
    } catch {
      // Ignore
    }
  }, [offlineQueue]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOW_BW, String(lowBandwidthMode));
    } catch {
      // Ignore
    }
  }, [lowBandwidthMode]);

  // Network listener
  useEffect(() => {
    const handleOnline = () => setHardwareOnline(true);
    const handleOffline = () => setHardwareOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Broadcast Channel incoming listener
  useEffect(() => {
    if (!broadcastChannel) return;
    const handleBroadcast = (event: MessageEvent) => {
      const { type, payload } = event.data || {};
      if (type === 'SYNC_ALL') {
        if (payload.needs) setNeeds(payload.needs);
        if (payload.shelters) setShelters(payload.shelters);
        if (payload.evacuees) setEvacuees(payload.evacuees);
      } else if (type === 'CLAIM_NEED') {
        setNeeds((prev) =>
          prev.map((item) => (item.id === payload.needId ? { ...item, status: 'claimed', claimedBy: payload.claimedBy } : item))
        );
      } else if (type === 'TALLY_SHELTER') {
        setShelters((prev) =>
          prev.map((s) => (s.id === payload.shelterId ? { ...s, currentOccupancy: payload.currentOccupancy, lastUpdated: payload.lastUpdated } : s))
        );
      } else if (type === 'ADD_EVACUEE') {
        setEvacuees((prev) => [payload.evacuee, ...prev]);
      }
    };

    broadcastChannel.addEventListener('message', handleBroadcast);
    return () => {
      broadcastChannel?.removeEventListener('message', handleBroadcast);
    };
  }, []);

  const setUserLocationToUbonCityHall = useCallback(() => {
    setUserLocation({
      lat: UBON_FALLBACK_LOCATION.lat,
      lng: UBON_FALLBACK_LOCATION.lng,
      isFallback: true,
      locationLabel: UBON_FALLBACK_LOCATION.name,
    });
    updateAllDistancesUI(UBON_FALLBACK_LOCATION.lat, UBON_FALLBACK_LOCATION.lng);
  }, []);

  const refreshDeviceGPS = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            isFallback: false,
            locationLabel: 'พิกัด GPS อุปกรณ์จริง',
          });
          updateAllDistancesUI(pos.coords.latitude, pos.coords.longitude);
        },
        (error) => {
          console.warn('[DisasterGPS] ใช้พิกัดสำรองศาลากลาง จ.อุบลราชธานี:', error?.message);
          setUserLocationToUbonCityHall();
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setUserLocationToUbonCityHall();
    }
  }, [setUserLocationToUbonCityHall]);

  // Auto geolocate user on load (Defaulting to Ubon Ratchathani City Hall fallback [15.2425, 104.8472])
  useEffect(() => {
    refreshDeviceGPS();
  }, [refreshDeviceGPS]);

  // Sync offline queue when coming back online
  const syncOfflineQueue = useCallback(async (): Promise<number> => {
    if (offlineQueue.length === 0) return 0;
    const count = offlineQueue.length;

    setOfflineQueue([]);
    setLastSyncMessage(`ซิงค์ข้อมูลสำเร็จ ${count} รายการ (ระบบออนไลน์แล้ว)`);
    setTimeout(() => setLastSyncMessage(null), 5000);

    try {
      broadcastChannel?.postMessage({
        type: 'SYNC_ALL',
        payload: { needs, shelters, evacuees },
      });
    } catch {
      // Ignore
    }

    return count;
  }, [offlineQueue, needs, shelters, evacuees]);

  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      syncOfflineQueue();
    }
  }, [isOnline, offlineQueue.length, syncOfflineQueue]);

  // Feature 1: Claim a Need ("รับจบ (Claim)")
  const claimNeed = useCallback(
    (needId: string, donor: { name: string; phone: string; vehicleOrNote?: string; estimatedArrivalMinutes?: number }) => {
      const targetNeed = needs.find((n) => n.id === needId);
      if (!targetNeed) return false;
      if (targetNeed.status !== 'pending') return false;

      const claimData = {
        name: donor.name,
        phone: donor.phone,
        vehicleOrNote: donor.vehicleOrNote || '',
        estimatedArrivalMinutes: donor.estimatedArrivalMinutes || 30,
        claimedAt: new Date().toISOString(),
      };

      setNeeds((prev) =>
        prev.map((item) =>
          item.id === needId
            ? {
                ...item,
                status: 'claimed',
                claimedBy: claimData,
              }
            : item
        )
      );

      playClaimSuccessSound();

      if (!isOnline) {
        setOfflineQueue((prev) => [
          ...prev,
          {
            id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            action: 'CLAIM_NEED',
            payload: { needId, claimData },
            timestamp: Date.now(),
          },
        ]);
      } else {
        try {
          broadcastChannel?.postMessage({
            type: 'CLAIM_NEED',
            payload: { needId, claimedBy: claimData },
          });
        } catch {
          // Ignore
        }
      }

      return true;
    },
    [needs, isOnline]
  );

  // Create a new Need ("ผู้ขอความช่วยเหลือ")
  const createNeed = useCallback(
    (newNeed: Omit<NeedItem, 'id' | 'createdAt' | 'status'>) => {
      const id = `need-${Date.now()}`;
      const item: NeedItem = {
        ...newNeed,
        id,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      setNeeds((prev) => [item, ...prev]);

      if (!isOnline) {
        setOfflineQueue((prev) => [
          ...prev,
          {
            id: `q-${Date.now()}`,
            action: 'CREATE_NEED',
            payload: item,
            timestamp: Date.now(),
          },
        ]);
      } else {
        try {
          broadcastChannel?.postMessage({
            type: 'SYNC_ALL',
            payload: { needs: [item, ...needs], shelters, evacuees },
          });
        } catch {
          // Ignore
        }
      }

      return id;
    },
    [needs, shelters, evacuees, isOnline]
  );

  // Complete a need
  const completeNeed = useCallback(
    (needId: string) => {
      setNeeds((prev) =>
        prev.map((item) => (item.id === needId ? { ...item, status: 'completed' } : item))
      );
      if (!isOnline) {
        setOfflineQueue((prev) => [
          ...prev,
          {
            id: `q-${Date.now()}`,
            action: 'COMPLETE_NEED',
            payload: { needId },
            timestamp: Date.now(),
          },
        ]);
      }
    },
    [isOnline]
  );

  // Feature 2: Quick Tally UI for Shelter Capacity (+1 / -1)
  const tallyShelter = useCallback(
    (shelterId: string, delta: number) => {
      let updatedOccupancy = 0;
      const lastUpdatedStr = new Date().toISOString();

      setShelters((prev) =>
        prev.map((s) => {
          if (s.id === shelterId) {
            const nextVal = Math.max(0, s.currentOccupancy + delta);
            updatedOccupancy = nextVal;
            return {
              ...s,
              currentOccupancy: nextVal,
              lastUpdated: lastUpdatedStr,
            };
          }
          return s;
        })
      );

      playTallyBeep(delta > 0);

      if (!isOnline) {
        setOfflineQueue((prev) => [
          ...prev,
          {
            id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            action: 'TALLY_SHELTER',
            payload: { shelterId, delta },
            timestamp: Date.now(),
          },
        ]);
      } else {
        try {
          broadcastChannel?.postMessage({
            type: 'TALLY_SHELTER',
            payload: { shelterId, currentOccupancy: updatedOccupancy, lastUpdated: lastUpdatedStr },
          });
        } catch {
          // Ignore
        }
      }
    },
    [isOnline]
  );

  const updateShelterMax = useCallback(
    (shelterId: string, newMax: number) => {
      setShelters((prev) =>
        prev.map((s) => (s.id === shelterId ? { ...s, maxCapacity: Math.max(1, newMax), lastUpdated: new Date().toISOString() } : s))
      );
      if (!isOnline) {
        setOfflineQueue((prev) => [
          ...prev,
          {
            id: `q-${Date.now()}`,
            action: 'UPDATE_SHELTER_MAX',
            payload: { shelterId, newMax },
            timestamp: Date.now(),
          },
        ]);
      }
    },
    [isOnline]
  );

  const addShelter = useCallback(
    (newShelter: Omit<Shelter, 'id' | 'lastUpdated'>) => {
      const id = `shelter-${Date.now()}`;
      const item: Shelter = {
        ...newShelter,
        id,
        lastUpdated: new Date().toISOString(),
      };
      setShelters((prev) => [...prev, item]);
      return id;
    },
    []
  );

  // Evacuee registration & management
  const addEvacuee = useCallback(
    (evacueeData: Omit<Evacuee, 'id' | 'registeredAt'>) => {
      const id = `ev-${Date.now()}`;
      const shelterObj = shelters.find((s) => s.id === evacueeData.shelterId);
      const newEvacuee: Evacuee = {
        ...evacueeData,
        id,
        shelterName: shelterObj ? shelterObj.name : evacueeData.shelterName || 'ศูนย์พักพิงในอุบลฯ',
        registeredAt: new Date().toISOString(),
      };

      setEvacuees((prev) => [newEvacuee, ...prev]);

      // Also increment shelter occupancy
      tallyShelter(evacueeData.shelterId, 1);

      if (!isOnline) {
        setOfflineQueue((prev) => [
          ...prev,
          {
            id: `q-${Date.now()}`,
            action: 'REGISTER_EVACUEE',
            payload: newEvacuee,
            timestamp: Date.now(),
          },
        ]);
      } else {
        try {
          broadcastChannel?.postMessage({
            type: 'ADD_EVACUEE',
            payload: { evacuee: newEvacuee },
          });
        } catch {
          // Ignore
        }
      }

      return id;
    },
    [shelters, tallyShelter, isOnline]
  );

  const removeEvacuee = useCallback((evacueeId: string) => {
    setEvacuees((prev) => prev.filter((e) => e.id !== evacueeId));
  }, []);

  const resetToDefaultData = useCallback(() => {
    setNeeds(INITIAL_NEEDS);
    setShelters(INITIAL_SHELTERS);
    setEvacuees(INITIAL_EVACUEES);
    setOfflineQueue([]);
    localStorage.removeItem(STORAGE_KEYS.NEEDS);
    localStorage.removeItem(STORAGE_KEYS.SHELTERS);
    localStorage.removeItem(STORAGE_KEYS.EVACUEES);
    localStorage.removeItem(STORAGE_KEYS.QUEUE);
  }, []);

  const toggleSimulatedOffline = useCallback(() => {
    setIsSimulatedOffline((prev) => !prev);
  }, []);

  const toggleLowBandwidth = useCallback(() => {
    setLowBandwidthMode((prev) => !prev);
  }, []);

  return (
    <DisasterContext.Provider
      value={{
        needs,
        shelters,
        evacuees,
        offlineQueue,
        isOnline,
        isSimulatedOffline,
        lowBandwidthMode,
        userLocation,
        selectedShelterId,
        selectedNeedId,
        toggleSimulatedOffline,
        toggleLowBandwidth,
        setUserLocation,
        refreshDeviceGPS,
        setUserLocationToUbonCityHall,
        setSelectedShelterId,
        setSelectedNeedId,
        claimNeed,
        createNeed,
        completeNeed,
        tallyShelter,
        updateShelterMax,
        addShelter,
        addEvacuee,
        removeEvacuee,
        syncOfflineQueue,
        resetToDefaultData,
        lastSyncMessage,
      }}
    >
      {children}
    </DisasterContext.Provider>
  );
};

export const useDisaster = () => {
  const context = useContext(DisasterContext);
  if (!context) {
    throw new Error('useDisaster must be used within a DisasterProvider');
  }
  return context;
};
