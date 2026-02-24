
import React from "react";
import { PrayerTime, DetailedPrayerTime } from "@/types";
import { PrayerTile } from "./PrayerTile";
import { getPrayerDetails, getFajrStart, getFajrJamat, getSunriseFromDetailedTimes, isAfterMidnightBeforeFajr } from "./PrayerTimeUtils";

interface FajrTileProps {
  prayerTimes: PrayerTime[];
  detailedTimes: DetailedPrayerTime | null;
  tomorrowDetailedTimes?: DetailedPrayerTime | null;
}

export const FajrTile: React.FC<FajrTileProps> = ({ prayerTimes, detailedTimes, tomorrowDetailedTimes }) => {
  const fajrDetails = getPrayerDetails(prayerTimes, "Fajr");
  const isPostMidnight = isAfterMidnightBeforeFajr(prayerTimes);

  // Fajr is passed if Zuhr, Asr, Maghrib, or Isha is currently active
  const isPassed = !isPostMidnight && prayerTimes.some(p =>
    (p.name === "Dhuhr" || p.name === "Zuhr" || p.name === "Asr" || p.name === "Maghrib" || p.name === "Isha") && p.isActive
  );

  const displayTimes = (isPassed && tomorrowDetailedTimes) ? tomorrowDetailedTimes : detailedTimes;

  return (
    <PrayerTile
      title="Fajr"
      arabicTitle="فجر"
      isActive={fajrDetails.isActive}
      isNext={fajrDetails.isNext}
      items={[
        {
          label: "Start",
          time: getFajrStart(displayTimes, prayerTimes)
        },
        {
          label: "Jamat",
          time: getFajrJamat(displayTimes, prayerTimes)
        },
        {
          label: "Sunrise",
          time: getSunriseFromDetailedTimes(displayTimes, prayerTimes)
        }
      ]}
      headerClass="fajr-header"
    />
  );
};
