import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertVideoSchema, updateVideoSchema, Video } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { z } from "zod";

interface AddVideoModalProps {
  video?: Video;
  onClose: () => void;
}

type VideoFormData = z.infer<typeof insertVideoSchema>;

export default function AddVideoModal({ video, onClose }: AddVideoModalProps) {
  const { toast } = useToast();
  const isEditing = !!video;

  const form = useForm<VideoFormData>({
    resolver: zodResolver(isEditing ? updateVideoSchema : insertVideoSchema),
    defaultValues: {
      title: video?.title || "",
      description: video?.description || "",
      sourceUrl: video?.sourceUrl || "",
      thumbnailUrl: video?.thumbnailUrl || "",
      duration: video?.duration || "",
      canPlay: video?.canPlay ?? true,
      canShare: video?.canShare ?? true,
      canDownload: video?.canDownload ?? false,
    },
  });

  const videoMutation = useMutation({
    mutationFn: async (data: VideoFormData) => {
      const url = isEditing ? `/api/admin/videos/${video.id}` : "/api/admin/videos";
      const method = isEditing ? "PUT" : "POST";
      const res = await apiRequest(method, url, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      
      toast({
        title: "Success",
        description: isEditing ? "Video updated successfully" : "Video added successfully",
      });
      
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VideoFormData) => {
    videoMutation.mutate(data);
  };

  return (
    <Dialog open={true} onOpenChange={onClose} data-testid="add-video-modal">
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle data-testid="modal-title">
              {isEditing ? "Edit Video" : "Add New Video"}
            </DialogTitle>
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 pt-0 space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-title">Video Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter video title"
                      data-testid="input-title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sourceUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-source-url">Video URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/video.mp4"
                      data-testid="input-source-url"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thumbnailUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-thumbnail-url">Thumbnail URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/thumbnail.jpg"
                      data-testid="input-thumbnail-url"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-duration">Duration (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 4:32"
                      data-testid="input-duration"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-description">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter video description"
                      rows={3}
                      data-testid="textarea-description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="text-base font-medium" data-testid="label-permissions">
                Permissions
              </FormLabel>
              <div className="space-y-3 mt-3">
                <FormField
                  control={form.control}
                  name="canPlay"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-can-play"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel data-testid="label-can-play">Allow Play</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="canShare"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-can-share"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel data-testid="label-can-share">Allow Share</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="canDownload"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-can-download"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel data-testid="label-can-download">Allow Download</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-telegram hover:bg-telegram-dark"
                disabled={videoMutation.isPending}
                data-testid="button-submit"
              >
                {videoMutation.isPending
                  ? isEditing
                    ? "Updating..."
                    : "Adding..."
                  : isEditing
                  ? "Update Video"
                  : "Add Video"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
