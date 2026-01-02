import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ResumeSettings {
  resume_url: string | null;
  resume_filename: string | null;
  updated_at: string;
}

export const useResumeStore = () => {
  const [settings, setSettings] = useState<ResumeSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'main')
      .maybeSingle();

    if (error) {
      console.error('Error fetching settings:', error);
    } else {
      setSettings(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const uploadResume = async (file: File): Promise<string> => {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `resume_${Date.now()}.${fileExt}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    // Update site settings
    const { error: updateError } = await supabase
      .from('site_settings')
      .upsert({
        id: 'main',
        resume_url: publicUrl,
        resume_filename: file.name,
        updated_at: new Date().toISOString()
      });

    if (updateError) throw updateError;

    // Refresh settings
    await fetchSettings();

    return publicUrl;
  };

  return {
    settings,
    loading,
    uploadResume,
    refetch: fetchSettings
  };
};
