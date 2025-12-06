import { useEffect, useState, useMemo, Suspense, useRef } from "react";
import QRCode from "react-qr-code";
import { supabase } from "@/integrations/supabase/client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Text, Float, Sparkles as Sparkles3D, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { toast } from "sonner";

interface Wish {
    id: string;
    message: string;
    color: string;
    name: string;
    position?: [number, number, number];
    isNew?: boolean; // Flag to trigger Big Bang effect
}

// Big Bang Effect Component
const BigBangEffect = ({ delay = 0 }: { delay?: number }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const lightRef = useRef<THREE.PointLight>(null);
    const [finished, setFinished] = useState(false);
    const timeElapsed = useRef(0);

    useFrame((state, delta) => {
        if (finished) return;

        timeElapsed.current += delta;

        // Wait for delay
        if (timeElapsed.current < delay) return;

        if (meshRef.current) {
            // Expand rapidly
            const scale = meshRef.current.scale.x + delta * 15;
            meshRef.current.scale.set(scale, scale, scale);

            // Fade out
            const material = meshRef.current.material as THREE.MeshBasicMaterial;
            material.opacity -= delta * 2;

            if (material.opacity <= 0) {
                setFinished(true);
            }
        }

        if (lightRef.current) {
            // Flash and fade
            lightRef.current.intensity -= delta * 20;
        }
    });

    if (finished) return null;

    // Hide until delay is over
    const visible = timeElapsed.current >= delay;

    return (
        <group visible={visible}>
            {/* Shockwave Sphere */}
            <mesh ref={meshRef} scale={[0.1, 0.1, 0.1]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial color="white" transparent opacity={1} toneMapped={false} />
            </mesh>
            {/* Bright Flash */}
            <pointLight ref={lightRef} intensity={20} distance={20} color="white" />
            {/* Particle Burst */}
            <Sparkles3D count={50} scale={10} size={5} speed={2} opacity={1} color="#FFF" />
        </group>
    );
};

// Helper to create a 5-pointed star shape
const createStarShape = (outerRadius: number = 0.5, innerRadius: number = 0.25) => {
    const shape = new THREE.Shape();
    const points = 5;
    const step = Math.PI / points;

    shape.moveTo(0, outerRadius);

    for (let i = 0; i < 2 * points; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const a = i * step;
        shape.lineTo(Math.sin(a) * radius, Math.cos(a) * radius);
    }

    shape.closePath();
    return shape;
};

// Camera Controller for Zoom Effect
const CameraController = ({ targetPosition }: { targetPosition: [number, number, number] | null }) => {
    const { camera, gl } = useThree();
    const controlsRef = useRef<any>(null);
    const isAnimating = useRef(false);

    useEffect(() => {
        if (targetPosition) {
            isAnimating.current = true;
        }
    }, [targetPosition]);

    useFrame((state, delta) => {
        if (targetPosition && controlsRef.current && isAnimating.current) {
            const targetVec = new THREE.Vector3(...targetPosition);

            // Calculate a position slightly offset from the target to look at it
            // We want to be close enough to see details but not inside it
            // Position camera along the vector from origin to star, but 8 units closer to origin
            const direction = targetVec.clone().normalize();
            const distance = targetVec.length();
            const desiredDistance = Math.max(distance - 8, 5); // Ensure we don't go too close to origin
            const desiredPosition = direction.multiplyScalar(desiredDistance);

            // Lerp camera position - Faster speed (5 * delta)
            const step = 5 * delta;
            state.camera.position.lerp(desiredPosition, step);

            // Lerp controls target to look at the wish
            controlsRef.current.target.lerp(targetVec, step);
            controlsRef.current.update();

            // Stop animating when close enough, allowing user to take control
            if (state.camera.position.distanceTo(desiredPosition) < 0.5) {
                isAnimating.current = false;
            }
        }
    });

    return (
        <OrbitControls
            ref={controlsRef}
            enablePan={false}
            minPolarAngle={0}
            maxPolarAngle={Math.PI} // Allow full rotation for sky
            minDistance={2}
            maxDistance={50}
            autoRotate={!targetPosition} // Stop rotating when focusing
            autoRotateSpeed={0.5}
        />
    );
};

// StarWish Component
const StarWish = ({
    position,
    color,
    message,
    name,
    isNew,
    onClick
}: {
    position: [number, number, number],
    color: string,
    message: string,
    name: string,
    isNew?: boolean,
    onClick: () => void
}) => {
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef<THREE.Mesh>(null);
    const timeElapsed = useRef(0);
    const ANIMATION_DELAY = 0.8; // Wait 0.8s for camera to zoom
    const SCALE_DURATION = 1.0; // Scale up over 1s

    const meshColor = useMemo(() => {
        switch (color) {
            case "red": return "#ef4444";
            case "gold": return "#eab308";
            case "green": return "#22c55e";
            case "blue": return "#3b82f6";
            case "purple": return "#a855f7";
            default: return "#ffffff";
        }
    }, [color]);

    const glowTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.5)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 128, 128);
        }
        return new THREE.CanvasTexture(canvas);
    }, []);

    const [animationDone, setAnimationDone] = useState(!isNew);

    useFrame((state, delta) => {
        if (!animationDone && isNew && meshRef.current) {
            timeElapsed.current += delta;

            if (timeElapsed.current > ANIMATION_DELAY + SCALE_DURATION) {
                setAnimationDone(true);
            } else if (timeElapsed.current > ANIMATION_DELAY) {
                const progress = (timeElapsed.current - ANIMATION_DELAY) / SCALE_DURATION;
                const scale = Math.min(progress * 1.5, 1.5);
                meshRef.current.scale.set(scale, scale, scale);
            } else {
                meshRef.current.scale.set(0, 0, 0);
            }
        }
    });

    return (
        <group position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
            {isNew && <BigBangEffect delay={ANIMATION_DELAY} />}

            {/* Glow Effect - Always visible once animated */}
            {animationDone && (
                <group>
                    <Billboard>
                        <mesh scale={[4, 4, 1]}>
                            <planeGeometry />
                            <meshBasicMaterial
                                map={glowTexture}
                                transparent
                                opacity={0.6}
                                color={meshColor}
                                blending={THREE.AdditiveBlending}
                                depthWrite={false}
                                toneMapped={false}
                            />
                        </mesh>
                    </Billboard>
                    <Sparkles3D count={6} scale={2.5} size={4} speed={0.5} opacity={0.8} color="#FFF" />
                </group>
            )}

            <Float speed={animationDone ? 1 : 0} rotationIntensity={animationDone ? 1 : 0} floatIntensity={animationDone ? 0.5 : 0}>
                <mesh
                    ref={meshRef}
                    onPointerOver={() => setHovered(true)}
                    onPointerOut={() => setHovered(false)}
                    scale={animationDone ? (hovered ? 2.5 : 1.5) : 0}
                >
                    <sphereGeometry args={[0.4, 32, 32]} />
                    <meshStandardMaterial
                        color={meshColor}
                        emissive={meshColor}
                        emissiveIntensity={4}
                        toneMapped={false}
                        roughness={0.1}
                        metalness={0.8}
                    />
                </mesh>
            </Float>
            {hovered && animationDone && (
                <group position={[0, -1.5, 0]}>
                    <Text
                        fontSize={0.8}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.05}
                        outlineColor="black"
                    >
                        {name}
                    </Text>
                </group>
            )}
        </group>
    );
};

export default function ChristmasTreePage() {
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
    const [focusTarget, setFocusTarget] = useState<[number, number, number] | null>(null);

    // Generate random position in the sky (Sky Dome)
    const getRandomPositionInSky = (): [number, number, number] => {
        const radius = 15 + Math.random() * 25; // 15 to 40 units away
        const phi = Math.random() * Math.PI; // Full sphere
        const theta = Math.random() * Math.PI * 2;

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        return [x, y, z];
    };

    useEffect(() => {
        const fetchWishes = async () => {
            const { data } = await supabase
                .from("wishes")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(100);

            if (data) {
                const wishesWithPos = data.map((wish: any) => ({
                    ...wish,
                    position: getRandomPositionInSky(),
                    isNew: false // Existing wishes don't explode
                }));
                setWishes(wishesWithPos);
            }
        };

        fetchWishes();

        const channel = supabase
            .channel("public:wishes")
            .on(
                "postgres_changes",
                {
                    event: "*", // Listen to all events
                    schema: "public",
                    table: "wishes",
                },
                (payload) => {
                    if (payload.eventType === "INSERT") {
                        const newWish = payload.new as Wish;
                        const position = getRandomPositionInSky();
                        const wishWithPos = { ...newWish, position, isNew: true };

                        setWishes((prev) => [wishWithPos, ...prev]);

                        // Show toast notification
                        toast.success(`Yeni bir dilek geldi: ${newWish.name}`, {
                            position: "top-center",
                            duration: 3000,
                        });

                        // Auto-focus on new wish
                        setFocusTarget(position);
                        setSelectedWish(wishWithPos);

                        // Reset focus after 8 seconds (longer to enjoy view)
                        setTimeout(() => {
                            setFocusTarget(null);
                        }, 8000);
                    } else if (payload.eventType === "DELETE") {
                        const deletedId = payload.old.id;
                        setWishes((prev) => prev.filter((w) => w.id !== deletedId));
                        if (selectedWish?.id === deletedId) {
                            setSelectedWish(null);
                            setFocusTarget(null);
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleRandomWish = () => {
        const colors = ["red", "gold", "green", "blue", "purple"];
        const names = ["Ahmet", "Mehmet", "Ayşe", "Fatma", "Ali", "Veli", "Zeynep", "Can"];
        const messages = [
            "Mutlu Yıllar!",
            "Her şey gönlünce olsun",
            "Sağlık ve huzur dolu bir yıl",
            "Yeni yıl kutlu olsun",
            "Başarılar seninle olsun",
            "Harika bir sene olsun",
            "Nice mutlu senelere"
        ];

        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        const position = getRandomPositionInSky();

        const newWish: Wish = {
            id: Math.random().toString(36).substr(2, 9),
            name: randomName,
            message: randomMessage,
            color: randomColor,
            position: position,
            isNew: true // Trigger Big Bang
        };

        setWishes((prev) => [newWish, ...prev]);

        // Auto-focus on new wish
        setFocusTarget(position);
        setSelectedWish(newWish);

        // Reset focus after 5 seconds
        setTimeout(() => {
            setFocusTarget(null);
        }, 5000);
    };

    const handleWishClick = (wish: Wish) => {
        setSelectedWish(wish);
        if (wish.position) {
            setFocusTarget(wish.position);
            // Keep focus until clicked elsewhere or another interaction
        }
    };

    const handleReadWish = () => {
        if (wishes.length === 0) {
            toast.error("Henüz hiç dilek yok! İlk dileği sen tut 🌠", {
                position: "top-center"
            });
            return;
        }

        // Filter wishes that have a position (visible stars)
        let visibleWishes = wishes.filter(w => w.position);
        if (visibleWishes.length === 0) return;

        // If we have more than 1 wish and one is already selected, exclude the current one
        // to ensure we always jump to a DIFFERENT star.
        if (selectedWish && visibleWishes.length > 1) {
            visibleWishes = visibleWishes.filter(w => w.id !== selectedWish.id);
        }

        const randomWish = visibleWishes[Math.floor(Math.random() * visibleWishes.length)];

        // Focus on the wish
        handleWishClick(randomWish);
    };

    return (
        <div className="absolute inset-0 w-full bg-slate-950 overflow-hidden">
            {/* 3D Scene - Reduced z-index to allow bottom nav interaction */}
            <div className="absolute inset-0 z-0">
                <Canvas
                    camera={{ position: [0, 0, 20], fov: 60 }}
                    onPointerMissed={() => { setSelectedWish(null); setFocusTarget(null); }}
                >
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />

                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <Sparkles3D count={500} scale={40} size={2} speed={0.4} opacity={0.3} color="#ffffff" />

                    <Suspense fallback={null}>
                        {wishes.map((wish) => (
                            wish.position && (
                                <StarWish
                                    key={wish.id}
                                    position={wish.position}
                                    color={wish.color}
                                    message={wish.message}
                                    name={wish.name}
                                    isNew={wish.isNew}
                                    onClick={() => handleWishClick(wish)}
                                />
                            )
                        ))}
                    </Suspense>

                    <CameraController targetPosition={focusTarget} />
                </Canvas>
            </div>

            {/* Right Side Panel - QR Code & Details */}
            <div className="absolute top-8 right-8 z-20 flex flex-col items-center space-y-6 w-80 pointer-events-none">
                {/* QR Code Card */}
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border-2 border-white/20 shadow-2xl transform transition-transform duration-300 pointer-events-auto">
                    <div className="bg-white p-2 rounded-xl">
                        <QRCode
                            value={`${window.location.origin}/dilek-ekle`}
                            size={150}
                            viewBox={`0 0 256 256`}
                        />
                    </div>
                    <p className="text-white font-bold text-center mt-4 text-lg drop-shadow-md">
                        Telefondan Yaz,<br />Gökyüzüne Gönder!
                    </p>
                </div>

                {/* Selected Wish Detail Panel */}
                {selectedWish && (
                    <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl w-full animate-in slide-in-from-right fade-in duration-300 pointer-events-auto">
                        <div className="flex items-center space-x-3 mb-3">
                            <div
                                className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]"
                                style={{ backgroundColor: selectedWish.color === 'white' ? '#fff' : selectedWish.color }}
                            />
                            <h3 className="text-xl font-bold text-white">{selectedWish.name}</h3>
                        </div>
                        <p className="text-slate-300 text-lg leading-relaxed italic">
                            "{selectedWish.message}"
                        </p>
                    </div>
                )}
            </div>

            {/* Buttons - Bottom Right */}
            <div className="absolute bottom-40 right-8 z-30 pointer-events-auto">
                <button
                    onClick={handleReadWish}
                    className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full backdrop-blur-md transition-all hover:scale-105 border border-white/20 font-semibold shadow-lg flex items-center gap-2 text-lg"
                >
                    ✨ Rastgele Yıldız
                </button>
            </div>

            {/* Title Overlay - Top Left */}
            <div className="absolute top-8 left-8 z-20 pointer-events-none">
                <h1 className="text-6xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] tracking-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                        Dilek Yıldızları
                    </span>
                </h1>
            </div>
        </div>
    );
}
