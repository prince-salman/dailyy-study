"use client";
import React, { useState } from "react";
import Link from "next/link";
import { addXP } from "@/utils/gamification";

const initialPosts = [
  { id: 1, author: "BudiS", title: "Cara cepat paham Integral Parsial?", content: "Ada yang punya trik atau jembatan keledai untuk integral parsial? Sering kebalik u dan dv-nya.", category: "Pengetahuan Kuantitatif", upvotes: 24, replies: 5 },
  { id: 2, author: "Siti_T", title: "Rekomendasi buku UTBK Literasi Bahasa Inggris", content: "Guys, buku apa yang reading comprehension-nya paling mirip soal asli?", category: "Literasi B. Inggris", upvotes: 15, replies: 2 }
];

export default function ForumPage() {
  const [posts, setPosts] = useState(initialPosts);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const newPost = {
      id: Date.now(),
      author: localStorage.getItem("userName") || "Siswa",
      title: newTitle,
      content: newContent,
      category: "Umum",
      upvotes: 0,
      replies: 0
    };

    setPosts([newPost, ...posts]);
    setNewTitle("");
    setNewContent("");
    setShowForm(false);
    addXP(10, "Membuat Diskusi di Forum");
  };

  const handleUpvote = (id: number) => {
    setPosts(posts.map(p => p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p));
  };

  return (
    <div className="min-h-screen bg-bg-app px-6 pt-6 pb-24 animate-in fade-in">
      <Link href="/">
        <button className="text-slate-400 mb-6 font-bold text-sm hover:text-white transition-colors">
          <i className="fas fa-arrow-left mr-2"></i>Kembali
        </button>
      </Link>
      
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Forum Diskusi</h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">Tanya jawab dan diskusi sesama pejuang PTN.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold transition-colors shadow-lg flex items-center gap-2"
        >
          <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'}`}></i> {showForm ? 'Batal' : 'Buat Diskusi'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl mb-8 animate-in slide-in-from-top-4">
          <input 
            type="text" 
            placeholder="Judul Diskusi" 
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white mb-4 focus:border-indigo-500 transition-colors"
          />
          <textarea 
            placeholder="Isi pertanyaan atau diskusimu..." 
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white mb-4 focus:border-indigo-500 transition-colors h-32 resize-none"
          ></textarea>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors">
            Posting Diskusi
          </button>
        </form>
      )}

      <div className="flex flex-col gap-4">
        {posts.map(post => (
          <div key={post.id} className="bg-slate-800 p-5 rounded-2xl border border-slate-700 hover:border-indigo-500/50 transition-colors cursor-pointer group">
            <div className="flex gap-4">
              <div className="flex flex-col items-center justify-start gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleUpvote(post.id); }}
                  className="w-8 h-8 rounded-full bg-slate-700 text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-400 flex items-center justify-center transition-colors"
                >
                  <i className="fas fa-caret-up text-lg"></i>
                </button>
                <span className="font-bold text-slate-300 text-sm">{post.upvotes}</span>
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded text-[0.65rem] font-bold">{post.category}</span>
                  <span className="text-slate-500 text-[0.7rem] font-semibold">Oleh <span className="text-slate-300">{post.author}</span></span>
                </div>
                <h3 className="text-lg font-extrabold text-white mb-2 group-hover:text-indigo-400 transition-colors">{post.title}</h3>
                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{post.content}</p>
                <div className="mt-4 flex items-center gap-4 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1 hover:text-slate-300 transition-colors"><i className="fas fa-comment-alt"></i> {post.replies} Balasan</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 transition-colors"><i className="fas fa-share"></i> Bagikan</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
