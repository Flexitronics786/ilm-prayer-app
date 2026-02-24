import { useState } from "react";
import { Copy, Check, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PROMPT_CENTRAL = `Extract times from the prayer timetable into a new format with the following specifications:

1. Format the table with these exact column headers:
   - Date
   - Day
   - Fajr Start
   - Fajr Jamat
   - Sunrise
   - Zuhr Start
   - Zuhr Jamat
   - Asr Mithal 1
   - Asr Start
   - Asr Jamat
   - Maghrib Start
   - Isha Start
   - Isha Jamat

2. For the Date column:
   - Keep the YYYY-MM-DD format (e.g., 2025-04-01)

3. For the Day column:
   - Convert the three-letter abbreviations to full day
   - TUE → Tuesday
   - WED → Wednesday
   - THU → Thursday
   - FRI → Friday
   - SAT → Saturday
   - SUN → Sunday
   - MON → Monday

4. Time format:
   - Convert all times to 24-hour format (HH:MM)
   - Note that the following times are in AM: Fajr Start, Fajr Jamat, Sunrise
   - Note that the following times are in PM: Zuhr Start, Zuhr Jamat, Asr Mithal 1, Asr Start, Asr Jamat, Maghrib Start, Isha Start, Isha Jamat
   - Convert AM times like this: 04:23 → 04:23
   - Convert PM times like this: 01:26 → 13:26, 05:41 → 17:41, 07:54 → 19:54, 09:24 → 21:24

5. Apply alternate row coloring:
   - Light green for first row (headers)
   - Light blue for Tuesdays
   - Light green for Wednesdays
   - Light blue for Thursdays
   - Light orange for Fridays
   - Light green for Saturdays
   - Light blue for Sundays
   - Light green for Mondays

6. Maintain all the actual prayer times from the table while applying these formatting changes.

7. Please provide the final output as an HTML table that can be easily copied and pasted into Google Sheets. Include all necessary HTML formatting tags, cell alignments, and color styling.`;

const PROMPT_OTHER = `Extract times from the prayer timetable into a new format with the following specifications:

1. Format the table with these exact column headers:
   - Date
   - Day 
   - Fajr Start
   - Fajr Jamat
   - Sunrise
   - Zuhr Start
   - Zuhr Jamat
   - Asr Start
   - Asr Jamat
   - Maghrib Start
   - Isha Start
   - Isha Jamat

2. For the Date column:
   - Keep the YYYY-MM-DD format (e.g., 2025-04-01)

3. For the Day column:
   - Convert the three-letter abbreviations to full day
   - TUE → Tuesday 
   - WED → Wednesday 
   - THU → Thursday 
   - FRI → Friday 
   - SAT → Saturday 
   - SUN → Sunday 
   - MON → Monday 

4. Time format:
   - Convert all times to 24-hour format (HH:MM)
   - Note that the following times are in AM: Fajr Start, Fajr Jamat, Sunrise
   - Note that the following times are in PM: Zuhr Start, Zuhr Jamat, Asr Start, Asr Jamat, Maghrib Start, Isha Start, Isha Jamat
   - Convert AM times like this: 04:23 → 04:23
   - Convert PM times like this: 01:26 → 13:26, 05:41 → 17:41, 07:54 → 19:54, 09:24 → 21:24

5. Apply alternate row coloring:
   - Light green for first row (headers)
   - Light blue for Tuesdays
   - Light green for Wednesdays
   - Light blue for Thursdays
   - Light orange for Fridays
   - Light green for Saturdays
   - Light blue for Sundays
   - Light green for Mondays

6. Maintain all the actual prayer times from the table while applying these formatting changes.

7. Please provide the final output as an HTML table that can be easily copied and pasted into Google Sheets. Include all necessary HTML formatting tags, cell alignments, and color styling.`;

const ClaudePromptCopier = () => {
    const [copiedCentral, setCopiedCentral] = useState(false);
    const [copiedOther, setCopiedOther] = useState(false);

    const handleCopy = async (text: string, isCentral: boolean) => {
        try {
            await navigator.clipboard.writeText(text);
            if (isCentral) {
                setCopiedCentral(true);
                setTimeout(() => setCopiedCentral(false), 2000);
            } else {
                setCopiedOther(true);
                setTimeout(() => setCopiedOther(false), 2000);
            }
            toast.success("Prompt copied to clipboard!");
        } catch {
            toast.error("Failed to copy. Try selecting the text manually.");
        }
    };

    return (
        <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center gap-2 mb-4">
                <Bot className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-amber-800">
                    Claude Timetable Extraction Prompts
                </h3>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
                Select the prompt matching your mosque's timetable format (with or without Asr Mithal 1) and copy to Claude.
            </p>

            <Tabs defaultValue="central" className="w-full">
                <TabsList className="mb-2">
                    <TabsTrigger value="central">Dundee Central (With Mithal 1)</TabsTrigger>
                    <TabsTrigger value="bilal">Bilal / Al Maktoum (No Mithal 1)</TabsTrigger>
                </TabsList>

                <TabsContent value="central">
                    <div className="flex justify-end mb-2">
                        <Button
                            onClick={() => handleCopy(PROMPT_CENTRAL, true)}
                            variant="outline"
                            size="sm"
                            className={`flex items-center gap-2 transition-colors ${copiedCentral
                                ? "bg-green-50 border-green-300 text-green-700"
                                : "hover:bg-purple-50 hover:border-purple-300"
                                }`}
                        >
                            {copiedCentral ? (
                                <>
                                    <Check className="h-4 w-4" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4" />
                                    Copy Central Prompt
                                </>
                            )}
                        </Button>
                    </div>
                    <div className="bg-gray-50 rounded-md p-3 max-h-48 overflow-auto border">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                            {PROMPT_CENTRAL}
                        </pre>
                    </div>
                </TabsContent>

                <TabsContent value="bilal">
                    <div className="flex justify-end mb-2">
                        <Button
                            onClick={() => handleCopy(PROMPT_OTHER, false)}
                            variant="outline"
                            size="sm"
                            className={`flex items-center gap-2 transition-colors ${copiedOther
                                ? "bg-green-50 border-green-300 text-green-700"
                                : "hover:bg-purple-50 hover:border-purple-300"
                                }`}
                        >
                            {copiedOther ? (
                                <>
                                    <Check className="h-4 w-4" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4" />
                                    Copy Bilal/Al Maktoum Prompt
                                </>
                            )}
                        </Button>
                    </div>
                    <div className="bg-gray-50 rounded-md p-3 max-h-48 overflow-auto border">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                            {PROMPT_OTHER}
                        </pre>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ClaudePromptCopier;
