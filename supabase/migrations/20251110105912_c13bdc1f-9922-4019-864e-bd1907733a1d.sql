-- Create statistics table to track total photos taken
CREATE TABLE IF NOT EXISTS public.photo_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_photos_taken integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.photo_statistics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view statistics"
  ON public.photo_statistics
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage statistics"
  ON public.photo_statistics
  FOR ALL
  USING (is_admin(auth.uid()));

-- Insert initial record
INSERT INTO public.photo_statistics (total_photos_taken)
VALUES (0);

-- Create function to increment photo count
CREATE OR REPLACE FUNCTION public.increment_photo_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.photo_statistics
  SET total_photos_taken = total_photos_taken + 1,
      updated_at = now()
  WHERE id = (SELECT id FROM public.photo_statistics LIMIT 1);
END;
$$;

-- Create trigger on saved_photos to increment counter
CREATE OR REPLACE FUNCTION public.handle_new_photo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM increment_photo_count();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_photo_created
  AFTER INSERT ON public.saved_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_photo();