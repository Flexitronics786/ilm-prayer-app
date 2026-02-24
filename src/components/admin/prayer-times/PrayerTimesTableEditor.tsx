
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAllPrayerTimes, deleteDuplicatePrayerTimes } from "@/services/dataService";
import { Loader2, Plus, Trash, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImportPrayerTimesDialog } from "./ImportPrayerTimesDialog";
import { AddEditPrayerTimeDialog } from "./AddEditPrayerTimeDialog";
import { PrayerTimesTable } from "./PrayerTimesTable";
import { DetailedPrayerTime } from "@/types";
import { DeleteAllPrayerTimesDialog } from "./DeleteAllPrayerTimesDialog";
import { MOSQUES } from "@/contexts/MosqueContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PrayerTimesTableEditor = () => {
  const queryClient = useQueryClient();
  const [adminMosque, setAdminMosque] = useState<string>('dundee_central');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<DetailedPrayerTime, 'id' | 'created_at'>>({
    date: new Date().toISOString().split('T')[0],
    day: '',
    mosque: 'dundee_central',
    sehri_end: '',
    fajr_jamat: '',
    sunrise: '',
    zuhr_start: '',
    zuhr_jamat: '',
    asr_start: '',
    asr_mithal_1: '',
    asr_jamat: '',
    maghrib_iftar: '',
    isha_start: '',
    isha_first_jamat: '',
    isha_second_jamat: ''
  });

  const {
    data: prayerTimes = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['prayerTimes', adminMosque],
    queryFn: () => fetchAllPrayerTimes(adminMosque),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'local-prayer-times') {
        queryClient.invalidateQueries({ queryKey: ['prayerTimes'] });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [queryClient]);

  useEffect(() => {
    if (!isAddDialogOpen) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        day: '',
        mosque: adminMosque,
        sehri_end: '',
        fajr_jamat: '',
        sunrise: '',
        zuhr_start: '',
        zuhr_jamat: '',
        asr_start: '',
        asr_mithal_1: '',
        asr_jamat: '',
        maghrib_iftar: '',
        isha_start: '',
        isha_first_jamat: '',
        isha_second_jamat: ''
      });
    }
  }, [isAddDialogOpen, adminMosque]);

  const handleEdit = (entry: DetailedPrayerTime) => {
    setEditingId(entry.id);
    setFormData({
      date: entry.date,
      day: entry.day,
      mosque: entry.mosque || adminMosque,
      sehri_end: entry.sehri_end || '',
      fajr_jamat: entry.fajr_jamat || '',
      sunrise: entry.sunrise || '',
      zuhr_start: entry.zuhr_start || '',
      zuhr_jamat: entry.zuhr_jamat || '',
      asr_start: entry.asr_start || '',
      asr_mithal_1: entry.asr_mithal_1 || '',
      asr_jamat: entry.asr_jamat || '',
      maghrib_iftar: entry.maghrib_iftar || '',
      isha_start: entry.isha_start || '',
      isha_first_jamat: entry.isha_first_jamat || '',
      isha_second_jamat: ''
    });
    setIsAddDialogOpen(true);
  };

  const handleCleanDuplicates = async () => {
    setIsCleaning(true);
    try {
      const result = await deleteDuplicatePrayerTimes();
      if (result.success) {
        if (result.duplicatesRemoved > 0) {
          toast.success(`Removed ${result.duplicatesRemoved} duplicate entries`);
          queryClient.invalidateQueries({ queryKey: ['prayerTimes'] });
        } else {
          toast.info('No duplicates found. Database is clean!');
        }
      } else {
        toast.error(result.error || 'Failed to clean duplicates');
      }
    } catch (error) {
      console.error('Error cleaning duplicates:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsCleaning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <p>Error loading prayer times: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['prayerTimes'] })}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mosque Selector */}
      <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
        <span className="text-sm font-medium text-emerald-800">🕌 Managing:</span>
        <Select value={adminMosque} onValueChange={setAdminMosque}>
          <SelectTrigger className="w-64 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MOSQUES.map(m => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold text-amber-800">Prayer Times Table</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2 border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700"
            onClick={() => setIsDeleteAllDialogOpen(true)}
          >
            <Trash className="h-4 w-4" />
            Delete All Data
          </Button>

          <DeleteAllPrayerTimesDialog
            isOpen={isDeleteAllDialogOpen}
            onOpenChange={setIsDeleteAllDialogOpen}
            mosque={adminMosque}
          />

          <Button
            variant="default"
            className="flex items-center gap-2"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Prayer Time
          </Button>

          <Button
            variant="outline"
            className="flex items-center gap-2 border-amber-200 hover:bg-amber-50 text-amber-700 hover:text-amber-800"
            onClick={handleCleanDuplicates}
            disabled={isCleaning}
          >
            {isCleaning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isCleaning ? 'Cleaning...' : 'Clean Duplicates'}
          </Button>

          <ImportPrayerTimesDialog
            isOpen={isImportDialogOpen}
            onOpenChange={setIsImportDialogOpen}
            mosque={adminMosque}
          />

          <AddEditPrayerTimeDialog
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            editingId={editingId}
            formData={formData}
            setFormData={setFormData}
            setEditingId={setEditingId}
          />
        </div>
      </div>

      <PrayerTimesTable
        prayerTimes={prayerTimes}
        onEdit={handleEdit}
        mosque={adminMosque}
      />

      <div className="text-xs text-muted-foreground mt-2">
        {prayerTimes.length > 0 && `Showing ${prayerTimes.length} prayer time entries`}
      </div>
    </div>
  );
};

export default PrayerTimesTableEditor;
