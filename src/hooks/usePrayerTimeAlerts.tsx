
import { useState, useEffect, useRef } from "react";
import { PrayerTime, DetailedPrayerTime } from "@/types";
import { getCurrentTime24h } from "@/utils/dateUtils";
import { supabase } from "@/integrations/supabase/client";
import { useTVDisplay } from "./useTVDisplay";

// Create a type for our supported prayer notifications
type PrayerNotificationType = "Fajr" | "Zuhr" | "Asr" | "Maghrib" | "Isha";

// Interface to track jamat times for the day
interface DailyJamatTimes {
  [key: string]: string; // Prayer name -> time in HH:MM format
}

// Create a unique ID for this hook instance to avoid conflicts with KeepAwake
const PRAYER_ALERT_AUDIO_ID = "prayer-alert-sound";

export const usePrayerTimeAlerts = (
  prayerTimes: PrayerTime[],
  detailedTimes: DetailedPrayerTime | null
) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const checkedTimesRef = useRef<Set<string>>(new Set());
  const [lastCheckedMinute, setLastCheckedMinute] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const dailyJamatTimesRef = useRef<DailyJamatTimes>({});
  const audioInitializedRef = useRef<boolean>(false);
  const isTV = useTVDisplay(); // Add TV detection
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const audioLoadAttemptsRef = useRef<number>(0); // Track loading attempts



  // Update daily jamat times at midnight or when detailed times change
  useEffect(() => {
    if (!detailedTimes) return;

    // Store all jamat times for the current day
    const updateDailyJamatTimes = () => {
      const jamatTimes: DailyJamatTimes = {};
      const prayers: PrayerNotificationType[] = ["Fajr", "Zuhr", "Asr", "Maghrib", "Isha"];

      prayers.forEach(prayer => {
        let prayerTime: string | null = null;

        // Get the appropriate time for each prayer
        switch (prayer) {
          case "Fajr":
            prayerTime = detailedTimes.fajr_jamat;
            break;
          case "Zuhr":
            prayerTime = detailedTimes.zuhr_jamat;
            break;
          case "Asr":
            prayerTime = detailedTimes.asr_jamat;
            break;
          case "Maghrib":
            prayerTime = detailedTimes.maghrib_iftar; // Use start time for Maghrib
            break;
          case "Isha":
            prayerTime = detailedTimes.isha_first_jamat;
            break;
        }

        if (prayerTime) {
          // Store only the HH:MM part for comparison
          jamatTimes[prayer] = prayerTime.substring(0, 5);
        }
      });

      console.log("Updated daily jamat times:", jamatTimes);
      dailyJamatTimesRef.current = jamatTimes;
    };

    // Update immediately
    updateDailyJamatTimes();

    // Set up a timer to update at midnight
    const midnight = new Date();
    midnight.setHours(24, 0, 5, 0); // 12:00:05 AM next day
    const now = new Date();
    const msUntilMidnight = midnight.getTime() - now.getTime();

    const midnightTimer = setTimeout(() => {
      updateDailyJamatTimes();
    }, msUntilMidnight);

    return () => clearTimeout(midnightTimer);
  }, [detailedTimes]);

  // Function to play the alert sound - DISABLED
  const playAlertSound = (prayerName: string) => {
    // Audio alerts disabled by request
    console.log(`Alert for ${prayerName} prayer time (sound disabled)`);
  };

  // Check and play alerts
  useEffect(() => {
    if (!detailedTimes || !audioInitializedRef.current) return;

    const checkTimes = () => {
      const currentTime24h = getCurrentTime24h();
      // Only check once per minute
      if (currentTime24h === lastCheckedMinute) return;
      setLastCheckedMinute(currentTime24h);

      // Format: HH:MM
      const currentMinutes = currentTime24h.substring(0, 5);

      // Check each stored jamat time from our daily record
      Object.entries(dailyJamatTimesRef.current).forEach(([prayer, prayerMinutes]) => {
        // Create a unique key for this prayer time
        const timeKey = `${prayer}-${prayerMinutes}-${new Date().toDateString()}`;

        // Alert if time matches and we haven't alerted for this time yet today
        if (prayerMinutes === currentMinutes && !checkedTimesRef.current.has(timeKey)) {
          // Mark this time as checked
          checkedTimesRef.current.add(timeKey);

          console.log(`⏰ JAMAT TIME ALERT for ${prayer} prayer at ${prayerMinutes} ⏰`);

          // Play alert sound and show notification
          playAlertSound(prayer);
        }
      });
    };

    // Check immediately and then every 5 seconds (more frequent for reliability)
    checkTimes();
    const interval = setInterval(checkTimes, 5000);

    return () => clearInterval(interval);
  }, [detailedTimes, lastCheckedMinute, isTV]);

  // Reset the checked times at midnight
  useEffect(() => {
    const resetAtMidnight = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        console.log("Midnight reset - clearing checked prayer times");
        checkedTimesRef.current.clear();
      }
    };

    const midnight = setInterval(resetAtMidnight, 60000);
    return () => clearInterval(midnight);
  }, []);

  return null; // This hook doesn't render anything
};
