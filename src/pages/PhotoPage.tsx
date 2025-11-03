import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Camera, Download, Share2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import QRCode from 'react-qr-code';
import { supabase } from '@/integrations/supabase/client';

interface PhotoFrame {
  id: string;
  name: string;
  image_url: string;
  display_order: number;
}

export default function PhotoPage() {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [photoFrames, setPhotoFrames] = useState<PhotoFrame[]>([]);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [shareableImageUrl, setShareableImageUrl] = useState<string | null>(null);
  const [photoTimer, setPhotoTimer] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(null);
  const [frameAspectRatio, setFrameAspectRatio] = useState<number | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCountingDown && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isCountingDown && countdown === 0) {
      setIsCountingDown(false);
      takePhoto();
    }
    return () => clearInterval(interval);
  }, [isCountingDown, countdown]);

  useEffect(() => {
    fetchFrames();
  }, []);

  const fetchFrames = async () => {
    try {
      const { data, error } = await supabase
        .from('frames')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPhotoFrames(data || []);
    } catch (error) {
      console.error('Error fetching frames:', error);
    }
  };

  const nextFrame = () => {
    setCurrentFrame((prev) => (prev + 1) % photoFrames.length);
  };

  const prevFrame = () => {
    setCurrentFrame((prev) => (prev - 1 + photoFrames.length) % photoFrames.length);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      setStream(mediaStream);
      setCameraActive(true);
    } catch (error) {
      console.error('Kamera erişimi başarısız:', error);
      alert('Kamera erişimi için izin gerekli');
    }
  };

  // Kamerayı video elementine bağla ve oynat
  useEffect(() => {
    const video = videoRef.current;
    if (cameraActive && stream && video) {
      try {
        //
        video.srcObject = stream;
        const playPromise = video.play();
        if (playPromise && typeof (playPromise as any).catch === 'function') {
          (playPromise as Promise<void>).catch(() => {});
        }
        const handleLoadedMetadata = () => {
          if (video.videoWidth && video.videoHeight) {
            setVideoAspectRatio(video.videoWidth / video.videoHeight);
          }
        };
        video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
      } catch (e) {
        console.warn('Video oynatma başlatılamadı');
      }
    }
  }, [cameraActive, stream]);

  // Bileşen kapandığında kamerayı kapat
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  // Aktif çerçevenin en-boy oranını ölç
  useEffect(() => {
    const current = photoFrames[currentFrame];
    if (!current || !current.image_url) {
      setFrameAspectRatio(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setFrameAspectRatio(img.naturalWidth / img.naturalHeight);
      }
    };
    img.onerror = () => setFrameAspectRatio(null);
    img.src = current.image_url;
  }, [currentFrame, photoFrames]);

  const displayAspectRatio = frameAspectRatio || videoAspectRatio || 3 / 4;

  const startPhotoTimer = () => {
    if (photoTimer === 0) {
      takePhoto();
    } else {
      setCountdown(photoTimer);
      setIsCountingDown(true);
    }
  };

  const takePhoto = async () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (video && context && photoFrames.length > 0) {
      // Daha yüksek çözünürlük için 2x scale
      const scale = 2;
      const baseWidth = video.videoWidth || video.clientWidth;
      const baseHeight = video.videoHeight || video.clientHeight;
      canvas.width = baseWidth * scale;
      canvas.height = baseHeight * scale;

      // Video çiziminde aynalama uygula
      if (isMirrored) {
        context.save();
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }

      // Önce video görüntüsünü çiz
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Aynalama varsa geri al
      if (isMirrored) {
        context.restore();
      }

      // Çerçeveyi PNG olarak overlay et (aynalama olmadan)
      await applyFrameOverlay(context, canvas.width, canvas.height);

      const photoDataUrl = canvas.toDataURL('image/png');
      setPreviewImage(photoDataUrl);
      setPhotoTaken(true);

      // Kamerayı kapat
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
        setCameraActive(false);
      }
    }
  };

  const applyFrameOverlay = (context: CanvasRenderingContext2D, width: number, height: number): Promise<void> => {
    return new Promise((resolve) => {
      const currentFrameData = photoFrames[currentFrame];
      if (!currentFrameData) {
        resolve();
        return;
      }

      const frameImage = new Image();
      frameImage.crossOrigin = 'anonymous';
      frameImage.onload = () => {
        // Yüksek kaliteli çizim için imageSmoothingQuality ayarla
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        // Çerçeve resmini yüksek çözünürlükte çiz
        context.drawImage(frameImage, 0, 0, width, height);
        resolve();
      };
      frameImage.onerror = () => {
        console.error('Frame image failed to load');
        resolve();
      };
      frameImage.src = currentFrameData.image_url;
    });
  };

  const resetPhoto = () => {
    setPhotoTaken(false);
    setPreviewImage(null);
    setShowQR(false);
    setShareableImageUrl(null);
    // Kamerayı açık tut, sadece fotoğrafı sıfırla
    if (!cameraActive) {
      startCamera();
    }
  };

  const savePhoto = async () => {
    if (previewImage && photoFrames.length > 0) {
      try {
        // Tüm fotoğraflar 5 dakika sonra silinecek
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);
        
        const { error } = await supabase
          .from('saved_photos')
          .insert({
            image_data: previewImage,
            frame_name: photoFrames[currentFrame]?.name || 'DEÜ Klasik',
            frame_id: photoFrames[currentFrame]?.id || null,
          });

        if (error) throw error;
        
        // Fotoğrafı indirmek için de kullan
        const link = document.createElement('a');
        link.href = previewImage;
        link.download = `deu-ybs-hatira-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error saving photo:', error);
        alert('Fotoğraf kaydedilirken hata oluştu');
      }
    }
  };

  const saveAndSharePhoto = async () => {
    if (previewImage && photoFrames.length > 0) {
      try {
        setIsSharing(true);
        // 5 dakika sonra expire olacak tarih
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);
        
        const { data, error } = await supabase
          .from('saved_photos')
          .insert({
            image_data: previewImage,
            frame_name: photoFrames[currentFrame]?.name || 'DEÜ Klasik',
            frame_id: photoFrames[currentFrame]?.id || null,
            shared_at: new Date().toISOString(),
            share_expires_at: expiresAt.toISOString(),
            is_public: true,
          })
          .select()
          .single();

        if (error) throw error;
        
        // QR kod için URL oluştur
        const shareUrl = `${window.location.origin}/shared-photo?id=${data.id}`;
        setShareableImageUrl(shareUrl);
        setIsSharing(false);
        setShowQR(true);
      } catch (error) {
        console.error('Error saving and sharing photo:', error);
        setIsSharing(false);
        alert('Fotoğraf kaydedilip paylaşılırken hata oluştu');
      }
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-background via-secondary/20 to-background overflow-hidden flex flex-col p-2">
      <div className="max-w-6xl mx-auto w-full h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-1 flex-shrink-0">
          <h1 className="text-lg font-bold text-primary mb-0.5">Hatıra Fotoğrafı</h1>
          <p className="text-[10px] text-muted-foreground">
            Dokuz Eylül Üniversitesi YBS bölümünde özel anınızı ölümsüzleştirin
          </p>
        </div>

        {/* Main Photo Area */}
        <Card className="mb-1 p-1.5 bg-gradient-to-br from-card to-secondary/10 shadow-lg flex-shrink min-h-0" style={{ flexBasis: '65%' }}>
          <div className="w-full h-full max-w-4xl mx-auto bg-gradient-to-br from-muted/50 to-background rounded-xl flex items-center justify-center overflow-hidden">
            {photoTaken && previewImage ? (
              <div className="w-full h-full relative flex items-center justify-center">
                <div className="relative max-w-full max-h-full w-full" style={{ aspectRatio: displayAspectRatio }}>
                <img 
                  src={previewImage} 
                  alt="Preview" 
                    className="absolute inset-0 w-full h-full object-contain rounded-lg"
                />
                  <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-lg text-xs font-medium">
                    {photoFrames[currentFrame]?.name || 'Çerçeve'}
                  </div>
                </div>
              </div>
            ) : cameraActive ? (
              <div className="w-full h-full relative flex items-center justify-center">
                {/* Fixed inner wrapper so effects don't change outer frame size */}
                <div className="relative max-w-full max-h-full w-full" style={{ aspectRatio: displayAspectRatio }}>
                  {/* Camera box: constrain effects to this box only */}
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg">
                    <video
                      id="camera-video"
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={cn("w-full h-full object-contain rounded-lg transform-gpu")}
                      style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
                    />
                    {photoFrames[currentFrame] && (
                      <img
                        src={photoFrames[currentFrame].image_url}
                        alt="Frame overlay"
                        className="pointer-events-none absolute inset-0 w-full h-full object-contain rounded-lg opacity-50"
                      />
                    )}
                    {isCountingDown && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                        <div className="text-6xl font-bold text-white">
                          {countdown}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-lg text-xs font-medium">
                    {photoFrames[currentFrame]?.name || 'Çerçeve'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Camera className="w-16 h-16 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xl text-muted-foreground">
                  Fotoğraf Önizleme Alanı
                </p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  {photoFrames[currentFrame]?.name || 'Çerçeve seçili'} çerçevesi seçili
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Controls */}
        <div className="flex flex-col items-center space-y-1.5 flex-shrink-0">
          {/* Frame Selection */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevFrame}
              className="w-8 h-8 rounded-full p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="text-center min-w-[120px]">
              <h3 className="text-base font-semibold text-primary mb-0.5">
                {photoFrames[currentFrame]?.name || 'Çerçeve Yok'}
              </h3>
              <div className="flex justify-center space-x-1">
                {photoFrames.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      index === currentFrame
                        ? "bg-primary scale-125"
                        : "bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={nextFrame}
              className="w-8 h-8 rounded-full p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1.5">
            {!photoTaken ? (
              !cameraActive ? (
                <Button
                  onClick={startCamera}
                  size="sm"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover text-sm px-4 py-3 rounded-lg shadow-lg"
                >
                  <Camera className="w-4 h-4 mr-1.5" />
                  Kamerayı Aç
                </Button>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  {/* Timer Selection */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">Gecikme:</span>
                    {[0, 3, 5, 10].map((seconds) => (
                      <Button
                        key={seconds}
                        variant={photoTimer === seconds ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPhotoTimer(seconds)}
                        className="w-8 h-6 text-[10px] p-0"
                      >
                        {seconds}s
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={startPhotoTimer}
                      disabled={isCountingDown}
                      size="sm"
                      className="bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover text-sm px-4 py-3 rounded-lg shadow-lg"
                    >
                      <Camera className="w-4 h-4 mr-1.5" />
                      {isCountingDown ? `${countdown}...` : photoTimer === 0 ? 'Fotoğraf Çek' : `${photoTimer}s Sonra Çek`}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsMirrored((v) => !v)}
                      className="text-xs px-2 py-3"
                    >
                      {isMirrored ? 'Aynalamayı Kapat' : 'Aynala'}
                    </Button>
                  </div>
                </div>
              )
            ) : (
              <>
                <Button
                  onClick={resetPhoto}
                  variant="outline"
                  size="sm"
                  className="text-xs px-3 py-3"
                >
                  Yeniden Çek
                </Button>
                <Button
                  onClick={savePhoto}
                  size="sm"
                  variant="outline"
                  className="text-xs px-3 py-3"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Kaydet
                </Button>
                <Button
                  onClick={saveAndSharePhoto}
                  size="sm"
                  variant="outline"
                  className="text-xs px-3 py-3"
                >
                  <Share2 className="w-3 h-3 mr-1" />
                  Kaydet ve Paylaş
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Loading Dialog */}
      <Dialog open={isSharing} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xl font-semibold text-primary">
              Fotoğraf Paylaşılıyor...
            </p>
            <p className="text-sm text-muted-foreground text-center">
              QR kod oluşturuluyor, lütfen bekleyin
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Fotoğrafı Paylaş</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 p-4">
            <p className="text-sm text-muted-foreground text-center">
              Bu QR kodu telefonunuz ile okutarak fotoğrafı mobil cihazınıza indirebilirsiniz (5 dakika geçerli)
            </p>
            {shareableImageUrl && (
              <div className="bg-white p-4 rounded-lg">
                <QRCode value={shareableImageUrl} size={200} />
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center max-w-sm">
              QR kodu telefonunuzun kamerası ile okutun ve açılan sayfadan "Fotoğrafı İndir" butonuna tıklayın
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}