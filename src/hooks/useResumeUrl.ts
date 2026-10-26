import { useResumeStore } from './useResumeStore';
import { useContent } from '@/content/ContentProvider';

/** Admin-uploaded resume if there is one, otherwise the bundled PDF. */
export const useResumeUrl = () => {
  const { settings } = useResumeStore();
  const { profile } = useContent();
  return settings?.resume_url || profile.resume;
};
