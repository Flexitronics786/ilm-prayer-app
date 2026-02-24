
import { PrayerTime } from "@/types";
import { useTVDisplay } from "@/hooks/useTVDisplay";
import { usePrayerTimeAlerts } from "@/hooks/usePrayerTimeAlerts";
import { FajrTile } from "./prayer-times/FajrTile";
import { ZuhrTile } from "./prayer-times/ZuhrTile";
import { AsrTile } from "./prayer-times/AsrTile";
import { MaghribTile } from "./prayer-times/MaghribTile";
import { IshaTile } from "./prayer-times/IshaTile";
import { NextPrayerCountdown } from "./prayer-times/NextPrayerCountdown";
import { useEffect } from "react";
import { getCurrentTime24h } from "@/utils/dateUtils";

interface PrayerTimesTableProps {
  prayerTimes: PrayerTime[];
  detailedTimes: any;
  tomorrowDetailedTimes?: any;
  compactView?: boolean;
}

const PrayerTimesTable = ({ prayerTimes, detailedTimes, tomorrowDetailedTimes, compactView = false }: PrayerTimesTableProps) => {
  const isTV = useTVDisplay();


  // Use our updated hook for prayer time alerts - this will play sounds at jamat times
  usePrayerTimeAlerts(prayerTimes, detailedTimes);

  // Add periodic logging of prayer times and current time for debugging
  useEffect(() => {
    const logInterval = setInterval(() => {
      if (isTV) {
        const currentTime = getCurrentTime24h();
        console.log(`[${currentTime}] Prayer times check (Firestick):`, {
          detailedTimesLoaded: !!detailedTimes,
          jamatTimes: detailedTimes ? {
            fajr: detailedTimes.fajr_jamat,
            zuhr: detailedTimes.zuhr_jamat,
            asr: detailedTimes.asr_jamat,
            maghrib: detailedTimes.maghrib_iftar,
            isha: detailedTimes.isha_first_jamat
          } : 'No detailed times'
        });
      }
    }, 60000); // Log every minute on TV devices

    return () => clearInterval(logInterval);
  }, [isTV, detailedTimes]);

  return (
    <div className="animate-scale-in h-full flex flex-col">
      <div className="mb-2 sm:mb-3 flex-shrink-0">
        <h3 className="text-2xl sm:text-3xl font-bold text-black font-serif">Prayer Times</h3>
      </div>

      <div className={`flex-grow grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 ${isTV ? 'grid-cols-3 grid-rows-2 gap-3 tv-prayer-grid' : 'mobile-prayer-grid'}`}>
        <NextPrayerCountdown prayerTimes={prayerTimes} detailedTimes={detailedTimes} />
        <FajrTile prayerTimes={prayerTimes} detailedTimes={detailedTimes} tomorrowDetailedTimes={tomorrowDetailedTimes} />
        <ZuhrTile prayerTimes={prayerTimes} detailedTimes={detailedTimes} tomorrowDetailedTimes={tomorrowDetailedTimes} />
        <AsrTile prayerTimes={prayerTimes} detailedTimes={detailedTimes} tomorrowDetailedTimes={tomorrowDetailedTimes} />
        <MaghribTile prayerTimes={prayerTimes} detailedTimes={detailedTimes} tomorrowDetailedTimes={tomorrowDetailedTimes} />
        <IshaTile prayerTimes={prayerTimes} detailedTimes={detailedTimes} tomorrowDetailedTimes={tomorrowDetailedTimes} />
      </div>
    </div>
  );
};

export default PrayerTimesTable;
