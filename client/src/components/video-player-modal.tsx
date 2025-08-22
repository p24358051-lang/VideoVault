import { useEffect, useRef } from "react";
import { Video } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share, Download, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoPlayerModalProps {
  video: Video;
  onClose: () => void;
}

export default function VideoPlayerModal({ video, onClose }: VideoPlayerModalProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Auto-play when modal opens (if browser allows)
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Auto-play might be blocked, that's okay
      });
    }
  }, []);

  const handleShare = async () => {
    if (!video.canShare) {
      toast({
        title: "Sharing not allowed",
        description: "This video cannot be shared",
        variant: "destructive",
      });
      return;
    }

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
    <Dialog open={true} onOpenChange={onClose} data-testid="video-player-modal">
      <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle data-testid="video-title">{video.title}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-auto max-h-[60vh]"
            controls
            src={video.sourceUrl}
            data-testid="video-player"
          >
            <source src={video.sourceUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-3">
              <Button
                onClick={handleShare}
                className="bg-telegram hover:bg-telegram-dark"
                disabled={!video.canShare}
                data-testid="button-share-modal"
              >
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>

              <Button
                onClick={handleDownload}
                variant="outline"
                disabled={!video.canDownload}
                data-testid="button-download-modal"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>

            <div className="text-sm text-gray-600" data-testid="video-views-modal">
              {video.views} views
            </div>
          </div>

          {video.description && (
            <div>
              <p className="text-gray-700" data-testid="video-description-modal">
                {video.description}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
