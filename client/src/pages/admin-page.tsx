import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Video, InsertVideo } from "@shared/schema";
import AddVideoModal from "@/components/add-video-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Shield, Video as VideoIcon, Users, Eye, Plus, Edit, Trash2, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface AdminStats {
  totalVideos: number;
  totalUsers: number;
  totalViews: number;
}

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  // Redirect if not admin
  if (user?.role !== "ADMIN") {
    setLocation("/");
    return null;
  }

  const { data: videos, isLoading: videosLoading } = useQuery<Video[]>({
    queryKey: ["/api/admin/videos"],
  });

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (videoId: string) => {
      await apiRequest("DELETE", `/api/admin/videos/${videoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteVideo = (videoId: string) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      deleteVideoMutation.mutate(videoId);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (videosLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-telegram"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="admin-page">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <Shield className="text-white text-sm" data-testid="icon-admin" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900" data-testid="text-admin-title">
                Admin Panel
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setLocation("/")}
                variant="outline"
                size="sm"
                data-testid="button-user-view"
              >
                User View
              </Button>

              <Button
                onClick={() => setShowAddVideoModal(true)}
                className="bg-telegram hover:bg-telegram-dark"
                data-testid="button-add-video"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Video
              </Button>

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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <VideoIcon className="text-blue-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Videos</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-total-videos">
                    {stats?.totalVideos || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="text-green-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-total-users">
                    {stats?.totalUsers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Eye className="text-purple-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-total-views">
                    {stats?.totalViews || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Video Management Table */}
        <Card>
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900" data-testid="text-video-management">
                Video Management
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Video
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {videos?.map((video) => (
                    <tr key={video.id} className="hover:bg-gray-50" data-testid={`video-row-${video.id}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-24">
                            <div className="h-16 w-24 bg-gray-200 rounded-lg flex items-center justify-center">
                              <VideoIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900" data-testid={`video-title-${video.id}`}>
                              {video.title}
                            </div>
                            <div className="text-sm text-gray-500" data-testid={`video-duration-${video.id}`}>
                              {video.duration || "Unknown"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2" data-testid={`video-permissions-${video.id}`}>
                          {video.canPlay && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Play
                            </Badge>
                          )}
                          {video.canShare && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Share
                            </Badge>
                          )}
                          {video.canDownload && (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                              Download
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div data-testid={`video-views-${video.id}`}>
                          {video.views || 0} views
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingVideo(video)}
                            className="text-telegram hover:text-telegram-dark"
                            data-testid={`button-edit-${video.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVideo(video.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={deleteVideoMutation.isPending}
                            data-testid={`button-delete-${video.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {videos?.length === 0 && (
                <div className="text-center py-12" data-testid="empty-state">
                  <VideoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No videos yet</h3>
                  <p className="text-gray-600 mb-4">Get started by adding your first video</p>
                  <Button
                    onClick={() => setShowAddVideoModal(true)}
                    className="bg-telegram hover:bg-telegram-dark"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Video
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Modals */}
      {showAddVideoModal && (
        <AddVideoModal
          onClose={() => setShowAddVideoModal(false)}
          data-testid="add-video-modal"
        />
      )}

      {editingVideo && (
        <AddVideoModal
          video={editingVideo}
          onClose={() => setEditingVideo(null)}
          data-testid="edit-video-modal"
        />
      )}
    </div>
  );
}
