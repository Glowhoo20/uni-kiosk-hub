-- Create storage bucket for saved photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('saved-photos', 'saved-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for saved-photos bucket
CREATE POLICY "Anyone can view public saved photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'saved-photos' AND (storage.foldername(name))[1] = 'public');

CREATE POLICY "Anyone can upload to saved-photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'saved-photos');

CREATE POLICY "Admins can manage saved-photos"
ON storage.objects
FOR ALL
USING (bucket_id = 'saved-photos' AND is_admin(auth.uid()));