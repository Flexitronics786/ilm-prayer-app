
import React from "react";
import { PrayerTime, DetailedPrayerTime } from "@/types";
import { PrayerTile } from "./PrayerTile";
import { getPrayerDetails, getIshaStart, getIshaJamat } from "./PrayerTimeUtils";

interface IshaTileProps {
  prayerTimes: PrayerTime[];
  detailedTimes: DetailedPrayerTime | null;
  tomorrowDetailedTimes?: DetailedPrayerTime | null;
}

export const IshaTile: React.FC<IshaTileProps> = ({ prayerTimes, detailedTimes, tomorrowDetailedTimes }) => {
  const ishaDetails = getPrayerDetails(prayerTimes, "Isha");

  // Isha is weird - it passes at midnight.
  // If Fajr is "isNext", and Isha is NOT active, then Isha is passed. But wait, Isha IS active until Fajr starts.
  // Actually, if we are currently displaying tomorrow's Fajr (midnight crossed), we should probably pull tomorrow's Isha.
  // A simpler way: if the clock indicates it's past midnight and before Fajr, Isha is 'active', but it should show TODAY'S Isha (which is technically later today, since we fetched today's detailed object).
  // Wait! At midnight, the entire app re-fetches `allTimes` and `today` becomes the new calendar day.
  // So there is actually NO situation where Isha ever needs to dynamically visually "roll over" into tomorrow while the board is drawn, because the entire board resets its calendar baseline at exactly 12:00:00 AM.
  // Therefore, Isha never needs to artificially force `displayTimes`, unlike Fajr/Zuhr.

  const displayTimes = detailedTimes;

  const timeItems = [
    {
      label: "Start",
      time: getIshaStart(detailedTimes, prayerTimes)
    },
    {
      label: "Jamat",
      time: getIshaJamat(detailedTimes, prayerTimes)
    }
  ];

  return (
    <PrayerTile
      title="Isha"
      arabicTitle="عشاء"
      isActive={ishaDetails.isActive}
      isNext={ishaDetails.isNext}
      items={timeItems}
      headerClass="isha-header"
    />
  );
};
