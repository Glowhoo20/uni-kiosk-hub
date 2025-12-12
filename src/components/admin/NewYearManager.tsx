import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const NewYearManager = () => {
    const [isThemeActive, setIsThemeActive] = useState(false);
    const [wishes, setWishes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [wishToDelete, setWishToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
        fetchWishes();
    }, []);

    const fetchSettings = async () => {
        const { data, error } = await supabase
            .from('app_settings' as any)
            .select('value')
            .eq('key', 'new_year_theme')
            .single();

        if (data) {
            setIsThemeActive((data as any).value.isActive);
        }
    };

    const fetchWishes = async () => {
        const { data, error } = await supabase
            .from('wishes')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) {
            setWishes(data);
        }
        setLoading(false);
    };

    const toggleTheme = async (checked: boolean) => {
        setIsThemeActive(checked);
        const { error } = await supabase
            .from('app_settings' as any)
            .upsert({ key: 'new_year_theme', value: { isActive: checked } });

        if (error) {
            toast.error("Ayarlar güncellenemedi");
            setIsThemeActive(!checked); // Revert
        } else {
            toast.success(checked ? "Yeniyıl teması aktif edildi" : "Yeniyıl teması kapatıldı");
        }
    };

    const deleteWish = async (id: string) => {
        const { error } = await supabase
            .from('wishes')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error("Dilek silinemedi");
        } else {
            toast.success("Dilek silindi");
            setWishes(wishes.filter(w => w.id !== id));
        }
        setWishToDelete(null);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Genel Ayarlar</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <label className="text-base font-medium">Yeniyıl Teması</label>
                            <p className="text-sm text-muted-foreground">
                                Aktif edildiğinde ana menüde "Yeniyıl Dilekleri" sayfası görünür.
                            </p>
                        </div>
                        <Switch
                            checked={isThemeActive}
                            onCheckedChange={toggleTheme}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Dilekler ({wishes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>İsim</TableHead>
                                    <TableHead>Mesaj</TableHead>
                                    <TableHead>Tarih</TableHead>
                                    <TableHead className="w-[100px]">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {wishes.map((wish) => (
                                    <TableRow key={wish.id}>
                                        <TableCell className="font-medium">{wish.name}</TableCell>
                                        <TableCell>{wish.message}</TableCell>
                                        <TableCell>{new Date(wish.created_at).toLocaleString('tr-TR')}</TableCell>
                                        <TableCell>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => setWishToDelete(wish.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Dileği silmek istediğine emin misin?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Bu işlem geri alınamaz. Dilek kalıcı olarak silinecektir.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel onClick={() => setWishToDelete(null)}>İptal</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => deleteWish(wish.id)}>Sil</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {wishes.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            Henüz hiç dilek yok.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default NewYearManager;
