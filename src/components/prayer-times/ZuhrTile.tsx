
import React from "react";
import { PrayerTime, DetailedPrayerTime } from "@/types";
import { PrayerTile } from "./PrayerTile";
import { getPrayerDetails, getZuhrStart, getZuhrJamat, isAfterMidnightBeforeFajr } from "./PrayerTimeUtils";

interface ZuhrTileProps {
  prayerTimes: PrayerTime[];
  detailedTimes: DetailedPrayerTime | null;
  tomorrowDetailedTimes?: DetailedPrayerTime | null;
}

export const ZuhrTile: React.FC<ZuhrTileProps> = ({ prayerTimes, detailedTimes, tomorrowDetailedTimes }) => {
  const zuhrDetails = getPrayerDetails(prayerTimes, "Zuhr");
  const isPostMidnight = isAfterMidnightBeforeFajr(prayerTimes);

  // Zuhr is passed if Asr, Maghrib, or Isha is currently active
  const isPassed = !isPostMidnight && prayerTimes.some(p =>
    (p.name === "Asr" || p.name === "Maghrib" || p.name === "Isha") && p.isActive
  );

  const displayTimes = (isPassed && tomorrowDetailedTimes) ? tomorrowDetailedTimes : detailedTimes;

  return (
    <PrayerTile
      title="Zuhr"
      arabicTitle="ظهر"
      isActive={zuhrDetails.isActive}
      isNext={zuhrDetails.isNext}
      items={[
        {
          label: "Start",
          time: getZuhrStart(displayTimes, prayerTimes)
        },
        {
          label: "Jamat",
          time: getZuhrJamat(displayTimes, prayerTimes)
        }
      ]}
      headerClass="zuhr-header"
    />
  );
};
