import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnnouncementsManager } from '@/components/admin/AnnouncementsManager';
import { SurveysManager } from '@/components/admin/SurveysManager';
import { FacultyManager } from '@/components/admin/FacultyManager';
import { ScheduleManager } from '@/components/admin/ScheduleManager';
import FrameManager from '@/components/admin/FrameManager';
import SavedPhotosManager from '@/components/admin/SavedPhotosManager';
import FacultyImporter from '@/components/admin/FacultyImporter';
import ProtectedRoute from '@/components/ProtectedRoute'; // Yeni komponenti import ediyoruz
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import MapManager from '@/components/admin/MapManager';
import { Camera } from 'lucide-react';

// Mevcut AdminPage içeriğinizi ayrı bir komponente taşıyoruz
const AdminPanelContent = () => {
  const [activeTab, setActiveTab] = useState('announcements');
  const [totalPhotos, setTotalPhotos] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPhotoCount();
  }, []);

  const fetchPhotoCount = async () => {
    try {
      const { data, error } = await supabase
        .from('photo_statistics')
        .select('total_photos_taken')
        .single();

      if (error) throw error;
      setTotalPhotos(data?.total_photos_taken || 0);
    } catch (error) {
      console.error('Error fetching photo count:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Paneli</h1>
            <p className="text-muted-foreground">Sistem yönetimi ve içerik düzenleme</p>
          </div>
          <Button onClick={handleLogout} variant="outline">Çıkış Yap</Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-muted-foreground">İstatistikler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{totalPhotos}</p>
                <p className="text-sm text-muted-foreground">Toplam Çekilen Fotoğraf</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="announcements">Duyurular</TabsTrigger>
            <TabsTrigger value="surveys">Anketler</TabsTrigger>
            <TabsTrigger value="faculty">Öğretim Üyeleri</TabsTrigger>
            <TabsTrigger value="schedule">Ders Programı</TabsTrigger>
            <TabsTrigger value="frames">Çerçeveler</TabsTrigger>
            <TabsTrigger value="map">Harita</TabsTrigger>
            <TabsTrigger value="photos">Fotoğraflar</TabsTrigger>
          </TabsList>

          <TabsContent value="announcements" className="space-y-4">
            <AnnouncementsManager />
          </TabsContent>
          <TabsContent value="surveys" className="space-y-4">
            <SurveysManager />
          </TabsContent>
          <TabsContent value="faculty" className="space-y-4">
            <FacultyImporter />
            <FacultyManager />
          </TabsContent>
          <TabsContent value="schedule" className="space-y-4">
            <ScheduleManager />
          </TabsContent>
          <TabsContent value="frames" className="space-y-4">
            <FrameManager />
          </TabsContent>
          <TabsContent value="photos" className="space-y-4">
            <SavedPhotosManager />
          </TabsContent>
          <TabsContent value="map" className="space-y-4">
            <MapManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Sayfanın kendisi artık ProtectedRoute ile sarmalanmış olacak
const AdminPage = () => {
  return (
    <ProtectedRoute>
      <AdminPanelContent />
    </ProtectedRoute>
  );
};

export default AdminPage;