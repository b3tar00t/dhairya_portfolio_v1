import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  tags: string[];
  read_time: string;
  published: boolean;
}

// Helper to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Helper to calculate read time
const calculateReadTime = (content: string): string => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
};

export const useBlogStore = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch blogs from database
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching blogs:', error);
        return;
      }

      setBlogs(data || []);
    } catch (e) {
      console.error('Error fetching blogs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const addBlog = async (title: string, content: string, tags: string[] = []) => {
    const newBlog = {
      slug: generateSlug(title),
      title,
      excerpt: content.substring(0, 150).replace(/[#*`]/g, '').trim() + '...',
      content,
      date: new Date().toISOString().split('T')[0],
      tags: tags.length > 0 ? tags : ['General'],
      read_time: calculateReadTime(content),
      published: false
    };

    const { data, error } = await supabase
      .from('blogs')
      .insert(newBlog)
      .select()
      .single();

    if (error) {
      console.error('Error adding blog:', error);
      throw error;
    }

    setBlogs(prev => [data, ...prev]);
    return data;
  };

  const updateBlog = async (id: string, updates: Partial<BlogPost>) => {
    const updatedFields: Record<string, unknown> = { ...updates };
    
    // Regenerate slug if title changed
    if (updates.title) {
      updatedFields.slug = generateSlug(updates.title);
    }
    // Regenerate excerpt and read_time if content changed
    if (updates.content) {
      updatedFields.excerpt = updates.content.substring(0, 150).replace(/[#*`]/g, '').trim() + '...';
      updatedFields.read_time = calculateReadTime(updates.content);
    }

    const { data, error } = await supabase
      .from('blogs')
      .update(updatedFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating blog:', error);
      throw error;
    }

    setBlogs(prev => prev.map(b => b.id === id ? data : b));
    return data;
  };

  const deleteBlog = async (id: string) => {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blog:', error);
      throw error;
    }

    setBlogs(prev => prev.filter(b => b.id !== id));
  };

  const togglePublish = async (id: string) => {
    const blog = blogs.find(b => b.id === id);
    if (!blog) return;

    const { data, error } = await supabase
      .from('blogs')
      .update({ published: !blog.published })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling publish:', error);
      throw error;
    }

    setBlogs(prev => prev.map(b => b.id === id ? data : b));
  };

  const getPublishedBlogs = () => blogs.filter(b => b.published);

  const getBlogBySlug = (slug: string) => blogs.find(b => b.slug === slug);

  return {
    blogs,
    loading,
    addBlog,
    updateBlog,
    deleteBlog,
    togglePublish,
    getPublishedBlogs,
    getBlogBySlug,
    refetch: fetchBlogs
  };
};
