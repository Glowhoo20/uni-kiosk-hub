import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Sparkles, Send } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
    message: z.string().min(2, "Mesaj en az 2 karakter olmalıdır").max(250, "Mesaj en fazla 250 karakter olabilir"),
    color: z.enum(["red", "gold", "green", "blue", "white", "purple", "orange"], {
        required_error: "Lütfen bir yıldız rengi seçin",
    }),
});

export default function DilekEklePage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [countdown, setCountdown] = useState<number | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            message: "",
            color: "red",
        },
    });

    // Actual submission logic
    async function submitWish(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const { error } = await supabase.from("wishes").insert({
                name: values.name,
                message: values.message,
                color: values.color,
            });

            if (error) throw error;

            setIsSuccess(true);
            toast.success("Dileğin gökyüzüne gönderildi!");
        } catch (error) {
            console.error("Error submitting wish:", error);
            toast.error("Bir hata oluştu, lütfen tekrar dene.");
        } finally {
            setIsSubmitting(false);
            setCountdown(null);
        }
    }

    // Handle button click - Start countdown
    function onSubmit(values: z.infer<typeof formSchema>) {
        setCountdown(3);

        // Countdown logic
        let count = 3;
        const interval = setInterval(() => {
            count--;
            setCountdown(count);

            if (count === 0) {
                clearInterval(interval);
                submitWish(values);
            }
        }, 1000);
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center">
                <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-12 h-12 text-green-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Harika!</h1>
                    <p className="text-slate-300 text-lg">
                        Dileğin başarıyla gönderildi.
                        <br />
                        Şimdi kiosk ekranına bak! 🎄
                    </p>
                    <Button
                        onClick={() => {
                            setIsSuccess(false);
                            form.reset();
                        }}
                        className="mt-8 bg-white text-slate-950 hover:bg-slate-200"
                    >
                        Yeni Dilek Ekle
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
            <div className="max-w-md mx-auto space-y-8">
                <div className="text-center space-y-2 pt-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Yılbaşı Dileği
                    </h1>
                    <p className="text-slate-400">
                        Yeni yıl dileğini yaz, gökyüzünü aydınlat!
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Adın / Takma Adın</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Örn: Gizemli Noel Baba" className="bg-slate-950 border-slate-800" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dileğin (Max 250 karakter)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Yeni yıldan beklentim..."
                                            className="bg-slate-950 border-slate-800 resize-none h-32"
                                            maxLength={250}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Yıldız Rengi Seç</FormLabel>
                                    <FormControl>
                                        <div className="flex flex-wrap gap-4 justify-center pt-2">
                                            {[
                                                { value: "red", color: "bg-red-500", label: "Kırmızı" },
                                                { value: "gold", color: "bg-amber-400", label: "Altın" },
                                                { value: "green", color: "bg-green-500", label: "Yeşil" },
                                                { value: "blue", color: "bg-blue-500", label: "Mavi" },
                                                { value: "white", color: "bg-white", label: "Beyaz" },
                                                { value: "purple", color: "bg-purple-500", label: "Mor" },
                                                { value: "orange", color: "bg-orange-500", label: "Turuncu" },
                                            ].map((option) => (
                                                <div key={option.value} className="text-center space-y-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => field.onChange(option.value)}
                                                        className={`w-12 h-12 rounded-full ${option.color} transition-all duration-200 ${field.value === option.value
                                                            ? "ring-4 ring-white scale-110 shadow-lg shadow-white/20"
                                                            : "opacity-60 hover:opacity-100 hover:scale-105"
                                                            }`}
                                                    />
                                                    <span className="text-xs text-slate-400 block">{option.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className={`w-full text-white font-bold py-6 text-lg shadow-lg transition-all duration-300 ${countdown !== null
                                ? "bg-slate-800 scale-105"
                                : "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-purple-900/20"
                                }`}
                            disabled={isSubmitting || countdown !== null}
                        >
                            {countdown !== null ? (
                                <span className="text-4xl animate-pulse">{countdown}</span>
                            ) : isSubmitting ? (
                                "Gönderiliyor..."
                            ) : (
                                <span className="flex items-center gap-2">
                                    Dileğini Gönder <Send className="w-5 h-5" />
                                </span>
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
