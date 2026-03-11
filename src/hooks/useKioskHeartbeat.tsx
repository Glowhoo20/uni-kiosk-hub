import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useKioskHeartbeat = (kioskId: string = 'main') => {
    useEffect(() => {
        // Send a heartbeat immediately on mount
        const sendHeartbeat = async () => {
            try {
                await supabase.from('kiosk_heartbeats').insert([{ kiosk_id: kioskId }]);
            } catch (error) {
                console.error('Error sending kiosk heartbeat:', error);
            }
        };

        sendHeartbeat();

        // Set up an interval to send a heartbeat every 5 minutes
        const intervalId = setInterval(sendHeartbeat, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [kioskId]);
};
