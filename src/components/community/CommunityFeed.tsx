import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { Image as ImageIcon, Send, MessageSquare, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fileToBase64 } from '../../utils/fileUtils';

export const CommunityFeed: React.FC = () => {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [newText, setNewText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const data = await dbService.getCommunityFeed();
    setPosts(data);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || (!newText.trim() && images.length === 0)) return;
    
    setIsPublishing(true);
    await dbService.createCommunityPost(profile.uid, profile.name, newText, images);
    setNewText('');
    setImages([]);
    await fetchPosts();
    setIsPublishing(false);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files) as File[];
      const limitFiles = filesArray.slice(0, 4); // Max 4 images for simplicity
      const bases = await Promise.all(limitFiles.map(f => fileToBase64(f)));
      setImages(prev => [...prev, ...bases].slice(0, 4));
    }
  };

  const toggleLike = async (postId: string) => {
    if (!profile) return;
    // optimistic
    setPosts(posts.map(p => {
       if (p.id === postId) {
          const isLiked = p.likes?.includes(profile.uid);
          return { ...p, likes: isLiked ? p.likes.filter((uid: string) => uid !== profile.uid) : [...(p.likes || []), profile.uid] };
       }
       return p;
    }));
    await dbService.toggleLikePost(postId, profile.uid);
    fetchPosts(); // refresh to sync
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 relative pb-24">
      <div className="pt-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <ImageIcon size={24} className="text-indigo-500" /> Fellowship Feed
        </h1>
        <p className="text-slate-500 text-sm mt-1">Share testimonies, pictures, and moments with the community.</p>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <form onSubmit={handlePost}>
          <textarea 
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="Share something with the community..."
            className="w-full bg-slate-50 border-none rounded-2xl p-4 resize-none h-24 mb-3 text-sm focus:ring-0 active:ring-0"
          />
          
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden shadow-sm">
                  <img src={img} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex justify-center items-center backdrop-blur text-xs">&times;</button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center">
             <label className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 bg-slate-50 px-4 py-2 rounded-xl cursor-pointer transition-colors text-sm font-bold tracking-wide">
                <ImageIcon size={18} /> Photos {images.length > 0 && `(${images.length}/4)`}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} disabled={images.length >= 4} />
             </label>
             <button type="submit" disabled={isPublishing || (!newText.trim() && images.length === 0)} className="flex items-center gap-2 px-6 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors">
               <Send size={16} /> Post
             </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {posts.map((post) => {
            const hasLiked = profile && post.likes?.includes(profile.uid);
            return (
              <motion.div key={post.id} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex justify-center items-center font-bold text-lg">
                    {post.authorName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{post.authorName}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </div>
                </div>

                {post.text && <div className="px-4 pb-4 text-sm text-slate-700 whitespace-pre-wrap">{post.text}</div>}
                
                {post.imagesBase64?.length > 0 && (
                   <div className="bg-slate-50 border-y border-slate-100 max-h-96 w-full flex overflow-x-auto snap-x">
                      {post.imagesBase64.map((img: string, i: number) => (
                        <img key={i} src={img} alt={`Post attachment ${i}`} className="h-96 w-full object-cover snap-center shrink-0" />
                      ))}
                   </div>
                )}

                <div className="p-4 flex gap-4">
                  <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 font-bold text-sm transition-colors ${hasLiked ? 'text-rose-500' : 'text-slate-500 hover:text-slate-800'}`}>
                    <Heart size={20} className={hasLiked ? "fill-rose-500" : ""} /> {post.likes?.length || 0}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        
        {posts.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
            <p>No posts yet. Be the first to share!</p>
          </div>
        )}
      </div>
    </div>
  );
};
