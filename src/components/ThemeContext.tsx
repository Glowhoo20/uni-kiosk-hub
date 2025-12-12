import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ThemeContextType {
    isNewYearTheme: boolean;
    isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({ isNewYearTheme: false, isLoading: true });

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [isNewYearTheme, setIsNewYearTheme] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initial fetch
        const fetchSettings = async () => {
            try {
                const { data } = await supabase
                    .from('app_settings' as any)
                    .select('value')
                    .eq('key', 'new_year_theme')
                    .single();

                if (data) {
                    const isActive = (data as any).value.isActive;
                    setIsNewYearTheme(isActive);
                    updateBodyClass(isActive);
                }
            } catch (error) {
                console.error('Error fetching theme settings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();

        // Realtime subscription
        const channel = supabase
            .channel('theme-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'app_settings',
                    filter: 'key=eq.new_year_theme'
                },
                (payload: any) => {
                    if (payload.new && payload.new.value) {
                        const isActive = payload.new.value.isActive;
                        setIsNewYearTheme(isActive);
                        updateBodyClass(isActive);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const updateBodyClass = (isActive: boolean) => {
        if (isActive) {
            document.body.classList.add('new-year-theme');
        } else {
            document.body.classList.remove('new-year-theme');
        }
    };

    return (
        <ThemeContext.Provider value={{ isNewYearTheme, isLoading }}>
            {children}
        </ThemeContext.Provider>
    );
};
