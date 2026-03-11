import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays, startOfDay, endOfDay, differenceInMinutes } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Activity, AlertTriangle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface HeartbeatData {
    hour: string;
    activeMinutes: number;
}

interface Disconnection {
    start: string;
    end: string;
    durationMinutes: number;
}

export const KioskStatusManager = () => {
    const [data, setData] = useState<HeartbeatData[]>([]);
    const [disconnections, setDisconnections] = useState<Disconnection[]>([]);
    const [selectedDaysAgo, setSelectedDaysAgo] = useState('0');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHeartbeats(parseInt(selectedDaysAgo));
    }, [selectedDaysAgo]);

    const fetchHeartbeats = async (daysAgo: number) => {
        setLoading(true);
        try {
            const targetDate = subDays(new Date(), daysAgo);
            const start = startOfDay(targetDate).toISOString();
            const end = endOfDay(targetDate).toISOString();

            const { data: heartbeats, error } = await supabase
                .from('kiosk_heartbeats')
                .select('*')
                .gte('created_at', start)
                .lte('created_at', end)
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Initialize all 24 hours with 0
            const hourlyData: { [key: string]: number } = {};
            for (let i = 0; i < 24; i++) {
                hourlyData[`${i.toString().padStart(2, '0')}:00`] = 0;
            }

            // Each heartbeat represents approx 5 minutes of activity
            heartbeats?.forEach((hb) => {
                const date = new Date(hb.created_at);
                const hourKey = `${date.getHours().toString().padStart(2, '0')}:00`;
                // Cap at 12 heartbeats (60 minutes) per hour to avoid overlapping weirdness over 60
                if (hourlyData[hourKey] < 12) {
                    hourlyData[hourKey] += 1;
                }
            });

            const formattedData: HeartbeatData[] = Object.keys(hourlyData).map((hour) => ({
                hour,
                activeMinutes: hourlyData[hour] * 5, // 5 minutes per heartbeat
            }));

            setData(formattedData);

            // Calculate disconnections
            const newDisconnections: Disconnection[] = [];
            if (heartbeats && heartbeats.length > 0) {
                for (let i = 1; i < heartbeats.length; i++) {
                    const prevHb = new Date(heartbeats[i - 1].created_at);
                    const currHb = new Date(heartbeats[i].created_at);
                    const diffMinutes = differenceInMinutes(currHb, prevHb);

                    // If gap is more than 6 minutes (interval is 5 mins, allow 1 min margin)
                    if (diffMinutes > 6) {
                        newDisconnections.push({
                            start: format(prevHb, 'HH:mm:ss'),
                            end: format(currHb, 'HH:mm:ss'),
                            durationMinutes: diffMinutes,
                        });
                    }
                }

                // If viewing today, check if it's currently disconnected
                if (daysAgo === 0) {
                    const lastHb = new Date(heartbeats[heartbeats.length - 1].created_at);
                    const now = new Date();
                    const diffMinutes = differenceInMinutes(now, lastHb);

                    if (diffMinutes > 6) {
                        newDisconnections.push({
                            start: format(lastHb, 'HH:mm:ss'),
                            end: 'Şu an',
                            durationMinutes: diffMinutes,
                        });
                    }
                }
            } else if (daysAgo === 0) {
                // No heartbeats today, totally offline
                newDisconnections.push({
                    start: '00:00:00',
                    end: 'Şu an',
                    durationMinutes: differenceInMinutes(new Date(), startOfDay(new Date())),
                });
            }
            // Reverse so most recent disconnections are first
            setDisconnections(newDisconnections.reverse());
        } catch (error) {
            console.error('Error fetching heartbeats:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectedDate = subDays(new Date(), parseInt(selectedDaysAgo));
    const isToday = selectedDaysAgo === '0';

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Kiosk Aktiflik Durumu
                    </CardTitle>
                    <CardDescription>
                        Kioskun açık ve çalışır durumda olduğu saatleri gösterir. (Her sütun ilgili saatteki aktif dakikayı ifade eder)
                    </CardDescription>
                </div>
                <Select value={selectedDaysAgo} onValueChange={setSelectedDaysAgo}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Tarih seçin" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0">Bugün</SelectItem>
                        <SelectItem value="1">Dün</SelectItem>
                        <SelectItem value="2">{format(subDays(new Date(), 2), 'EEEE', { locale: tr })}</SelectItem>
                        <SelectItem value="3">{format(subDays(new Date(), 3), 'EEEE', { locale: tr })}</SelectItem>
                        <SelectItem value="4">{format(subDays(new Date(), 4), 'EEEE', { locale: tr })}</SelectItem>
                        <SelectItem value="5">{format(subDays(new Date(), 5), 'EEEE', { locale: tr })}</SelectItem>
                        <SelectItem value="6">{format(subDays(new Date(), 6), 'EEEE', { locale: tr })}</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className="mb-4 text-sm text-muted-foreground">
                    Gösterilen Tarih: <span className="font-semibold text-foreground">{format(selectedDate, 'dd MMMM yyyy', { locale: tr })}</span> {isToday && '(Bugün)'}
                </div>
                <div className="h-[400px] w-full items-center justify-center flex">
                    {loading ? (
                        <div className="animate-pulse flex items-center gap-2 text-muted-foreground">
                            <Activity className="w-5 h-5 animate-spin" /> Veriler Yükleniyor...
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="hour"
                                    tick={{ fill: 'hsl(var(--foreground))' }}
                                    tickLine={{ stroke: 'hsl(var(--border))' }}
                                    axisLine={{ stroke: 'hsl(var(--border))' }}
                                    fontSize={12}
                                />
                                <YAxis
                                    domain={[0, 60]}
                                    ticks={[0, 15, 30, 45, 60]}
                                    tick={{ fill: 'hsl(var(--foreground))' }}
                                    tickLine={{ stroke: 'hsl(var(--border))' }}
                                    axisLine={{ stroke: 'hsl(var(--border))' }}
                                    fontSize={12}
                                    unit=" dk"
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                                    formatter={(value: number) => [`${value} dakika`, 'Aktif Süre']}
                                    labelFormatter={(label) => `Saat: ${label}`}
                                />
                                <Bar dataKey="activeMinutes" radius={[4, 4, 0, 0]}>
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.activeMinutes > 45 ? 'hsl(var(--primary))' : entry.activeMinutes > 15 ? 'hsl(var(--chart-2))' : 'hsl(var(--muted-foreground))'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {!loading && disconnections.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                            Tespit Edilen Bağlantı Kesintileri
                        </h3>
                        <div className="space-y-3">
                            {disconnections.map((disc, idx) => (
                                <Alert key={idx} variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                                    <Clock className="w-4 h-4" />
                                    <AlertTitle className="mb-1 text-base">Bağlantı Koptu</AlertTitle>
                                    <AlertDescription>
                                        Kiosk <strong>{disc.start}</strong> ile <strong>{disc.end}</strong> arasında toplam <strong>{disc.durationMinutes} dakika</strong> boyunca kapalı kaldı veya bağlantısı kesildi.
                                    </AlertDescription>
                                </Alert>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default KioskStatusManager;
