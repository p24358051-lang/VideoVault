import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface ProfileModalProps {
  onClose: () => void;
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/me/avatar", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to upload avatar");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Update the user data in the cache
      queryClient.setQueryData(["/api/user"], (oldUser: any) => ({
        ...oldUser,
        avatarUrl: data.avatarUrl,
      }));
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    uploadAvatarMutation.mutate(file);
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  if (!user) return null;

  return (
    <Dialog open={true} onOpenChange={onClose} data-testid="profile-modal">
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle data-testid="modal-title">Profile Settings</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="button-close-profile"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 pt-0">
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <Avatar className="w-24 h-24" data-testid="avatar-large">
                <AvatarImage src={user.avatarUrl || ""} alt="Profile" />
                <AvatarFallback className="bg-telegram text-white text-2xl">
                  {user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <Button
                onClick={handleCameraClick}
                size="sm"
                className="absolute bottom-0 right-0 w-8 h-8 bg-telegram hover:bg-telegram-dark rounded-full p-0"
                disabled={isUploading}
                data-testid="button-change-avatar"
              >
                <Camera className="h-4 w-4" />
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-file-avatar"
              />
            </div>
            
            {isUploading && (
              <p className="text-sm text-gray-600 mt-2" data-testid="text-uploading">
                Uploading...
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email" data-testid="label-email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-gray-50 text-gray-500"
                data-testid="input-email-readonly"
              />
            </div>

            <div>
              <Label htmlFor="role" data-testid="label-role">Role</Label>
              <Input
                id="role"
                type="text"
                value={user.role}
                disabled
                className="bg-gray-50 text-gray-500"
                data-testid="input-role-readonly"
              />
            </div>

            <div>
              <Label htmlFor="joined" data-testid="label-joined">Member Since</Label>
              <Input
                id="joined"
                type="text"
                value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                disabled
                className="bg-gray-50 text-gray-500"
                data-testid="input-joined-readonly"
              />
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <Button
              onClick={onClose}
              className="flex-1"
              data-testid="button-close-modal"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
