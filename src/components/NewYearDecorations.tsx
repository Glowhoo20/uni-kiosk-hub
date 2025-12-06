import { useTheme } from './ThemeContext';
import { Trees, Gift, CloudSnow, Star } from 'lucide-react';

export const NewYearDecorations = () => {
    const { isNewYearTheme } = useTheme();

    if (!isNewYearTheme) return null;

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {/* --- OUTDOOR SCENE (The View) --- */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#334155]">

                {/* Moon & Stars */}
                <div className="absolute top-10 right-20 text-yellow-100 opacity-80">
                    <div className="w-16 h-16 rounded-full bg-yellow-100 blur-sm opacity-50 absolute"></div>
                    <div className="w-16 h-16 rounded-full bg-yellow-50 relative"></div>
                </div>
                {[...Array(10)].map((_, i) => (
                    <Star
                        key={i}
                        size={Math.random() * 10 + 5}
                        className="absolute text-white opacity-60 animate-pulse"
                        style={{
                            top: `${Math.random() * 40}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`
                        }}
                    />
                ))}

                {/* Snowy Ground */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white to-slate-200 rounded-t-[50%] transform scale-x-150 translate-y-10"></div>

                {/* Tree Outside */}
                <div className="absolute bottom-24 left-1/4 text-[#14532d] transform -translate-x-1/2">
                    <Trees size={300} strokeWidth={1} className="fill-[#166534] drop-shadow-2xl" />
                    {/* Snow on tree */}
                    <div className="absolute top-10 left-10 w-20 h-10 bg-white rounded-full opacity-80 blur-md"></div>
                </div>

                {/* Snowman Outside */}
                <div className="absolute bottom-32 right-1/3 transform translate-x-1/2 flex flex-col items-center">
                    {/* Head */}
                    <div className="w-16 h-16 bg-white rounded-full relative shadow-lg z-20">
                        <div className="absolute top-5 left-4 w-2 h-2 bg-black rounded-full"></div> {/* Eye */}
                        <div className="absolute top-5 right-4 w-2 h-2 bg-black rounded-full"></div> {/* Eye */}
                        <div className="absolute top-8 left-1/2 w-3 h-3 bg-orange-500 rounded-full transform -translate-x-1/2 translate-y-1"></div> {/* Nose */}
                    </div>
                    {/* Body */}
                    <div className="w-24 h-24 bg-white rounded-full -mt-4 shadow-lg z-10 relative">
                        <div className="absolute top-8 left-1/2 w-2 h-2 bg-black rounded-full transform -translate-x-1/2"></div> {/* Button */}
                        <div className="absolute top-14 left-1/2 w-2 h-2 bg-black rounded-full transform -translate-x-1/2"></div> {/* Button */}
                    </div>
                    {/* Base */}
                    <div className="w-32 h-32 bg-white rounded-full -mt-6 shadow-lg z-0"></div>
                </div>

                {/* Falling Snow Animation */}
                <div className="absolute inset-0">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute bg-white rounded-full opacity-80 animate-fall"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-20px`,
                                width: `${Math.random() * 8 + 4}px`,
                                height: `${Math.random() * 8 + 4}px`,
                                animationDuration: `${Math.random() * 5 + 5}s`,
                                animationDelay: `${Math.random() * 5}s`,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* --- INDOOR OVERLAY (The Window & Room) --- */}

            {/* Window Frame Vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_150px_100px_rgba(20,10,5,0.9)] z-10"></div>

            {/* Warm Yellow Light Overlay (Cozy Atmosphere) */}
            <div className="absolute inset-0 bg-orange-500/10 mix-blend-overlay z-20 pointer-events-none"></div>

            {/* String Lights at Top */}
            <div className="absolute top-0 left-0 right-0 flex justify-around z-30">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="relative">
                        <div className="w-1 h-8 bg-gray-800 mx-auto"></div>
                        <div className={`w-4 h-6 rounded-full shadow-[0_0_20px_5px_rgba(255,200,0,0.6)] ${i % 2 === 0 ? 'bg-yellow-200' : 'bg-orange-200'} animate-pulse`} style={{ animationDelay: `${i * 0.2}s` }}></div>
                    </div>
                ))}
            </div>

            {/* Gifts in the Room (Foreground) */}
            <div className="absolute bottom-24 left-10 z-30 animate-bounce duration-[2000ms]">
                <Gift size={64} className="text-red-600 fill-red-100 drop-shadow-2xl" />
            </div>
            <div className="absolute bottom-24 right-10 z-30 animate-bounce duration-[2500ms]">
                <Gift size={56} className="text-green-600 fill-green-100 drop-shadow-2xl" />
            </div>
        </div>
    );
};
