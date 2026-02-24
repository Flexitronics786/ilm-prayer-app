import { useQuery } from "@tanstack/react-query";
import { MOSQUES } from "@/contexts/MosqueContext";
import { fetchMosqueLatestDate } from "@/services/dataService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export const MosqueHealthStatus = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {MOSQUES.map(mosque => (
                <MosqueStatusCard key={mosque.id} mosque={mosque} />
            ))}
        </div>
    );
};

const MosqueStatusCard = ({ mosque }: { mosque: typeof MOSQUES[0] }) => {
    const { data: latestDate, isLoading, error } = useQuery({
        queryKey: ['mosque-latest-date', mosque.id],
        queryFn: () => fetchMosqueLatestDate(mosque.id),
    });

    if (isLoading) {
        return (
            <Card>
                <CardContent className="pt-6 flex justify-center items-center h-full min-h-[120px]">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="h-5 w-5" />
                        <span className="font-medium">Error loading status</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let daysRemaining = 0;
    let status: 'healthy' | 'warning' | 'critical' = 'critical';

    if (latestDate) {
        const lastDate = new Date(latestDate);
        const diffTime = lastDate.getTime() - today.getTime();
        daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        if (daysRemaining > 14) status = 'healthy';
        else if (daysRemaining > 3) status = 'warning';
        else status = 'critical';
    }

    const getStatusColor = (s: typeof status) => {
        switch (s) {
            case 'healthy': return "bg-green-100 text-green-700 border-green-200";
            case 'warning': return "bg-amber-100 text-amber-700 border-amber-200";
            case 'critical': return "bg-red-100 text-red-700 border-red-200";
        }
    };

    const getIcon = (s: typeof status) => {
        switch (s) {
            case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-600" />;
            case 'critical': return <XCircle className="h-5 w-5 text-red-600" />;
        }
    };

    return (
        <Card className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="pb-2 bg-gray-50/50 border-b">
                <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                    {mosque.name}
                    {latestDate && getIcon(status)}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="flex flex-col gap-1">
                    <div className="text-2xl font-bold flex items-baseline gap-2">
                        {latestDate ? (
                            <>
                                {daysRemaining}
                                <span className="text-sm font-normal text-muted-foreground">days data left</span>
                            </>
                        ) : (
                            <span className="text-red-500">No Data</span>
                        )}
                    </div>

                    {latestDate && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>Until {new Date(latestDate).toLocaleDateString()}</span>
                        </div>
                    )}

                    <Badge className={`mt-3 w-fit ${getStatusColor(status)} hover:${getStatusColor(status)}`}>
                        {status === 'healthy' && "Healthy"}
                        {status === 'warning' && "Expiring Soon"}
                        {status === 'critical' && (daysRemaining === 0 ? "Expired" : "Critical")}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
};
