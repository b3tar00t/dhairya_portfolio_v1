import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, Plus, Trash2, Save, Eye, Edit, X, LogOut, Loader2, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBlogStore, BlogPost } from '@/hooks/useBlogStore';
import { useResumeStore } from '@/hooks/useResumeStore';
import { useBlogImageUpload } from '@/hooks/useBlogImageUpload';
import { supabase } from '@/integrations/supabase/client';
import TerminalHeader from '@/components/TerminalHeader';
import BlogPreview from '@/components/BlogPreview';
import MarkdownToolbar from '@/components/MarkdownToolbar';

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [activeTab, setActiveTab] = useState<'blogs' | 'resume'>('blogs');
  
  // Blog store
  const { blogs, loading: blogsLoading, addBlog, updateBlog, deleteBlog, togglePublish, refetch } = useBlogStore();
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [newBlog, setNewBlog] = useState({ title: '', content: '', tags: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Resume state
  const { settings: resumeSettings, loading: resumeLoading, uploadResume } = useResumeStore();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  // Blog image upload
  const { uploadImage, getMarkdownImageTag } = useBlogImageUpload();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const newBlogImageRef = useRef<HTMLInputElement>(null);
  const editBlogImageRef = useRef<HTMLInputElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewBlog, setPreviewBlog] = useState<{ title: string; content: string; tags: string[] } | null>(null);
  const newBlogTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editBlogTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Check auth state on mount
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      setIsLoading(false);
      if (session) {
        refetch();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`
          }
        });
        if (error) throw error;
        toast({
          title: "Account Created",
          description: "You can now log in with your credentials.",
        });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Access Granted",
          description: "Welcome to the admin panel.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged Out",
      description: "You have been logged out.",
    });
  };

  const handleAddBlog = async () => {
    if (!newBlog.title || !newBlog.content) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const tags = newBlog.tags.split(',').map(t => t.trim()).filter(t => t);
      await addBlog(newBlog.title, newBlog.content, tags);
      setNewBlog({ title: '', content: '', tags: '' });
      toast({
        title: "Blog Created",
        description: "Your blog post has been saved as draft.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditBlog = (blog: BlogPost) => {
    setEditingBlog({ ...blog });
  };

  const handleUpdateBlog = async () => {
    if (!editingBlog || !editingBlog.title || !editingBlog.content) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateBlog(editingBlog.id, {
        title: editingBlog.title,
        content: editingBlog.content,
        tags: editingBlog.tags
      });
      setEditingBlog(null);
      toast({
        title: "Blog Updated",
        description: "Your blog post has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingBlog(null);
  };

  const handleDeleteBlog = async (id: string) => {
    try {
      await deleteBlog(id);
      toast({
        title: "Blog Deleted",
        description: "The blog post has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      await togglePublish(id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleResumeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;

    setIsUploadingResume(true);
    try {
      await uploadResume(resumeFile);
      setResumeFile(null);
      toast({
        title: "Resume Uploaded",
        description: "Your resume has been uploaded and is now live.",
      });
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleBlogImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const url = await uploadImage(file);
      const markdownTag = getMarkdownImageTag(url, file.name);

      if (isEditing && editingBlog) {
        setEditingBlog({
          ...editingBlog,
          content: editingBlog.content + '\n\n' + markdownTag
        });
      } else {
        setNewBlog({
          ...newBlog,
          content: newBlog.content + '\n\n' + markdownTag
        });
      }

      toast({
        title: "Image Uploaded",
        description: "Image markdown has been added to your content.",
      });
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="terminal-window">
            <TerminalHeader title="sudo login" />
            <div className="terminal-content">
              <p className="text-muted-foreground mb-4">
                <span className="text-primary">[!]</span> Admin authentication required
              </p>
              
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    <span className="text-primary">$</span> Email:
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-terminal w-full"
                    placeholder="admin@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    <span className="text-primary">$</span> Password:
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-terminal w-full"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="btn-terminal flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn-terminal-filled flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Login'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handlePreview = (title: string, content: string, tags: string[]) => {
    setPreviewBlog({ title, content, tags });
    setShowPreview(true);
  };

  const insertMarkdown = (
    textareaRef: React.RefObject<HTMLTextAreaElement>,
    setValue: (value: string) => void,
    currentValue: string,
    before: string,
    after: string = '',
    placeholder: string = ''
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentValue.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newValue = 
      currentValue.substring(0, start) + 
      before + textToInsert + after + 
      currentValue.substring(end);
    
    setValue(newValue);
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="btn-terminal flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-primary text-glow">Admin Panel</h1>
            <button
              onClick={handleLogout}
              className="btn-terminal flex items-center gap-2 text-cyber-red border-cyber-red hover:bg-cyber-red hover:text-background"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('blogs')}
            className={`btn-terminal flex items-center gap-2 ${activeTab === 'blogs' ? 'bg-primary text-background' : ''}`}
          >
            <FileText className="w-4 h-4" />
            Blog Posts
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`btn-terminal flex items-center gap-2 ${activeTab === 'resume' ? 'bg-primary text-background' : ''}`}
          >
            <Upload className="w-4 h-4" />
            Resume
          </button>
        </div>

        {/* Blog Management */}
        {activeTab === 'blogs' && (
          <div className="space-y-6">
            {/* Edit Blog Modal */}
            {editingBlog && (
              <div className="terminal-window border-cyber-cyan">
                <TerminalHeader title="./edit_blog.sh" />
                <div className="terminal-content">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">
                        <span className="text-cyber-cyan">$</span> Title:
                      </label>
                      <input
                        type="text"
                        value={editingBlog.title}
                        onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                        className="input-terminal w-full"
                        placeholder="Enter blog title..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">
                        <span className="text-cyber-cyan">$</span> Tags (comma separated):
                      </label>
                      <input
                        type="text"
                        value={editingBlog.tags.join(', ')}
                        onChange={(e) => setEditingBlog({ 
                          ...editingBlog, 
                          tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                        })}
                        className="input-terminal w-full"
                        placeholder="OSINT, Security, Tutorial..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">
                        <span className="text-cyber-cyan">$</span> Content (Markdown supported):
                      </label>
                      <MarkdownToolbar 
                        onInsert={(before, after, placeholder) => 
                          insertMarkdown(
                            editBlogTextareaRef,
                            (val) => setEditingBlog({ ...editingBlog, content: val }),
                            editingBlog.content,
                            before,
                            after,
                            placeholder
                          )
                        }
                      />
                      <textarea
                        ref={editBlogTextareaRef}
                        value={editingBlog.content}
                        onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                        className="input-terminal w-full h-48 resize-none rounded-t-none border-t-0"
                        placeholder="Write your blog content here..."
                      />
                      <input
                        type="file"
                        accept="image/*,.gif"
                        onChange={(e) => handleBlogImageUpload(e, true)}
                        className="hidden"
                        ref={editBlogImageRef}
                      />
                      <button
                        type="button"
                        onClick={() => editBlogImageRef.current?.click()}
                        className="btn-terminal mt-2 flex items-center gap-2"
                        disabled={isUploadingImage}
                      >
                        {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
                        Insert Image/GIF
                      </button>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={handleCancelEdit}
                        className="btn-terminal flex items-center gap-2"
                        disabled={isSaving}
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePreview(editingBlog.title, editingBlog.content, editingBlog.tags)}
                        className="btn-terminal flex items-center gap-2 text-cyber-cyan border-cyber-cyan hover:bg-cyber-cyan hover:text-background"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </button>
                      <button
                        onClick={handleUpdateBlog}
                        className="btn-terminal-filled flex items-center gap-2"
                        disabled={isSaving}
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Update Blog Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add New Blog */}
            {!editingBlog && (
              <div className="terminal-window">
                <TerminalHeader title="./create_blog.sh" />
                <div className="terminal-content">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">
                        <span className="text-primary">$</span> Title:
                      </label>
                      <input
                        type="text"
                        value={newBlog.title}
                        onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                        className="input-terminal w-full"
                        placeholder="Enter blog title..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">
                        <span className="text-primary">$</span> Tags (comma separated):
                      </label>
                      <input
                        type="text"
                        value={newBlog.tags}
                        onChange={(e) => setNewBlog({ ...newBlog, tags: e.target.value })}
                        className="input-terminal w-full"
                        placeholder="OSINT, Security, Tutorial..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">
                        <span className="text-primary">$</span> Content (Markdown supported):
                      </label>
                      <MarkdownToolbar 
                        onInsert={(before, after, placeholder) => 
                          insertMarkdown(
                            newBlogTextareaRef,
                            (val) => setNewBlog({ ...newBlog, content: val }),
                            newBlog.content,
                            before,
                            after,
                            placeholder
                          )
                        }
                      />
                      <textarea
                        ref={newBlogTextareaRef}
                        value={newBlog.content}
                        onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                        className="input-terminal w-full h-48 resize-none rounded-t-none border-t-0"
                        placeholder="Write your blog content here..."
                      />
                      <input
                        type="file"
                        accept="image/*,.gif"
                        onChange={(e) => handleBlogImageUpload(e, false)}
                        className="hidden"
                        ref={newBlogImageRef}
                      />
                      <button
                        type="button"
                        onClick={() => newBlogImageRef.current?.click()}
                        className="btn-terminal mt-2 flex items-center gap-2"
                        disabled={isUploadingImage}
                      >
                        {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
                        Insert Image/GIF
                      </button>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handlePreview(newBlog.title, newBlog.content, newBlog.tags.split(',').map(t => t.trim()).filter(t => t))}
                        className="btn-terminal flex items-center gap-2 text-cyber-cyan border-cyber-cyan hover:bg-cyber-cyan hover:text-background"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </button>
                      <button
                        onClick={handleAddBlog}
                        className="btn-terminal-filled flex items-center gap-2"
                        disabled={isSaving}
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Create Blog Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Blog List */}
            <div className="terminal-window">
              <TerminalHeader title="ls ~/blogs/" />
              <div className="terminal-content">
                {blogsLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading blogs...
                  </div>
                ) : blogs.length === 0 ? (
                  <p className="text-muted-foreground">No blog posts yet.</p>
                ) : (
                  <div className="space-y-4">
                    {blogs.map((blog) => (
                      <div key={blog.id} className="card-terminal">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-foreground font-medium">{blog.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {blog.excerpt}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {blog.tags.map(tag => (
                                <span key={tag} className="text-xs px-2 py-0.5 border border-primary/30 text-primary/70">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{blog.date}</span>
                              <span>{blog.read_time}</span>
                              <span className={blog.published ? 'text-primary' : 'text-cyber-yellow'}>
                                {blog.published ? '● Published' : '○ Draft'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditBlog(blog)}
                              className="btn-terminal p-2 text-cyber-cyan border-cyber-cyan hover:bg-cyber-cyan hover:text-background"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleTogglePublish(blog.id)}
                              className="btn-terminal p-2"
                              title={blog.published ? 'Unpublish' : 'Publish'}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBlog(blog.id)}
                              className="btn-terminal p-2 text-cyber-red border-cyber-red hover:bg-cyber-red hover:text-background"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Resume Management */}
        {activeTab === 'resume' && (
          <div className="terminal-window">
            <TerminalHeader title="./upload_resume.sh" />
            <div className="terminal-content">
              <p className="text-muted-foreground mb-4">
                <span className="text-primary">[*]</span> Upload your updated resume (PDF format recommended)
              </p>

              <div className="border-2 border-dashed border-border hover:border-primary transition-colors p-8 text-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeSelect}
                  className="hidden"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className="cursor-pointer"
                >
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground mb-2">
                    {resumeFile ? resumeFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PDF, DOC, or DOCX (max 10MB)
                  </p>
                </label>
              </div>

              {resumeFile && (
                <div className="mt-4 flex items-center justify-between p-4 bg-secondary rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-foreground">{resumeFile.name}</span>
                  </div>
                  <button 
                    onClick={handleResumeUpload}
                    className="btn-terminal-filled flex items-center gap-2"
                    disabled={isUploadingResume}
                  >
                    {isUploadingResume ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Upload Resume
                  </button>
                </div>
              )}

              <div className="mt-6 p-4 bg-secondary/50 rounded">
                {resumeLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading current resume info...
                  </div>
                ) : resumeSettings?.resume_url ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      <span className="text-primary">[i]</span> Current resume: {resumeSettings.resume_filename || 'Resume'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last updated: {new Date(resumeSettings.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <a 
                      href={resumeSettings.resume_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-terminal mt-3 inline-flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Current Resume
                    </a>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    <span className="text-cyber-yellow">[!]</span> No resume uploaded yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && previewBlog && (
          <div className="fixed inset-0 bg-background/90 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowPreview(false)}
                  className="btn-terminal flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Close Preview
                </button>
              </div>
              <BlogPreview 
                title={previewBlog.title}
                content={previewBlog.content}
                tags={previewBlog.tags}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
