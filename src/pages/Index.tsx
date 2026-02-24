
import { useState, useEffect } from "react";
import { formatDate } from "@/utils/dateUtils";
import PrayerTimesTable from "@/components/PrayerTimesTable";

import PageHeader from "@/components/PageHeader";
import LoadingScreen from "@/components/LoadingScreen";
import KeepAwake from "@/components/KeepAwake";
import { useTVDisplay } from "@/hooks/useTVDisplay";
import { usePrayerTimesData } from "@/hooks/usePrayerTimesData";
import { usePrayerTimeAlerts } from "@/hooks/usePrayerTimeAlerts";
import { Toaster } from "sonner";

const Index = () => {
  const [currentDate, setCurrentDate] = useState(formatDate());
  const isTV = useTVDisplay();
  const { prayerTimes, isLoading, detailedTimes, tomorrowDetailedTimes } = usePrayerTimesData();

  // Initialize prayer time alerts (without directly using the returned value)
  usePrayerTimeAlerts(prayerTimes, detailedTimes);

  useEffect(() => {
    const dateInterval = setInterval(() => {
      setCurrentDate(formatDate());
    }, 60000);

    return () => clearInterval(dateInterval);
  }, []);

  if (isLoading && prayerTimes.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${isTV ? 'tv-display' : 'py-2 px-3'} bg-white`}>
      <div className="pattern-overlay"></div>
      <KeepAwake />
      {/* Add Toaster for other notifications (not prayer alerts) */}
      <Toaster position={isTV ? "top-center" : "bottom-right"} toastOptions={{ className: isTV ? 'tv-toast' : '' }} />

      <div className={`${isTV ? 'w-full max-w-[96%]' : 'max-w-7xl'} mx-auto h-full flex flex-col`}>
        <div className="grid grid-cols-1 gap-4 flex-grow h-full">
          <div className="w-full flex flex-col h-full">
            <PageHeader currentDate={currentDate} isTV={isTV} />

            <div className="flex-grow flex flex-col min-h-0">
              <PrayerTimesTable
                prayerTimes={prayerTimes}
                detailedTimes={detailedTimes}
                tomorrowDetailedTimes={tomorrowDetailedTimes}
                compactView={isTV}
              />
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
