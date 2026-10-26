import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Loader2, Mail, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

/** Contact form submissions, newest first. Readable by admins only (RLS). */
const AdminInbox = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) toast({ title: 'Could not load messages', description: error.message, variant: 'destructive' });
        setMessages(data ?? []);
        setLoading(false);
      });
  }, [toast]);

  const markRead = async (m: Message) => {
    if (m.read) return;
    const { error } = await supabase.from('messages').update({ read: true }).eq('id', m.id);
    if (!error) setMessages((list) => list.map((x) => (x.id === m.id ? { ...x, read: true } : x)));
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) {
      toast({ title: 'Could not delete message', description: error.message, variant: 'destructive' });
      return;
    }
    setMessages((list) => list.filter((x) => x.id !== id));
    toast({ title: 'Message deleted' });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12" role="status">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
        <span className="sr-only">Loading messages</span>
      </div>
    );
  }

  if (messages.length === 0) {
    return <p className="py-12 text-center text-muted-foreground">No messages yet. Submissions from the contact form appear here.</p>;
  }

  return (
    <ul className="space-y-4">
      {messages.map((m) => (
        <li key={m.id} className={`terminal-window ${m.read ? '' : 'border-primary'}`}>
          <div className="terminal-content">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {!m.read && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary" aria-label="Unread" />}
                  {m.name}
                </p>
                <a href={`mailto:${m.email}`} onClick={() => markRead(m)} className="text-sm text-primary hover:underline">
                  {m.email}
                </a>
              </div>
              <time dateTime={m.created_at} className="text-sm text-muted-foreground">
                {format(new Date(m.created_at), 'd MMM yyyy, HH:mm')}
              </time>
            </div>
            <p className="mt-4 whitespace-pre-wrap">{m.message}</p>
            <div className="mt-4 flex gap-2">
              <a href={`mailto:${m.email}?subject=Re: your message`} onClick={() => markRead(m)} className="btn-terminal gap-2">
                <Mail className="h-4 w-4" aria-hidden /> Reply
              </a>
              {!m.read && (
                <button type="button" onClick={() => markRead(m)} className="btn-terminal">
                  Mark as read
                </button>
              )}
              <button type="button" onClick={() => remove(m.id)} className="btn-terminal gap-2 text-destructive">
                <Trash2 className="h-4 w-4" aria-hidden /> Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default AdminInbox;
