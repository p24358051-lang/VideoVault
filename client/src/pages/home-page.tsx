import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Video } from "@shared/schema";
import VideoCard from "@/components/video-card";
import VideoPlayerModal from "@/components/video-player-modal";
import ProfileModal from "@/components/profile-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Video as VideoIcon, Search, Filter, LogOut } from "lucide-react";
import { useLocation } from "wouter";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
  });

  const filteredVideos = videos?.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleAdminPanel = () => {
    setLocation("/admin");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-telegram"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="home-page">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-telegram to-telegram-dark rounded-lg flex items-center justify-center">
                <VideoIcon className="text-white text-sm" data-testid="icon-logo" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900" data-testid="text-app-title">
                Video Hub
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              {user?.role === "ADMIN" && (
                <Button
                  onClick={handleAdminPanel}
                  variant="outline"
                  size="sm"
                  data-testid="button-admin-panel"
                >
                  Admin Panel
                </Button>
              )}

              <Avatar
                className="cursor-pointer hover:ring-2 hover:ring-telegram transition-all"
                onClick={() => setShowProfileModal(true)}
                data-testid="avatar-profile"
              >
                <AvatarImage src={user?.avatarUrl || ""} alt="Profile" />
                <AvatarFallback className="bg-telegram text-white">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-400 hover:text-gray-600"
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2" data-testid="text-welcome">
            Welcome back, {user?.email}!
          </h2>
          <p className="text-gray-600" data-testid="text-description">
            Discover and enjoy your video collection
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <Button
              variant="outline"
              className="px-4 py-3 flex items-center"
              data-testid="button-filter"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Video Grid */}
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="video-grid">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPlay={() => setSelectedVideo(video)}
                data-testid={`video-card-${video.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12" data-testid="empty-state">
            <VideoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "No videos found" : "No videos available"}
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Videos will appear here when they are added"}
            </p>
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedVideo && (
        <VideoPlayerModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          data-testid="video-player-modal"
        />
      )}

      {showProfileModal && (
        <ProfileModal
          onClose={() => setShowProfileModal(false)}
          data-testid="profile-modal"
        />
      )}
    </div>
  );
}
