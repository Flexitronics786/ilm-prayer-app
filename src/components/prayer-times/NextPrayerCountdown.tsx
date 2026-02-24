
import React, { useState, useEffect } from "react";
import { PrayerTime, DetailedPrayerTime } from "@/types";
import { useTVDisplay } from "@/hooks/useTVDisplay";
import { useMosque, MOSQUES } from "@/contexts/MosqueContext";

interface NextPrayerCountdownProps {
    prayerTimes: PrayerTime[];
    detailedTimes: DetailedPrayerTime | null;
}

interface PrayerScheduleItem {
    name: string;
    arabicName: string;
    time24h: string; // HH:MM in 24h format
    type: 'Begins' | 'Jamat' | 'Sunrise' | 'Maghrib' | 'Mithal 1';
}

const getPrayerSchedule = (
    prayerTimes: PrayerTime[],
    detailedTimes: DetailedPrayerTime | null,
    showMithal1: boolean
): PrayerScheduleItem[] => {
    const schedule: PrayerScheduleItem[] = [];

    // Helper to get time in 24h format
    const getTime = (detailedField: string | undefined | null, fallbackName: string): string => {
        if (detailedField) return detailedField.substring(0, 5);
        const prayer = prayerTimes.find(p => p.name === fallbackName);
        return prayer?.time?.substring(0, 5) || "";
    };

    if (detailedTimes) {
        // Fajr
        schedule.push({ name: "Fajr", arabicName: "فجر", time24h: getTime(detailedTimes.sehri_end, "Fajr"), type: 'Begins' });
        schedule.push({ name: "Fajr", arabicName: "فجر", time24h: getTime(detailedTimes.fajr_jamat, "Fajr"), type: 'Jamat' });

        // Sunrise
        schedule.push({ name: "Sunrise", arabicName: "شروق", time24h: getTime(detailedTimes.sunrise, "Sunrise"), type: 'Sunrise' });

        // Zuhr
        schedule.push({ name: "Zuhr", arabicName: "ظهر", time24h: getTime(detailedTimes.zuhr_start, "Zuhr"), type: 'Begins' });
        schedule.push({ name: "Zuhr", arabicName: "ظهر", time24h: getTime(detailedTimes.zuhr_jamat, "Zuhr"), type: 'Jamat' });

        // Asr
        if (showMithal1) {
            schedule.push({ name: "Asr", arabicName: "عصر", time24h: getTime(detailedTimes.asr_mithal_1, "Asr"), type: 'Mithal 1' });
        }
        schedule.push({ name: "Asr", arabicName: "عصر", time24h: getTime(detailedTimes.asr_start, "Asr"), type: 'Begins' });
        schedule.push({ name: "Asr", arabicName: "عصر", time24h: getTime(detailedTimes.asr_jamat, "Asr"), type: 'Jamat' });

        // Maghrib (Only one time usually)
        schedule.push({ name: "Maghrib", arabicName: "مغرب", time24h: getTime(detailedTimes.maghrib_iftar, "Maghrib"), type: 'Maghrib' });

        // Isha
        schedule.push({ name: "Isha", arabicName: "عشاء", time24h: getTime(detailedTimes.isha_start, "Isha"), type: 'Begins' });
        schedule.push({ name: "Isha", arabicName: "عشاء", time24h: getTime(detailedTimes.isha_first_jamat, "Isha"), type: 'Jamat' });

    } else {
        // Fallback: treat generic times as 'Begins' or generic
        const prayers = [
            { name: "Fajr", arabicName: "فجر" },
            { name: "Zuhr", arabicName: "ظهر" },
            { name: "Asr", arabicName: "عصر" },
            { name: "Maghrib", arabicName: "مغرب" },
            { name: "Isha", arabicName: "عشاء" },
        ];
        prayers.forEach(p => {
            const time = getTime(null, p.name);
            if (time) schedule.push({ ...p, time24h: time, type: 'Begins' });
        });
    }

    return schedule.filter(s => s.time24h !== "" && s.time24h !== null).sort((a, b) => a.time24h.localeCompare(b.time24h));
};

const getNextPrayer = (schedule: PrayerScheduleItem[]): { prayer: PrayerScheduleItem | null; remainingMs: number } => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentSeconds = currentMinutes * 60 + now.getSeconds();

    for (const prayer of schedule) {
        const [h, m] = prayer.time24h.split(":").map(Number);
        const prayerSeconds = (h * 60 + m) * 60;
        if (prayerSeconds > currentSeconds) {
            return { prayer, remainingMs: (prayerSeconds - currentSeconds) * 1000 };
        }
    }

    // Wrap around to first event tomorrow
    if (schedule.length > 0) {
        const firstEvent = schedule[0];
        const [h, m] = firstEvent.time24h.split(":").map(Number);
        const eventSeconds = (h * 60 + m) * 60;
        const secondsUntilMidnight = 86400 - currentSeconds;
        return { prayer: firstEvent, remainingMs: (secondsUntilMidnight + eventSeconds) * 1000 };
    }

    return { prayer: null, remainingMs: 0 };
};

const formatCountdown = (ms: number): { hours: string; minutes: string; seconds: string } => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
    };
};

export const NextPrayerCountdown: React.FC<NextPrayerCountdownProps> = ({ prayerTimes, detailedTimes }) => {
    const isTV = useTVDisplay();
    const [now, setNow] = useState(Date.now());
    const { selectedMosque } = useMosque();

    const mosqueInfo = MOSQUES.find(m => m.id === selectedMosque);
    const showMithal1 = mosqueInfo?.showMithal1 ?? false;

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const schedule = getPrayerSchedule(prayerTimes, detailedTimes, showMithal1);
    const { prayer: nextPrayer, remainingMs } = getNextPrayer(schedule);
    const countdown = formatCountdown(remainingMs);

    if (!nextPrayer) {
        return null;
    }

    const getLabel = (type: string) => {
        if (type === 'Begins') return "Start";
        if (type === 'Jamat') return "Jamat";
        if (type === 'Sunrise') return "Sunrise";
        if (type === 'Maghrib') return "Start"; // Maghrib Start
        if (type === 'Mithal 1') return "Mithal 1";
        return "";
    };

    return (
        <div className="prayer-card rounded-xl overflow-hidden prayer-transition">
            <div className="prayer-tile-header countdown-header">
                <div className="flex justify-between items-center px-2">
                    <h3 className={`text-2xl sm:text-3xl font-extrabold text-black ${isTV ? "text-3xl" : ""}`}>
                        Next Prayer
                    </h3>
                    <div className={`text-2xl sm:text-4xl mt-0.5 font-bold text-black ${isTV ? "text-4xl" : ""}`}>
                        ⏱
                    </div>
                </div>
            </div>
            <div className="px-2 sm:px-4 py-2 flex-grow flex flex-col justify-evenly">
                {/* Prayer name */}
                <div className="flex justify-between items-center mb-1 sm:mb-2 pb-1 border-b border-amber-100">
                    <span className="text-black text-base sm:text-lg font-bold">Prayer:</span>
                    <div className="text-right">
                        <span className={`font-bold text-black text-xl sm:text-2xl clock-text ${isTV ? "tv-time-text" : ""}`}>
                            {nextPrayer.name}
                        </span>
                        <div className="text-xs sm:text-sm font-semibold text-amber-700 uppercase tracking-wider">
                            {getLabel(nextPrayer.type)}
                        </div>
                    </div>
                </div>
                {/* Countdown */}
                <div className="flex justify-center items-center pt-1">
                    <div className="flex items-center gap-1">
                        <div className="flex flex-col items-center">
                            <span className={`font-bold text-black ${isTV ? "text-4xl" : "text-3xl sm:text-4xl"} countdown-digit`}>
                                {countdown.hours}
                            </span>
                            <span className="text-xs text-gray-600 font-medium uppercase tracking-wide">hrs</span>
                        </div>
                        <span className={`font-bold text-black ${isTV ? "text-4xl" : "text-3xl sm:text-4xl"} -mt-4`}>:</span>
                        <div className="flex flex-col items-center">
                            <span className={`font-bold text-black ${isTV ? "text-4xl" : "text-3xl sm:text-4xl"} countdown-digit`}>
                                {countdown.minutes}
                            </span>
                            <span className="text-xs text-gray-600 font-medium uppercase tracking-wide">min</span>
                        </div>
                        <span className={`font-bold text-black ${isTV ? "text-4xl" : "text-3xl sm:text-4xl"} -mt-4`}>:</span>
                        <div className="flex flex-col items-center">
                            <span className={`font-bold text-black ${isTV ? "text-4xl" : "text-3xl sm:text-4xl"} countdown-digit`}>
                                {countdown.seconds}
                            </span>
                            <span className="text-xs text-gray-600 font-medium uppercase tracking-wide">sec</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
