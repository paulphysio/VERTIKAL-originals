'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart, MessageCircle, Send, X } from 'lucide-react'
import Link from 'next/link'

interface Post {
  id: string
  image_url: string
  caption: string | null
  created_at: string
  posted_by: string
  profiles?: {
    full_name: string | null
    avatar_url: string | null
  }
  likes?: number
  comments?: number
  user_liked?: boolean
}

const TICKER_ITEMS = ['Fit check', 'Tag your look', 'OFFCUT LOOKBOOK', 'New drops weekly']

// Purely cosmetic: highlights #hashtags in a caption. No data mutation.
function renderCaption(caption: string | null) {
  if (!caption) return null
  return caption.split(/(\s+)/).map((part, i) =>
    part.startsWith('#') ? (
      <span key={i} className="font-bold text-coral">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

export default function LookbookPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [comment, setComment] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: posts } = await supabase
      .from('lookbook_posts')
      .select(`
        *,
        profiles(full_name, avatar_url),
        lookbook_likes(id),
        lookbook_comments(id)
      `)
      .order('created_at', { ascending: false })

    if (posts) {
      const postsWithCounts = posts.map((post: any) => ({
        ...post,
        likes: post.lookbook_likes?.length || 0,
        comments: post.lookbook_comments?.length || 0,
        user_liked: user ? post.lookbook_likes?.some((like: any) => like.user_id === user.id) : false
      }))
      setPosts(postsWithCounts)
    }
    setLoading(false)
  }

  const handleLike = async (postId: string, userLiked: boolean) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (userLiked) {
      await supabase
        .from('lookbook_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
    } else {
      await supabase
        .from('lookbook_likes')
        .insert({ post_id: postId, user_id: user.id })
    }

    fetchPosts()
  }

  const handleComment = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !comment.trim()) return

    await supabase
      .from('lookbook_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        comment: comment.trim()
      })

    setComment('')
    fetchPosts()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-ink">
          <span className="h-2 w-2 animate-pulse rounded-full bg-coral" />
          Loading fits...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Marquee ticker */}
      <div className="overflow-hidden border-b-2 border-ink bg-ink py-1.5 text-paper">
        <div className="flex w-max animate-marquee whitespace-nowrap">
          {[0, 1].map((rep) => (
            <div key={rep} className="flex items-center gap-8 pr-8">
              {TICKER_ITEMS.map((item, i) => (
                <span key={`${rep}-${i}`} className="font-mono text-[11px] uppercase tracking-widest">
                  ◆ {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden border-b-2 border-ink px-4 py-10 sm:px-10 sm:py-14">
        <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-center font-display uppercase leading-none text-ink/5 text-[20vw] sm:text-[9vw]">
          LOOKBOOK
        </p>

        <svg
          className="animate-sketch-idle absolute right-4 top-4 hidden sm:block"
          width="76"
          height="76"
          viewBox="0 0 76 76"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="38" cy="38" r="32" stroke="#FF5A46" strokeWidth="2.5" strokeDasharray="5 4" />
          <text x="38" y="43" textAnchor="middle" className="font-display" fontSize="13" fill="#0b0b0c">
            NEW
          </text>
        </svg>

        <div className="relative flex flex-col items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-acid px-3 py-1 font-mono text-[11px] uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-ink" />
            Live fits
          </span>
          <h1 className="text-center font-display text-5xl uppercase tracking-tight sm:text-7xl">
            Lookbook
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-ink/50 sm:text-sm">
            {posts.length} fit{posts.length === 1 ? '' : 's'} posted
          </p>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="mx-auto max-w-5xl p-4 sm:p-10">
        {posts.length === 0 ? (
          <div className="border-2 border-dashed border-ink/30 py-24 text-center">
            <p className="font-mono text-sm uppercase tracking-widest text-ink/50">No fits yet — be first</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 grid-flow-dense gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {posts.map((post, i) => {
              const tall = i % 7 === 3
              const tiltClass = i % 2 === 0
                ? 'hover:-rotate-1 hover:shadow-[6px_6px_0_0_#0b0b0c]'
                : 'hover:rotate-1 hover:shadow-[6px_6px_0_0_#0b0b0c]'
              const sizeClass = tall ? 'row-span-2 aspect-[1/2]' : 'aspect-square'

              return (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className={`group relative cursor-pointer overflow-hidden border-2 border-ink bg-concrete/20 transition-all duration-200 hover:z-10 ${tiltClass} ${sizeClass}`}
                >
                  <img
                    src={post.image_url}
                    alt="Lookbook post"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105 group-hover:saturate-125"
                  />

                  <span className="absolute left-2 top-2 rounded-full border border-ink bg-paper px-2 py-0.5 font-mono text-[10px]">
                    #{String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/80 via-ink/10 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex gap-3 text-paper">
                      <span className="flex items-center gap-1 font-mono text-xs">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {post.comments}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLike(post.id, post.user_liked || false)
                    }}
                    className={`absolute bottom-2 right-2 flex items-center gap-1 rounded-full border-2 border-ink px-2 py-1 font-mono text-[10px] transition-transform active:scale-90 ${
                      post.user_liked ? 'bg-coral text-paper' : 'bg-paper text-ink'
                    }`}
                  >
                    <Heart className={`h-3 w-3 ${post.user_liked ? 'fill-current' : ''}`} />
                    {post.likes}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden border-2 border-ink bg-paper shadow-[10px_10px_0_0_#0b0b0c]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-paper transition hover:bg-ink hover:text-paper"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image */}
              <div className="aspect-square bg-concrete/20 md:aspect-auto">
                <img src={selectedPost.image_url} alt="Lookbook post" className="h-full w-full object-cover" />
              </div>

              {/* Details */}
              <div className="flex max-h-[90vh] flex-col overflow-y-auto">
                {/* Header */}
                <div className="flex items-center gap-3 border-b-2 border-ink p-4">
                  <Link
                    href={`/profile/${selectedPost.posted_by}`}
                    className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-ink bg-concrete transition hover:border-coral"
                  >
                    {selectedPost.profiles?.avatar_url ? (
                      <img src={selectedPost.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-mono text-xs">
                        {selectedPost.profiles?.full_name?.[0] || 'V'}
                      </div>
                    )}
                  </Link>
                  <div>
                    <Link
                      href={`/profile/${selectedPost.posted_by}`}
                      className="text-sm font-bold uppercase hover:text-coral"
                    >
                      {selectedPost.profiles?.full_name || 'VERTIKAL'}
                    </Link>
                    <p className="font-mono text-[11px] text-ink/50">
                      {new Date(selectedPost.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="ml-auto rounded-full border border-ink bg-acid px-2 py-0.5 font-mono text-[10px] uppercase">
                    Fit
                  </span>
                </div>

                {/* Caption */}
                <div className="flex-1 border-b-2 border-ink p-4">
                  <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {renderCaption(selectedPost.caption)}
                  </p>
                </div>

                {/* Actions */}
                <div className="border-b-2 border-ink p-4">
                  <div className="mb-4 flex items-center gap-4">
                    <button
                      onClick={() => handleLike(selectedPost.id, selectedPost.user_liked || false)}
                      className={`flex items-center gap-2 rounded-full border-2 border-ink px-3 py-1.5 transition active:scale-90 ${
                        selectedPost.user_liked ? 'bg-coral text-paper' : 'hover:bg-ink hover:text-paper'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${selectedPost.user_liked ? 'fill-current' : ''}`} />
                      <span className="font-mono text-xs">{selectedPost.likes}</span>
                    </button>
                    <span className="font-mono text-xs uppercase tracking-widest text-ink/50">
                      {selectedPost.comments} comments
                    </span>
                  </div>

                  {/* Comment Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleComment(selectedPost.id)}
                      className="flex-1 border-2 border-ink px-3 py-2 font-mono text-sm focus:outline-none focus:border-coral"
                    />
                    <button
                      onClick={() => handleComment(selectedPost.id)}
                      className="flex items-center justify-center border-2 border-ink bg-cobalt px-3 text-paper transition hover:bg-ink"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}