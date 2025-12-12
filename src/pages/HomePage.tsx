import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Settings, Calendar, Users, GraduationCap, Clock, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, getDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useTheme } from '@/components/ThemeContext';

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface Course {
  id: string;
  course_name: string;
  course_code: string;
  instructor: string;
  class_level: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string;
}

const DAYS_MAP: { [key: number]: string } = {
  0: 'Pazar',
  1: 'Pazartesi',
  2: 'Salı',
  3: 'Çarşamba',
  4: 'Perşembe',
  5: 'Cuma',
  6: 'Cumartesi',
};

const stats = [
  { label: 'Aktif Öğrenci', value: '600+', icon: GraduationCap },
  { label: 'Öğretim Üyesi', value: '8', icon: Users },
  { label: 'Mezun Sayımız', value: '800+', icon: Clock },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { isNewYearTheme, isLoading: isThemeLoading } = useTheme();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [todayCourses, setTodayCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState('');
  const [selectedClass, setSelectedClass] = useState<number>(1);

  useEffect(() => {
    if (!isThemeLoading && isNewYearTheme) {
      navigate('/dilek-yildizlari', { replace: true });
    }
  }, [isThemeLoading, isNewYearTheme, navigate]);

  useEffect(() => {
    // Bugünün gününü al
    const today = new Date();
    const dayIndex = getDay(today);
    const dayName = DAYS_MAP[dayIndex];
    setCurrentDay(dayName);

    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setAnnouncements(data || []);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTodayCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('day_of_week', dayName)
          .order('class_level', { ascending: true })
          .order('start_time', { ascending: true });

        if (error) throw error;
        setTodayCourses(data || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchAnnouncements();
    if (dayName) {
      fetchTodayCourses();
    }
  }, []);

  if (isThemeLoading) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary via-primary-hover to-accent text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-8">
            {/* Sol Logo */}
            <div className="hidden lg:block flex-shrink-0">
              <img
                src="/deu.png"
                alt="DEÜ Logo"
                className="h-32 w-32 object-contain"
              />
            </div>

            {/* Orta Yazı */}
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4">
                Dokuz Eylül Üniversitesi
              </h1>
              <h2 className="text-3xl font-semibold mb-6 opacity-90">
                Yönetim Bilişim Sistemleri
              </h2>
              <p className="text-xl opacity-80 max-w-2xl mx-auto">
                İnteraktif kiosk sistemimize hoş geldiniz. Bölümümüz hakkında bilgi alın,
                duyuruları takip edin ve hatıra fotoğraflarınızı çekin.
              </p>
            </div>

            {/* Sağ Logo */}
            <div className="hidden lg:block flex-shrink-0">
              <img
                src="/deu-ybs-logo.png"
                alt="DEÜ YBS Logo"
                className="h-32 w-32 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-white rounded-full blur-lg"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-white rounded-full blur-md"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Bugünün Dersleri ve Son Duyurular - Side by Side */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bugünün Dersleri */}
            <div>
              <Card>
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Sol Sidebar - Sınıf Seçimi */}
                    <div className="w-24 bg-accent/20 border-r border-border p-3 space-y-2">
                      {[1, 2, 3, 4].map((level) => (
                        <Button
                          key={level}
                          variant={selectedClass === level ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setSelectedClass(level)}
                          className="w-full h-12 text-xs flex flex-col items-center justify-center"
                        >
                          <span>{level}. Sınıf</span>
                        </Button>
                      ))}
                    </div>

                    {/* Sağ İçerik Alanı */}
                    <div className="flex-1 p-6">
                      <h3 className="text-2xl font-bold text-primary mb-6">
                        {currentDay} Gününün Ders Programı
                      </h3>

                      {coursesLoading ? (
                        <div className="text-center text-muted-foreground py-8">Yükleniyor...</div>
                      ) : todayCourses.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          Bugün ders bulunmamaktadır.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {[1, 2, 3, 4]
                            .filter(level => selectedClass === level)
                            .map((level) => {
                              const levelCourses = todayCourses.filter(c => c.class_level === level);
                              if (levelCourses.length === 0) return null;

                              return (
                                <div key={level} className="border-l-4 border-primary pl-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="px-4 py-2 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                      {level}. Sınıf
                                    </div>
                                  </div>
                                  <div className="space-y-2 ml-10">
                                    {levelCourses.map((course) => (
                                      <div
                                        key={course.id}
                                        className="p-3 rounded-lg bg-accent/20 hover:bg-accent/40 transition-colors"
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <BookOpen className="w-4 h-4 text-primary" />
                                              <span className="font-semibold">{course.course_code}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-1">
                                              {course.course_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              {course.instructor}
                                            </p>
                                          </div>
                                          <div className="text-right text-sm">
                                            <div className="font-medium">
                                              {course.start_time} - {course.end_time}
                                            </div>
                                            {course.room && (
                                              <div className="text-xs text-muted-foreground">
                                                {course.room}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Son Duyurular */}
            <div>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-primary mb-6">
                    Son Duyurular
                  </h3>

                  {loading ? (
                    <div className="text-center text-muted-foreground py-8">Yükleniyor...</div>
                  ) : announcements.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">Henüz duyuru bulunmamaktadır.</div>
                  ) : (
                    <div className="space-y-3">
                      {announcements.map((announcement) => (
                        <div
                          key={announcement.id}
                          className="p-4 rounded-lg border border-border hover:bg-accent/30 transition-colors"
                        >
                          <h4 className="font-semibold text-base text-foreground mb-2 line-clamp-2">
                            {announcement.title}
                          </h4>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            {format(new Date(announcement.created_at), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                          </div>
                        </div>
                      ))}

                      <div className="pt-4">
                        <Button
                          onClick={() => navigate('/announcements')}
                          size="lg"
                          className="w-full bg-primary hover:bg-primary-hover"
                        >
                          Tüm Duyurular
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Bölümümüz Hakkında - Statistics */}
        <section className="mb-12">
          <h3 className="text-3xl font-bold text-primary mb-8 text-center">
            Bölümümüz Hakkında
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center p-8 hover:shadow-lg transition-shadow duration-200">
                  <Icon className="w-16 h-16 text-accent mx-auto mb-4" />
                  <div className="text-4xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-base text-muted-foreground">
                    {stat.label}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </div>

      {/* Admin Panel Access Button */}
      <div className="fixed bottom-4 right-4">
        <Button
          onClick={() => navigate("/admin-login")}
          variant="outline"
          size="sm"
          className="opacity-60 hover:opacity-100 transition-opacity"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}