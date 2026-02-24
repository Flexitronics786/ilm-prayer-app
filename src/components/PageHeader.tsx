
import React from "react";
import DigitalClock from "@/components/DigitalClock";
import { useMosque, MOSQUES } from "@/contexts/MosqueContext";
import FullTimetableDialog from "@/components/FullTimetableDialog";

import SocialLinks from "@/components/SocialLinks";

interface PageHeaderProps {
  currentDate: string;
  isTV: boolean;
}

const PageHeader = ({ currentDate, isTV }: PageHeaderProps) => {
  const { selectedMosque, mosqueInfo, setMosque, setFirstVisitDone } = useMosque();

  const handleSwitchMosque = () => {
    // Reset first visit to re-show the dialog
    localStorage.removeItem('selected-mosque');
    window.location.reload();
  };

  return (
    <header className={`${isTV ? 'mb-1' : 'mb-4'}`}>
      <div className="gold-border p-2 sm:p-3 bg-white backdrop-blur-sm shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
          <div className="text-center md:text-left md:pl-4 order-2 md:order-1">
            <div className="text-lg sm:text-xl md:text-2xl text-black">
              {currentDate}
            </div>
            {!isTV && (
              <div className="mt-1 flex justify-center md:justify-start">
                <FullTimetableDialog />
              </div>
            )}
          </div>

          <div className="text-center order-1 md:order-2 flex flex-col items-center justify-center">
            <div className="flex items-center justify-center gap-3">
              {isTV ? (
                <div className="decoration-transparent">
                  <img
                    src="https://res.cloudinary.com/dsa1crxay/image/upload/v1752377737/473148050_10160452160655951_3047339032063400229_n_d1dfir.jpg"
                    alt="ILM Halal Student Halls Logo"
                    className="w-[70px] h-[70px] rounded-full object-cover border-2 border-amber-400 flex-shrink-0"
                  />
                </div>
              ) : (
                <a href="https://ilm-studenthalls.com/" target="_blank" rel="noopener noreferrer" className="decoration-transparent hover:opacity-80 transition-opacity">
                  <img
                    src="https://res.cloudinary.com/dsa1crxay/image/upload/v1752377737/473148050_10160452160655951_3047339032063400229_n_d1dfir.jpg"
                    alt="ILM Halal Student Halls Logo"
                    className="w-[70px] h-[70px] rounded-full object-cover border-2 border-amber-400 flex-shrink-0"
                  />
                </a>
              )}
              <div className="flex flex-col items-start text-left">
                {isTV ? (
                  <h1 className="text-[22px] font-bold text-blue-950 font-serif leading-tight underline decoration-blue-500 decoration-2 underline-offset-4">
                    ILM Halal Student Halls
                  </h1>
                ) : (
                  <a href="https://ilm-studenthalls.com/" target="_blank" rel="noopener noreferrer" className="decoration-transparent">
                    <h1 className="text-[20px] sm:text-[22px] md:text-[28px] font-bold text-blue-950 font-serif leading-tight underline decoration-blue-500 decoration-2 underline-offset-4 hover:text-blue-700 transition-colors">
                      ILM Halal Student Halls
                    </h1>
                  </a>
                )}
                <h2 className="text-[13px] sm:text-[15px] font-medium text-gray-700">
                  Student Accommodation Dundee
                </h2>
                {mosqueInfo && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm text-emerald-700 font-medium">🕌 {mosqueInfo.name}</span>
                    <button
                      onClick={handleSwitchMosque}
                      className="text-xs text-emerald-600 hover:text-emerald-800 underline cursor-pointer transition-colors"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="h-0.5 w-full bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 mx-auto rounded-full mt-1"></div>
          </div>

          <div className="order-3 md:pr-4 flex flex-col items-center md:items-end">
            <DigitalClock showDate={false} />
            {!isTV && <SocialLinks />}
          </div>
        </div>
      </div>
    </header >
  );
};

export default PageHeader;
