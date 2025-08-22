import { useState } from "react";
import { Video } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Share, Download, Video as VideoIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoCardProps {
  video: Video;
  onPlay: () => void;
}

export default function VideoCard({ video, onPlay }: VideoCardProps) {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!video.canShare) {
      toast({
        title: "Sharing not allowed",
        description: "This video cannot be shared",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: video.title,
          text: video.description || "",
          url: window.location.href,
        });
      } else {
        // Fallback to Telegram deep link
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
          window.location.href
        )}&text=${encodeURIComponent(video.title)}`;
        window.open(telegramUrl, "_blank");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast({
          title: "Sharing failed",
          description: "Could not share this video",
          variant: "destructive",
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = () => {
    if (!video.canDownload) {
      toast({
        title: "Download not available",
        description: "This video cannot be downloaded",
        variant: "destructive",
      });
      return;
    }

    // Open download endpoint in new tab
    window.open(`/api/videos/${video.id}/download`, "_blank");
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`video-card-${video.id}`}>
      <div className="relative">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-48 object-cover"
            data-testid={`video-thumbnail-${video.id}`}
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <VideoIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}

        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
          <Button
            onClick={onPlay}
            size="lg"
            className="w-16 h-16 bg-telegram bg-opacity-90 rounded-full opacity-0 hover:opacity-100 transition-opacity transform hover:scale-110"
            disabled={!video.canPlay}
            data-testid={`button-play-${video.id}`}
          >
            <Play className="ml-1" />
          </Button>
        </div>

        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            <span data-testid={`video-duration-${video.id}`}>{video.duration}</span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2" data-testid={`video-title-${video.id}`}>
          {video.title}
        </h3>
        
        {video.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2" data-testid={`video-description-${video.id}`}>
            {video.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              onClick={onPlay}
              size="sm"
              className="bg-telegram hover:bg-telegram-dark"
              disabled={!video.canPlay}
              data-testid={`button-play-card-${video.id}`}
            >
              <Play className="mr-2 h-4 w-4" />
              Play
            </Button>

            <Button
              onClick={handleShare}
              size="sm"
              variant="outline"
              disabled={!video.canShare || isSharing}
              data-testid={`button-share-${video.id}`}
            >
              <Share className="mr-2 h-4 w-4" />
              {isSharing ? "Sharing..." : "Share"}
            </Button>
          </div>

          <Button
            onClick={handleDownload}
            size="sm"
            variant="ghost"
            className={video.canDownload ? "text-gray-600 hover:text-telegram" : "text-gray-300 cursor-not-allowed"}
            disabled={!video.canDownload}
            data-testid={`button-download-${video.id}`}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {video.views !== undefined && (
          <div className="mt-2 text-xs text-gray-500" data-testid={`video-views-${video.id}`}>
            {video.views} views
          </div>
        )}
      </CardContent>
    </Card>
  );
}
