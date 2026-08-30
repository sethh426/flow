/**
 * Social Media Content Generator
 * Create posts and previews for social platforms
 */

'use client';

import React, { useState } from 'react';
import {
  HiCamera,
  HiHeart,
  HiChatAlt,
  HiShare,
  HiDownload,
  HiSparkles,
} from 'react-icons/hi';
import { useToast } from '@/core/providers/ToastProvider';

interface SocialPost {
  platform: 'instagram' | 'facebook' | 'twitter' | 'pinterest';
  caption: string;
  hashtags: string[];
  image: string;
}

export default function SocialMediaGenerator() {
  const [productImage, setProductImage] = useState<string>('');
  const [productTitle, setProductTitle] = useState('');
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [generating, setGenerating] = useState(false);
  const { showToast } = useToast();

  const generateSocialPosts = async () => {
    if (!productImage || !productTitle) {
      showToast('error', 'Please provide product image and title');
      return;
    }

    setGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newPosts: SocialPost[] = [
      {
        platform: 'instagram',
        caption: `✨ New arrival alert! ✨\n\nCheck out our ${productTitle}! Perfect for anyone who loves unique style. Link in bio to shop now! 🛍️`,
        hashtags: ['shopnow', 'newproduct', 'trending', 'fashion', 'style', 'gift', 'mustave'],
        image: productImage
      },
      {
        platform: 'facebook',
        caption: `Introducing our latest product: ${productTitle}! 🎉\n\nWhy you'll love it:\n✓ Premium quality\n✓ Unique design\n✓ Perfect gift idea\n\nShop now and get yours before they're gone!`,
        hashtags: ['shopping', 'newproduct', 'deals'],
        image: productImage
      },
      {
        platform: 'twitter',
        caption: `Just dropped: ${productTitle} 🔥\n\nGrab yours now before they sell out!\n👉 [link]`,
        hashtags: ['NewProduct', 'ShopNow', 'Trending'],
        image: productImage
      },
      {
        platform: 'pinterest',
        caption: `${productTitle} - Save this for later! Perfect gift idea or treat yourself. Click to shop now! 💜`,
        hashtags: ['giftideas', 'shopping', 'style', 'design'],
        image: productImage
      }
    ];

    setPosts(newPosts);
    setGenerating(false);
    showToast('success', 'Social posts generated!');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProductImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadPost = (post: SocialPost) => {
    showToast('success', `${post.platform} post copied to clipboard!`);
    navigator.clipboard.writeText(`${post.caption}\n\n${post.hashtags.map(h => `#${h}`).join(' ')}`);
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'from-pink-500 to-purple-600';
      case 'facebook': return 'from-blue-600 to-blue-700';
      case 'twitter': return 'from-sky-400 to-blue-500';
      case 'pinterest': return 'from-red-600 to-red-700';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <HiCamera className="w-8 h-8 mr-3 text-pink-500" />
          Social Media Generator
        </h1>
        <p className="text-gray-600 mt-2">Create engaging social media posts for your products</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">Product Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="social-image-upload"
                />
                <label
                  htmlFor="social-image-upload"
                  className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer"
                >
                  {productImage ? (
                    <img src={productImage} alt="Product" className="w-full h-48 object-cover rounded" />
                  ) : (
                    <>
                      <HiCamera className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Click to upload image</span>
                    </>
                  )}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Title</label>
                <input
                  type="text"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  placeholder="Enter product name..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={generateSocialPosts}
                disabled={generating || !productImage || !productTitle}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
              >
                <HiSparkles className="w-5 h-5" />
                <span>{generating ? 'Generating...' : 'Generate Posts'}</span>
              </button>
            </div>
          </div>

          {posts.length > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">✅ Posts Ready!</h3>
              <p className="text-sm text-gray-600">
                Generated {posts.length} social media posts. Click on any post to copy the caption.
              </p>
            </div>
          )}
        </div>

        {/* Posts Preview Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-6">Generated Posts ({posts.length})</h3>
            
            {posts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <HiCamera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Upload an image and generate posts to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post, idx) => (
                  <div key={idx} className="border rounded-xl overflow-hidden hover:shadow-lg transition">
                    {/* Platform Header */}
                    <div className={`bg-gradient-to-r ${getPlatformColor(post.platform)} text-white px-4 py-3 flex items-center justify-between`}>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          <span className="text-xl">{
                            post.platform === 'instagram' ? '📷' :
                            post.platform === 'facebook' ? '👥' :
                            post.platform === 'twitter' ? '🐦' :
                            '📌'
                          }</span>
                        </div>
                        <span className="font-semibold capitalize">{post.platform}</span>
                      </div>
                      <button
                        onClick={() => downloadPost(post)}
                        className="p-2 hover:bg-white/20 rounded-lg transition"
                      >
                        <HiDownload className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Post Image */}
                    <div className="relative">
                      <img src={post.image} alt="Post preview" className="w-full h-48 object-cover" />
                    </div>

                    {/* Post Content */}
                    <div className="p-4">
                      {/* Actions */}
                      <div className="flex items-center space-x-4 mb-3 text-gray-600">
                        <HiHeart className="w-6 h-6 hover:text-red-500 cursor-pointer" />
                        <HiChatAlt className="w-6 h-6 hover:text-blue-500 cursor-pointer" />
                        <HiShare className="w-6 h-6 hover:text-green-500 cursor-pointer" />
                      </div>

                      {/* Caption */}
                      <p className="text-sm text-gray-900 mb-2 whitespace-pre-line">
                        {post.caption}
                      </p>

                      {/* Hashtags */}
                      <div className="flex flex-wrap gap-1">
                        {post.hashtags.map((tag, i) => (
                          <span key={i} className="text-xs text-blue-600">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
