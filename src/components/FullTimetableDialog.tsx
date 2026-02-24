import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useMosque } from "@/contexts/MosqueContext";
import { fetchAllPrayerTimes } from "@/services/dataService";
import { DetailedPrayerTime } from "@/types";
import { formatDate } from "@/utils/dateUtils";

const FullTimetableDialog = () => {
    const { selectedMosque, mosqueInfo } = useMosque();
    const [prayerTimes, setPrayerTimes] = useState<DetailedPrayerTime[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen && selectedMosque) {
            loadPrayerTimes();
        }
    }, [isOpen, selectedMosque]);

    const loadPrayerTimes = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAllPrayerTimes(selectedMosque);
            setPrayerTimes(data);
        } catch (error) {
            console.error("Failed to load prayer times", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Scroll to current date on open
    useEffect(() => {
        if (!isLoading && isOpen) {
            const today = new Date().toISOString().split('T')[0];
            const element = document.getElementById(`row-${today}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [isLoading, isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 shadow-sm transition-all hover:shadow-md relative active:top-[1px] active:shadow-none">
                    <Calendar className="h-4 w-4" />
                    <span>View Timetable</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] w-[95vw] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center justify-between">
                        <span>{mosqueInfo.name} Timetable</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700"></div>
                        </div>
                    ) : (
                        <div className="relative w-full rounded-xl border border-gray-200 overflow-x-auto overflow-y-hidden shadow-sm bg-white">
                            <table className="w-full text-[15px] text-left">
                                <thead className="text-[13px] font-bold text-gray-700 uppercase bg-gray-100/90 backdrop-blur-md sticky top-0 z-10 shadow-sm border-b border-gray-200 tracking-wider">
                                    <tr>
                                        <th className="px-5 py-4 w-[110px] sticky left-0 bg-gray-100/90 backdrop-blur-md border-r border-gray-200">Date</th>
                                        <th className="px-4 py-4 border-r border-gray-200">Day</th>
                                        <th className="px-4 py-4 bg-blue-50/50 text-blue-900">Fajr Start</th>
                                        <th className="px-4 py-4 bg-blue-50/50 text-blue-900 border-r border-gray-200">Fajr Jamat</th>
                                        <th className="px-4 py-4 bg-amber-50/50 text-amber-900 border-r border-gray-200">Sunrise</th>
                                        <th className="px-4 py-4">Zuhr Start</th>
                                        <th className="px-4 py-4 border-r border-gray-200">Zuhr Jamat</th>
                                        <th className="px-4 py-4">Asr Start</th>
                                        {mosqueInfo.showMithal1 && <th className="px-4 py-4">Mithal 1</th>}
                                        <th className="px-4 py-4 border-r border-gray-200">Asr Jamat</th>
                                        <th className="px-4 py-4 bg-purple-50/50 text-purple-900 border-r border-gray-200">Maghrib</th>
                                        <th className="px-4 py-4 bg-indigo-50/50 text-indigo-900">Isha Start</th>
                                        <th className="px-4 py-4 bg-indigo-50/50 text-indigo-900">Isha Jamat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prayerTimes.map((pt, index) => {
                                        const isToday = pt.date === new Date().toISOString().split('T')[0];
                                        const isEven = index % 2 === 0;

                                        return (
                                            <tr
                                                key={pt.id}
                                                id={`row-${pt.date}`}
                                                className={`
                                                    border-b last:border-0 transition-colors
                                                    ${isToday ? 'bg-emerald-50 hover:bg-emerald-100 shadow-[inset_4px_0_0_0_rgba(16,185,129,1)]' :
                                                        isEven ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/50 hover:bg-gray-100/80'}
                                                `}
                                            >
                                                <td className={`px-5 py-3.5 font-semibold whitespace-nowrap sticky left-0 border-r border-gray-200 ${isToday ? 'bg-emerald-50/90' : isEven ? 'bg-white/90' : 'bg-gray-50/90'} backdrop-blur-sm z-0`}>
                                                    {new Date(pt.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                </td>
                                                <td className={`px-4 py-3.5 border-r border-gray-200 ${isToday ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                                                    {pt.day.substring(0, 3)}
                                                </td>
                                                <td className="px-4 py-3.5 text-gray-600 bg-blue-50/20">{pt.sehri_end?.slice(0, 5)}</td>
                                                <td className="px-4 py-3.5 font-bold text-blue-700 bg-blue-50/20 border-r border-gray-200">{pt.fajr_jamat.slice(0, 5)}</td>
                                                <td className="px-4 py-3.5 font-medium text-amber-600 bg-amber-50/20 border-r border-gray-200">{pt.sunrise.slice(0, 5)}</td>
                                                <td className="px-4 py-3.5 text-gray-600">{pt.zuhr_start?.slice(0, 5)}</td>
                                                <td className="px-4 py-3.5 font-bold text-emerald-700 border-r border-gray-200">{pt.zuhr_jamat.slice(0, 5)}</td>
                                                <td className="px-4 py-3.5 text-gray-600">{pt.asr_start?.slice(0, 5)}</td>
                                                {mosqueInfo.showMithal1 && (
                                                    <td className="px-4 py-3.5 text-gray-500">{pt.asr_mithal_1?.slice(0, 5)}</td>
                                                )}
                                                <td className="px-4 py-3.5 font-bold text-emerald-700 border-r border-gray-200">{pt.asr_jamat.slice(0, 5)}</td>
                                                <td className="px-4 py-3.5 font-bold text-purple-700 bg-purple-50/20 border-r border-gray-200">{pt.maghrib_iftar.slice(0, 5)}</td>
                                                <td className="px-4 py-3.5 text-gray-600 bg-indigo-50/20">{pt.isha_start?.slice(0, 5)}</td>
                                                <td className="px-4 py-3.5 font-bold text-indigo-700 bg-indigo-50/20">{pt.isha_first_jamat.slice(0, 5)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FullTimetableDialog;
