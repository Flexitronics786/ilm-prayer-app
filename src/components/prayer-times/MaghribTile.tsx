
import React, { useEffect } from "react";
import { PrayerTime, DetailedPrayerTime } from "@/types";
import { PrayerTile } from "./PrayerTile";
import { getPrayerDetails, getMaghribTime, isAfterMidnightBeforeFajr } from "./PrayerTimeUtils";

interface MaghribTileProps {
  prayerTimes: PrayerTime[];
  detailedTimes: DetailedPrayerTime | null;
  tomorrowDetailedTimes?: DetailedPrayerTime | null;
}

export const MaghribTile: React.FC<MaghribTileProps> = ({ prayerTimes, detailedTimes, tomorrowDetailedTimes }) => {
  const maghribDetails = getPrayerDetails(prayerTimes, "Maghrib");
  const isPostMidnight = isAfterMidnightBeforeFajr(prayerTimes);

  // Maghrib is passed if Isha is currently active
  const isPassed = !isPostMidnight && prayerTimes.some(p => p.name === "Isha" && p.isActive);

  const displayTimes = (isPassed && tomorrowDetailedTimes) ? tomorrowDetailedTimes : detailedTimes;

  // Add debugging for Maghrib time
  useEffect(() => {
    if (detailedTimes?.maghrib_iftar) {
      console.log("Maghrib time loaded:", detailedTimes.maghrib_iftar, "isPassed:", isPassed);
    }
  }, [detailedTimes, isPassed]);

  return (
    <PrayerTile
      title="Maghrib"
      arabicTitle="مغرب"
      isActive={maghribDetails.isActive}
      isNext={maghribDetails.isNext}
      items={[
        {
          label: "Start",
          time: getMaghribTime(displayTimes, prayerTimes)
        }
      ]}
      headerClass="maghrib-header"
    />
  );
};
