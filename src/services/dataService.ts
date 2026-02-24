import { PrayerTime, DetailedPrayerTime } from "@/types";
import { getCurrentTime24h, isTimeBefore } from "@/utils/dateUtils";
import { supabase } from "@/integrations/supabase/client";

// This would be replaced with an actual API call to Supabase or Firebase
const PRAYER_TIMES_KEY = 'mosque-prayer-times';

// Default prayer times (example)
const defaultPrayerTimes: PrayerTime[] = [
  { id: '1', name: 'Fajr', time: '05:30' },
  { id: '2', name: 'Dhuhr', time: '12:30' },
  { id: '3', name: 'Asr', time: '15:45' },
  { id: '4', name: 'Maghrib', time: '18:15' },
  { id: '5', name: 'Isha', time: '19:45' }
];

// Helper function to mark the active prayer time based on current time with updated rules
const markActivePrayer = (prayerTimes: PrayerTime[], detailedTimes?: DetailedPrayerTime, mosque: string = 'dundee_central'): PrayerTime[] => {
  const currentTime = getCurrentTime24h();
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  console.log(`Current time: ${currentTime}`);

  // Reset all to inactive
  const updatedTimes = prayerTimes.map(prayer => ({
    ...prayer,
    isActive: false,
    isNext: false
  }));

  // Find indices for each prayer time
  const fajrIndex = updatedTimes.findIndex(p => p.name === 'Fajr');
  const sunriseIndex = updatedTimes.findIndex(p => p.name === 'Sunrise');
  const dhuhrIndex = updatedTimes.findIndex(p => p.name === 'Dhuhr' || p.name === 'Zuhr');
  const asrIndex = updatedTimes.findIndex(p => p.name === 'Asr');
  const maghribIndex = updatedTimes.findIndex(p => p.name === 'Maghrib');
  const ishaIndex = updatedTimes.findIndex(p => p.name === 'Isha');

  // Get START times for prayers (critical for determining active status)
  const fajrStartTime = detailedTimes?.sehri_end || (fajrIndex !== -1 ? updatedTimes[fajrIndex].time : '');
  const sunriseTime = detailedTimes?.sunrise || (sunriseIndex !== -1 ? updatedTimes[sunriseIndex].time : '');
  const dhuhrStartTime = detailedTimes?.zuhr_start || (dhuhrIndex !== -1 ? updatedTimes[dhuhrIndex].time : '');

  // Rule: For Dundee Central Mosque, Asr starts at Mithal 1 (if available)
  // For other mosques, it starts at Asr Start (Mithal 2)
  let asrStartTime = detailedTimes?.asr_start || (asrIndex !== -1 ? updatedTimes[asrIndex].time : '');

  if (mosque === 'dundee_central' && detailedTimes?.asr_mithal_1) {
    asrStartTime = detailedTimes.asr_mithal_1;
    console.log(`Using Mithal 1 (${asrStartTime}) for Asr start time (Dundee Central)`);
  }

  const maghribStartTime = detailedTimes?.maghrib_iftar || (maghribIndex !== -1 ? updatedTimes[maghribIndex].time : '');
  const ishaStartTime = detailedTimes?.isha_start || (ishaIndex !== -1 ? updatedTimes[ishaIndex].time : '');

  console.log(`Prayer start times - Fajr: ${fajrStartTime}, Dhuhr: ${dhuhrStartTime}, Asr: ${asrStartTime}, Maghrib: ${maghribStartTime}, Isha: ${ishaStartTime}`);

  // IMPORTANT: We're explicitly using START times for determining active prayers

  // Rule 1: Fajr is active from its start until Sunrise
  if (fajrIndex !== -1 &&
    !isTimeBefore(currentTime, fajrStartTime) &&
    isTimeBefore(currentTime, sunriseTime)) {
    updatedTimes[fajrIndex].isActive = true;
    console.log("Fajr is active");
  }

  // Rule 2: Dhuhr is active from its start until Asr starts
  if (dhuhrIndex !== -1 &&
    !isTimeBefore(currentTime, dhuhrStartTime) &&
    isTimeBefore(currentTime, asrStartTime)) {
    updatedTimes[dhuhrIndex].isActive = true;
    console.log("Dhuhr is active");
  }

  // Rule 3: Asr is active from its start until Maghrib starts
  if (asrIndex !== -1 &&
    !isTimeBefore(currentTime, asrStartTime) &&
    isTimeBefore(currentTime, maghribStartTime)) {
    updatedTimes[asrIndex].isActive = true;
    console.log("Asr is active");
  }

  // Rule 4: MODIFIED - Maghrib is active from its start until Isha starts
  if (maghribIndex !== -1 &&
    !isTimeBefore(currentTime, maghribStartTime) &&
    isTimeBefore(currentTime, ishaStartTime)) {
    updatedTimes[maghribIndex].isActive = true;
    console.log("Maghrib is active");
  }

  // Rule 5: Isha is active from its start until midnight
  if (ishaIndex !== -1 && !isTimeBefore(currentTime, ishaStartTime)) {
    // If it's after Isha time and before midnight
    updatedTimes[ishaIndex].isActive = true;
    console.log("Isha is active (evening)");
  }
  // We no longer highlight Isha after midnight per user request

  // Determine next prayer - also using START times
  let nextPrayerFound = false;

  // Create an array of prayers in chronological order for the day
  const orderedPrayers = [
    { index: fajrIndex, time: fajrStartTime, name: 'Fajr' },
    { index: dhuhrIndex, time: dhuhrStartTime, name: 'Dhuhr/Zuhr' },
    { index: asrIndex, time: asrStartTime, name: 'Asr' },
    { index: maghribIndex, time: maghribStartTime, name: 'Maghrib' },
    { index: ishaIndex, time: ishaStartTime, name: 'Isha' }
  ].filter(p => p.index !== -1 && p.time !== '');

  // Find the next prayer that hasn't started yet
  for (const prayer of orderedPrayers) {
    if (isTimeBefore(currentTime, prayer.time)) {
      updatedTimes[prayer.index].isNext = true;
      nextPrayerFound = true;
      console.log(`Next prayer will be ${prayer.name} at ${prayer.time} (current time: ${currentTime})`);
      break;
    }
  }

  // If no next prayer found and it's after Isha, next prayer is Fajr tomorrow
  if (!nextPrayerFound && fajrIndex !== -1) {
    updatedTimes[fajrIndex].isNext = true;
    console.log(`Next prayer will be Fajr tomorrow at ${fajrStartTime} (current time: ${currentTime})`);
  }

  return updatedTimes;
};

export const fetchPrayerTimes = async (mosque: string = 'dundee_central'): Promise<PrayerTime[]> => {
  try {
    // Try to get today's prayer times from Supabase
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const { data, error } = await supabase
      .from('prayer_times')
      .select('*')
      .eq('date', today)
      .eq('mosque', mosque);

    // Check if we have data for today
    if (error || !data || data.length === 0) {
      console.log('Falling back to localStorage', error);

      // Try to get from local fallback storage
      const localTimes = localStorage.getItem('local-prayer-times');
      if (localTimes) {
        const parsedTimes = JSON.parse(localTimes);
        // Find today's entry from local storage for this mosque
        const todayEntry = parsedTimes.find((entry: any) => entry.date === today && entry.mosque === mosque);
        if (todayEntry) {
          console.log("Using locally stored prayer time for today:", todayEntry);
          return markActivePrayer(mapToDisplayFormat(todayEntry), todayEntry, mosque);
        }
      }

      // Fall back to localStorage if no data found for today
      const saved = localStorage.getItem(PRAYER_TIMES_KEY);
      const prayerTimes = saved ? JSON.parse(saved) : defaultPrayerTimes;
      return markActivePrayer(prayerTimes, undefined, mosque);
    }

    // Map Supabase data to PrayerTime format
    console.log("Fetched prayer times from database");
    const formattedTimes = mapToDisplayFormat(data[0]);
    return markActivePrayer(formattedTimes, data[0] as DetailedPrayerTime, mosque);
  } catch (error) {
    console.error('Error fetching prayer times:', error);

    // Try to get data from local storage as fallback
    const storedTimes = localStorage.getItem('local-prayer-times');
    if (storedTimes) {
      const allStored = JSON.parse(storedTimes);
      const mosqueFiltered = allStored.filter((entry: any) => entry.mosque === mosque);
      if (mosqueFiltered.length > 0) {
        console.log("Using cached prayer times from local storage");
        const today = new Date().toISOString().split('T')[0];
        const todayEntry = mosqueFiltered.find((entry: any) => entry.date === today);
        if (todayEntry) {
          return markActivePrayer(mapToDisplayFormat(todayEntry), todayEntry, mosque);
        }
      }
    }

    throw error;
  }
};

// Helper function to map detailed prayer time to display format
const mapToDisplayFormat = (data: DetailedPrayerTime): PrayerTime[] => {
  // CRITICAL FIX: Use START times rather than Jamat times
  return [
    { id: '1', name: 'Fajr', time: data.sehri_end?.slice(0, 5) || data.fajr_jamat.slice(0, 5) },
    { id: '2', name: 'Sunrise', time: data.sunrise.slice(0, 5) },
    { id: '3', name: 'Zuhr', time: data.zuhr_start?.slice(0, 5) || data.zuhr_jamat.slice(0, 5) },
    { id: '4', name: 'Asr', time: data.asr_start?.slice(0, 5) || data.asr_jamat.slice(0, 5) },
    { id: '5', name: 'Maghrib', time: data.maghrib_iftar.slice(0, 5) },
    { id: '6', name: 'Isha', time: data.isha_start?.slice(0, 5) || data.isha_first_jamat.slice(0, 5) }
  ];
};

export const updatePrayerTimes = (prayerTimes: PrayerTime[]): void => {
  try {
    localStorage.setItem(PRAYER_TIMES_KEY, JSON.stringify(prayerTimes));
  } catch (error) {
    console.error('Error updating prayer times:', error);
  }
};

// Functions for the detailed prayer times table
export const fetchAllPrayerTimes = async (mosque: string = 'dundee_central'): Promise<DetailedPrayerTime[]> => {
  try {
    // First try to fetch from Supabase
    const { data, error } = await supabase
      .from('prayer_times')
      .select('*')
      .eq('mosque', mosque)
      .order('date', { ascending: true });

    let prayerTimes: DetailedPrayerTime[] = [];

    if (error || !data || data.length === 0) {
      console.error('Error or no data from Supabase:', error);
    } else {
      prayerTimes = data as DetailedPrayerTime[];
    }

    // Also check local storage for any offline entries
    const localTimes = localStorage.getItem('local-prayer-times');
    if (localTimes) {
      const parsedLocalTimes = JSON.parse(localTimes) as DetailedPrayerTime[];
      // Merge with any data from Supabase, removing duplicates based on date
      // Only include local entries that match the selected mosque
      const existingDates = new Set(prayerTimes.map(entry => entry.date));

      for (const localEntry of parsedLocalTimes) {
        if (localEntry.mosque === mosque && !existingDates.has(localEntry.date)) {
          prayerTimes.push(localEntry);
          existingDates.add(localEntry.date);
        }
      }
    }

    // Sort by date
    return prayerTimes.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  } catch (error) {
    console.error('Error fetching all prayer times:', error);

    // Fallback to local storage completely (filtered by mosque)
    const localTimes = localStorage.getItem('local-prayer-times');
    if (localTimes) {
      const allLocal = JSON.parse(localTimes) as DetailedPrayerTime[];
      return allLocal.filter(entry => entry.mosque === mosque);
    }

    return [];
  }
};

export const addPrayerTimeEntry = async (entry: Omit<DetailedPrayerTime, 'id' | 'created_at'>): Promise<DetailedPrayerTime | null> => {
  try {
    console.log("Adding prayer time entry:", entry);

    // Always try to add to Supabase first
    const { data, error } = await supabase
      .from('prayer_times')
      .insert(entry)
      .select()
      .single();

    if (error) {
      console.error("Supabase error adding prayer time:", error);
      throw error; // Re-throw to handle in the catch block
    }

    console.log("Successfully added prayer time entry to Supabase:", data);

    // Always store in local storage as well for redundancy
    const savedTimes = localStorage.getItem('local-prayer-times');
    const localTimes = savedTimes ? JSON.parse(savedTimes) : [];

    // Remove any existing entry for this date AND mosque (to avoid duplicates)
    const filteredTimes = localTimes.filter((item: DetailedPrayerTime) =>
      !(item.date === entry.date && item.mosque === entry.mosque)
    );

    // Add the new entry
    filteredTimes.push(data);
    localStorage.setItem('local-prayer-times', JSON.stringify(filteredTimes));

    // Trigger a storage event so other tabs/components know to refresh
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'local-prayer-times'
    }));

    return data as DetailedPrayerTime;
  } catch (error) {
    console.error('Error in addPrayerTimeEntry:', error);

    // Create a fallback entry with a temporary ID
    const fallbackEntry: DetailedPrayerTime = {
      id: `temp-${Date.now()}`,
      date: entry.date,
      day: entry.day,
      mosque: entry.mosque || 'dundee_central',
      sehri_end: entry.sehri_end || '',
      fajr_jamat: entry.fajr_jamat || '',
      sunrise: entry.sunrise || '',
      zuhr_start: entry.zuhr_start || '',
      zuhr_jamat: entry.zuhr_jamat || '',
      asr_start: entry.asr_start || '',
      asr_mithal_1: entry.asr_mithal_1 || '',
      asr_jamat: entry.asr_jamat || '',
      maghrib_iftar: entry.maghrib_iftar || '',
      isha_start: entry.isha_start || '',
      isha_first_jamat: entry.isha_first_jamat || '',
      isha_second_jamat: entry.isha_second_jamat || ''
    };

    // Save to local storage as backup
    const savedTimes = localStorage.getItem('local-prayer-times');
    const localTimes = savedTimes ? JSON.parse(savedTimes) : [];

    // Remove any existing entry for this date (to avoid duplicates)
    const filteredTimes = localTimes.filter((item: DetailedPrayerTime) =>
      item.date !== entry.date
    );

    filteredTimes.push(fallbackEntry);
    localStorage.setItem('local-prayer-times', JSON.stringify(filteredTimes));

    // Trigger a storage event so other tabs/components know to refresh
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'local-prayer-times'
    }));

    return fallbackEntry;
  }
};

export const updatePrayerTimeEntry = async (id: string, entry: Partial<DetailedPrayerTime>): Promise<DetailedPrayerTime | null> => {
  try {
    console.log("Updating prayer time entry:", id, entry);
    let updatedEntry: DetailedPrayerTime | null = null;

    // Check if this is a temporary ID (for locally stored entries)
    if (id.startsWith('temp-')) {
      // Get the full entry from local storage
      const savedTimes = localStorage.getItem('local-prayer-times');
      if (savedTimes) {
        const localTimes = JSON.parse(savedTimes);
        const existingEntry = localTimes.find((item: DetailedPrayerTime) => item.id === id);

        if (existingEntry) {
          // Try to migrate this temp entry to Supabase
          try {
            const fullEntry = { ...existingEntry, ...entry };
            delete fullEntry.id; // Remove temp id for insertion

            // Try to add to Supabase
            const { data: supabaseData, error: supabaseError } = await supabase
              .from('prayer_times')
              .insert(fullEntry)
              .select()
              .single();

            if (!supabaseError && supabaseData) {
              // Successfully migrated to Supabase
              console.log("Migrated temp entry to Supabase:", supabaseData);

              // Update local storage - remove temp entry
              const updatedTimes = localTimes.filter((item: DetailedPrayerTime) =>
                item.id !== id
              );
              // Add the new permanent entry
              updatedTimes.push(supabaseData);
              localStorage.setItem('local-prayer-times', JSON.stringify(updatedTimes));

              updatedEntry = supabaseData as DetailedPrayerTime;
            } else {
              // Failed to migrate, just update the temp entry
              console.error("Failed to migrate temp entry to Supabase:", supabaseError);
              const updatedTimes = localTimes.map((item: DetailedPrayerTime) =>
                item.id === id ? { ...item, ...entry } : item
              );
              localStorage.setItem('local-prayer-times', JSON.stringify(updatedTimes));

              updatedEntry = updatedTimes.find((item: DetailedPrayerTime) => item.id === id) || null;
            }
          } catch (migrationError) {
            console.error("Error migrating temp entry:", migrationError);
            // Just update locally
            const updatedTimes = localTimes.map((item: DetailedPrayerTime) =>
              item.id === id ? { ...item, ...entry } : item
            );
            localStorage.setItem('local-prayer-times', JSON.stringify(updatedTimes));

            updatedEntry = updatedTimes.find((item: DetailedPrayerTime) => item.id === id) || null;
          }
        }
      }
    } else {
      // Update in Supabase
      console.log("Updating in Supabase:", id, entry);
      const { data, error } = await supabase
        .from('prayer_times')
        .update(entry)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Supabase error updating prayer time:", error);
        throw error;
      }

      console.log("Supabase update result:", data);

      // Also update local storage copy for redundancy
      const savedTimes = localStorage.getItem('local-prayer-times');
      if (savedTimes) {
        const localTimes = JSON.parse(savedTimes);
        // Find and update or add
        let found = false;
        const updatedTimes = localTimes.map((item: DetailedPrayerTime) => {
          if (item.id === id) {
            found = true;
            return { ...item, ...entry };
          }
          return item;
        });

        if (!found) {
          updatedTimes.push(data);
        }

        localStorage.setItem('local-prayer-times', JSON.stringify(updatedTimes));
      }

      updatedEntry = data as DetailedPrayerTime;
    }

    // Trigger a storage event so other tabs/components know to refresh
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'local-prayer-times'
    }));

    return updatedEntry;
  } catch (error) {
    console.error('Error updating prayer time entry:', error);
    return null;
  }
};

export const deletePrayerTimeEntry = async (id: string): Promise<boolean> => {
  try {
    // Check if this is a temporary ID (for locally stored entries)
    if (id.startsWith('temp-')) {
      // Delete from local storage
      const savedTimes = localStorage.getItem('local-prayer-times');
      if (savedTimes) {
        const localTimes = JSON.parse(savedTimes);
        const filteredTimes = localTimes.filter((item: DetailedPrayerTime) => item.id !== id);
        localStorage.setItem('local-prayer-times', JSON.stringify(filteredTimes));
      }

      // Trigger a storage event so other tabs/components know to refresh
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'local-prayer-times'
      }));

      return true;
    }

    // Delete from Supabase
    const { error } = await supabase
      .from('prayer_times')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Supabase error deleting prayer time:", error);
      throw error;
    }

    // Also delete from local storage if it exists there
    const savedTimes = localStorage.getItem('local-prayer-times');
    if (savedTimes) {
      const localTimes = JSON.parse(savedTimes);
      const filteredTimes = localTimes.filter((item: DetailedPrayerTime) => item.id !== id);
      localStorage.setItem('local-prayer-times', JSON.stringify(filteredTimes));
    }

    // Trigger a storage event so other tabs/components know to refresh
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'local-prayer-times'
    }));

    return true;
  } catch (error) {
    console.error('Error deleting prayer time entry:', error);
    return false;
  }
};

// New function to delete all prayer times from database and local storage
export const deleteAllPrayerTimes = async (mosque: string = 'dundee_central'): Promise<boolean> => {
  try {
    console.log(`Starting to delete all prayer times for mosque: ${mosque}...`);

    // First clear local storage
    localStorage.removeItem('local-prayer-times');
    localStorage.removeItem(PRAYER_TIMES_KEY);

    // Delete all data from Supabase prayer_times table for this mosque
    const { error } = await supabase
      .from('prayer_times')
      .delete()
      .eq('mosque', mosque);

    if (error) {
      console.error("Supabase error deleting all prayer times:", error);
      throw error;
    }

    // Trigger a storage event so other tabs/components know to refresh
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'local-prayer-times'
    }));

    console.log("Successfully deleted all prayer times");
    return true;
  } catch (error) {
    console.error('Error deleting all prayer times:', error);
    return false;
  }
};

// Function to find and delete duplicate prayer time entries (same date)
export const deleteDuplicatePrayerTimes = async (): Promise<{
  success: boolean;
  duplicatesRemoved: number;
  error?: string;
}> => {
  try {
    console.log("Starting duplicate prayer times cleanup...");

    // Fetch all prayer times from Supabase
    const { data, error } = await supabase
      .from('prayer_times')
      .select('*')
      .order('created_at', { ascending: false }); // Newest first so we keep the latest

    if (error) {
      console.error("Error fetching prayer times for duplicate check:", error);
      return { success: false, duplicatesRemoved: 0, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: true, duplicatesRemoved: 0 };
    }

    // Group entries by date
    const dateGroups: { [date: string]: any[] } = {};
    data.forEach((entry: any) => {
      if (!dateGroups[entry.date]) {
        dateGroups[entry.date] = [];
      }
      dateGroups[entry.date].push(entry);
    });

    // Find duplicates (dates with more than one entry)
    const idsToDelete: string[] = [];

    for (const [date, entries] of Object.entries(dateGroups)) {
      if (entries.length > 1) {
        console.log(`Found ${entries.length} entries for date ${date}, keeping newest`);
        // Keep the first one (newest due to ordering) and mark the rest for deletion
        for (let i = 1; i < entries.length; i++) {
          idsToDelete.push(entries[i].id);
        }
      }
    }

    if (idsToDelete.length === 0) {
      console.log("No duplicate prayer times found");
      return { success: true, duplicatesRemoved: 0 };
    }

    console.log(`Found ${idsToDelete.length} duplicate entries to delete`);

    // Delete duplicates from Supabase
    const { error: deleteError } = await supabase
      .from('prayer_times')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      console.error("Error deleting duplicates from Supabase:", deleteError);
      return { success: false, duplicatesRemoved: 0, error: deleteError.message };
    }

    // Also clean up local storage duplicates
    const localTimes = localStorage.getItem('local-prayer-times');
    if (localTimes) {
      const parsedLocal = JSON.parse(localTimes);
      const seenDates = new Set<string>();
      const dedupedLocal = parsedLocal.filter((entry: any) => {
        if (seenDates.has(entry.date)) {
          return false; // Duplicate, remove it
        }
        seenDates.add(entry.date);
        return true;
      });

      if (dedupedLocal.length !== parsedLocal.length) {
        localStorage.setItem('local-prayer-times', JSON.stringify(dedupedLocal));
        console.log(`Removed ${parsedLocal.length - dedupedLocal.length} duplicates from local storage`);
      }
    }

    // Trigger a storage event so other tabs/components know to refresh
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'local-prayer-times'
    }));

    console.log(`Successfully deleted ${idsToDelete.length} duplicate prayer times`);
    return { success: true, duplicatesRemoved: idsToDelete.length };
  } catch (error) {
    console.error('Error cleaning up duplicate prayer times:', error);
    return {
      success: false,
      duplicatesRemoved: 0,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

// Helper functions for Google Sheets import
const parseCSV = (text: string): string[][] => {
  const lines = text.split('\n');
  return lines.map(line => {
    // Handle quoted values with commas inside them
    const values: string[] = [];
    let inQuote = false;
    let currentValue = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }

    // Add the last value
    values.push(currentValue);
    return values;
  });
};

// Helper to process rows and columns from CSV data to create prayer time entries
const processCSVData = (csvData: string[][], mosque: string = 'dundee_central'): Omit<DetailedPrayerTime, 'id' | 'created_at'>[] => {
  if (csvData.length < 2) return [];

  // Read headers from first row and normalize them
  const rawHeaders = csvData[0].map(h => h.trim().toLowerCase().replace(/[\s\-]+/g, '_'));

  // Map common header variations to our DB column names
  const headerMap: Record<string, string> = {
    'date': 'date',
    'day': 'day',
    'fajr_start': 'sehri_end',
    'sehri_end': 'sehri_end',
    'sehri': 'sehri_end',
    'fajr_jamat': 'fajr_jamat',
    'fajr_jamaat': 'fajr_jamat',
    'sunrise': 'sunrise',
    'zuhr_start': 'zuhr_start',
    'dhuhr_start': 'zuhr_start',
    'zuhr_jamat': 'zuhr_jamat',
    'zuhr_jamaat': 'zuhr_jamat',
    'dhuhr_jamat': 'zuhr_jamat',
    'asr_start': 'asr_start',
    'asr_mithal_1': 'asr_mithal_1',
    'asr_mithal1': 'asr_mithal_1',
    'mithal_1': 'asr_mithal_1',
    'asr_jamat': 'asr_jamat',
    'asr_jamaat': 'asr_jamat',
    'maghrib_iftar': 'maghrib_iftar',
    'maghrib_start': 'maghrib_iftar',
    'maghrib': 'maghrib_iftar',
    'isha_start': 'isha_start',
    'isha_first_jamat': 'isha_first_jamat',
    'isha_jamat': 'isha_first_jamat',
    'isha_jamaat': 'isha_first_jamat',
    'isha_second_jamat': 'isha_second_jamat',
    'isha_second_jamaat': 'isha_second_jamat',
  };

  // Build column index -> DB field mapping
  const columnMapping: { index: number; field: string }[] = [];
  rawHeaders.forEach((header, index) => {
    const field = headerMap[header];
    if (field) {
      columnMapping.push({ index, field });
    } else {
      console.warn(`Unknown CSV header: "${header}" at column ${index}, skipping`);
    }
  });

  console.log("CSV column mapping:", columnMapping.map(m => `${m.index}:${m.field}`));

  // Process data rows (skip header)
  const dataRows = csvData.slice(1);

  return dataRows.map(row => {
    const entry: any = { mosque };
    for (const { index, field } of columnMapping) {
      entry[field] = row[index]?.trim() || '';
    }
    // Ensure required fields have defaults
    return {
      date: entry.date || '',
      day: entry.day || '',
      mosque,
      sehri_end: entry.sehri_end || '',
      fajr_jamat: entry.fajr_jamat || '',
      sunrise: entry.sunrise || '',
      zuhr_start: entry.zuhr_start || '',
      zuhr_jamat: entry.zuhr_jamat || '',
      asr_start: entry.asr_start || '',
      asr_mithal_1: entry.asr_mithal_1 || '',
      asr_jamat: entry.asr_jamat || '',
      maghrib_iftar: entry.maghrib_iftar || '',
      isha_start: entry.isha_start || '',
      isha_first_jamat: entry.isha_first_jamat || '',
      isha_second_jamat: entry.isha_second_jamat || ''
    };
  });
};

// Function to import prayer times from CSV file
export const importFromCSV = async (csvText: string, mosque: string = 'dundee_central'): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> => {
  try {
    const parsed = parseCSV(csvText);
    console.log("Parsed CSV data:", parsed);

    if (parsed.length < 2) {
      return {
        success: false,
        count: 0,
        error: "CSV file contains insufficient data"
      };
    }

    const prayerTimes = processCSVData(parsed, mosque);
    console.log("Processed prayer times:", prayerTimes);

    // --- Duplicate check: gather all existing dates ---
    const existingDates = new Set<string>();

    // Check Supabase for existing dates
    try {
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('prayer_times')
        .select('date')
        .eq('mosque', mosque);

      if (!supabaseError && supabaseData) {
        supabaseData.forEach((row: any) => existingDates.add(row.date));
      }
    } catch (err) {
      console.error("Error fetching existing dates from Supabase:", err);
    }

    // Also check local storage for existing dates (filtered by mosque)
    const localTimes = localStorage.getItem('local-prayer-times');
    if (localTimes) {
      const parsedLocal = JSON.parse(localTimes);
      parsedLocal.forEach((entry: any) => {
        if (entry.date && entry.mosque === mosque) existingDates.add(entry.date);
      });
    }

    console.log(`Found ${existingDates.size} existing dates in database/local storage`);

    // Try to add all entries to the database
    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    for (const entry of prayerTimes) {
      try {
        // Skip entries with missing required data
        if (!entry.date || !entry.day) {
          failCount++;
          continue;
        }

        // Skip if this date already exists
        if (existingDates.has(entry.date)) {
          console.log(`Skipping duplicate entry for date: ${entry.date}`);
          skippedCount++;
          continue;
        }

        await addPrayerTimeEntry(entry);
        existingDates.add(entry.date); // Track newly added dates to avoid duplicates within the same import
        successCount++;
      } catch (error) {
        console.error(`Failed to add entry for date ${entry.date}:`, error);
        failCount++;
      }
    }

    console.log(`Import completed: ${successCount} added, ${skippedCount} skipped (duplicates), ${failCount} failed`);

    if (successCount === 0 && failCount > 0 && skippedCount === 0) {
      return {
        success: false,
        count: 0,
        error: `Failed to import any prayer times. ${failCount} entries had errors.`
      };
    }

    let warningMessage = '';
    if (skippedCount > 0) {
      warningMessage += `${skippedCount} entries skipped (already exist). `;
    }
    if (failCount > 0) {
      warningMessage += `${failCount} entries failed to import.`;
    }

    if (successCount === 0 && skippedCount > 0) {
      return {
        success: true,
        count: 0,
        error: `All ${skippedCount} entries already exist in the database. No new entries imported.`
      };
    }

    return {
      success: true,
      count: successCount,
      error: warningMessage.length > 0 ? warningMessage : undefined
    };
  } catch (error) {
    console.error("Error importing from CSV:", error);
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : "Unknown error during import"
    };
  }
};

// Function to import prayer times from Google Sheet
export const importPrayerTimesFromSheet = async (
  sheetId: string,
  tabName: string = 'Sheet1',
  hasHeaderRow: boolean = true,
  isPublic: boolean = true,
  mosque: string = 'dundee_central'
): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> => {
  try {
    if (!sheetId) {
      return {
        success: false,
        count: 0,
        error: "Please provide a valid Google Sheet ID"
      };
    }

    // Extract Sheet ID from URL if user pasted a full URL
    if (sheetId.includes('docs.google.com/spreadsheets')) {
      const urlMatch = sheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (urlMatch && urlMatch[1]) {
        sheetId = urlMatch[1];
        console.log("Extracted Sheet ID from URL:", sheetId);
      } else {
        return {
          success: false,
          count: 0,
          error: "Could not extract a valid Sheet ID from the provided URL"
        };
      }
    }

    // Create CSV download URL from sheet ID
    // For a specific tab/sheet, we need to use gid, not the tab name directly
    let csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    if (tabName && tabName !== 'Sheet1') {
      // Try to use tab name as provided, but note this might not work correctly
      // For specific sheets, users should use the gid number
      csvUrl += `&gid=${tabName}`;
    }

    console.log("Attempting to fetch CSV from:", csvUrl);

    // Fetch the sheet data as CSV
    const response = await fetch(csvUrl);

    if (!response.ok) {
      // Provide more detailed error information
      let errorMessage = `Failed to fetch sheet: ${response.status}`;

      if (response.status === 404) {
        errorMessage += ". Make sure the Sheet ID is correct and the sheet is publicly accessible.";
      } else if (response.status === 403) {
        errorMessage += ". Access forbidden. The sheet must be shared with 'Anyone with the link' or 'Public on the web'.";
      } else {
        errorMessage += ` ${response.statusText}`;
      }

      return {
        success: false,
        count: 0,
        error: errorMessage
      };
    }

    const csvText = await response.text();
    if (!csvText || csvText.trim().length === 0) {
      return {
        success: false,
        count: 0,
        error: "Sheet contains no data"
      };
    }

    console.log("CSV data retrieved, importing...");
    return await importFromCSV(csvText, mosque);
  } catch (error) {
    console.error("Error importing from Google Sheet:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      count: 0,
      error: `Error: ${errorMessage}`
    };
  }
};

export const fetchMosqueLatestDate = async (mosque: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('prayer_times')
    .select('date')
    .eq('mosque', mosque)
    .order('date', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching latest date:', error);
    return null;
  }

  if (!data || data.length === 0) return null;
  return data[0].date;
};
