import { format } from 'date-fns';
import { postKind, type BlogPost } from '@/hooks/useBlogStore';

const difficultyColor: Record<string, string> = {
  easy: 'text-[hsl(152_55%_36%)] dark:text-[hsl(152_55%_62%)]',
  medium: 'text-[hsl(32_90%_42%)] dark:text-[hsl(37_100%_61%)]',
  hard: 'text-stamp',
  insane: 'text-stamp font-bold',
};

/** Kind, platform, difficulty, date and read time for a post. */
const PostMetaLine = ({ post }: { post: BlogPost }) => {
  const kind = postKind(post);

  return (
    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          kind === 'writeup' ? 'bg-signal/15 text-signal' : 'bg-secondary text-foreground'
        }`}
      >
        {kind === 'writeup' ? 'Writeup' : 'Blog'}
      </span>
      {post.platform && <span>{post.platform}</span>}
      {post.difficulty && <span className={`capitalize ${difficultyColor[post.difficulty] ?? ''}`}>{post.difficulty}</span>}
      <time dateTime={post.date}>{format(new Date(post.date), 'd MMM yyyy')}</time>
      <span>{post.read_time}</span>
    </p>
  );
};

export default PostMetaLine;
