
import React from "react";
import { PrayerTime, DetailedPrayerTime } from "@/types";
import { PrayerTile } from "./PrayerTile";
import { getPrayerDetails, getAsrStart, getAsrMithal1, getAsrJamat, isAfterMidnightBeforeFajr } from "./PrayerTimeUtils";
import { useMosque } from "@/contexts/MosqueContext";

interface AsrTileProps {
  prayerTimes: PrayerTime[];
  detailedTimes: DetailedPrayerTime | null;
  tomorrowDetailedTimes?: DetailedPrayerTime | null;
}

export const AsrTile: React.FC<AsrTileProps> = ({ prayerTimes, detailedTimes, tomorrowDetailedTimes }) => {
  const asrDetails = getPrayerDetails(prayerTimes, "Asr");
  const { mosqueInfo } = useMosque();
  const isPostMidnight = isAfterMidnightBeforeFajr(prayerTimes);

  // Asr is passed if Maghrib or Isha is currently active
  const isPassed = !isPostMidnight && prayerTimes.some(p =>
    (p.name === "Maghrib" || p.name === "Isha") && p.isActive
  );

  const displayTimes = (isPassed && tomorrowDetailedTimes) ? tomorrowDetailedTimes : detailedTimes;
  const mithal1Time = mosqueInfo.showMithal1 ? getAsrMithal1(displayTimes, prayerTimes) : "";

  const items = [
    {
      label: "Mithal 1",
      time: mithal1Time
    },
    {
      label: "Start",
      time: getAsrStart(displayTimes, prayerTimes)
    },
    {
      label: "Jamat",
      time: getAsrJamat(displayTimes, prayerTimes)
    }
  ].filter(item => item.time !== "");

  return (
    <PrayerTile
      title="Asr"
      arabicTitle="عصر"
      isActive={asrDetails.isActive}
      isNext={asrDetails.isNext}
      items={items}
      headerClass="asr-header"
    />
  );
};
