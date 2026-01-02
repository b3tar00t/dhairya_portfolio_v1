import { supabase } from '@/integrations/supabase/client';

export const useBlogImageUpload = () => {
  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const getMarkdownImageTag = (url: string, altText: string = 'Image') => {
    return `![${altText}](${url})`;
  };

  return {
    uploadImage,
    getMarkdownImageTag
  };
};
