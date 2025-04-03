import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

// Define the form schema
const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  avatar: z.string().nullable().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
}).refine(data => {
  // If password is provided, confirm password must match
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileEditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileEditForm({ open, onOpenChange }: ProfileEditFormProps) {
  const { user, updateProfileMutation } = useAuth();
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(user?.avatar || null);
  
  // Initialize form with current user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      avatar: user?.avatar || "",
      password: "",
      confirmPassword: "",
    },
  });
  
  // When form is submitted, update the user profile
  function onSubmit(data: ProfileFormValues) {
    // Filter out empty password and confirmPassword fields
    const formData = {
      ...data,
      password: data.password ? data.password : undefined,
    };
    delete formData.confirmPassword;
    
    // If avatar wasn't changed, don't include it in the update
    if (formData.avatar === user?.avatar) {
      delete formData.avatar;
    }
    
    // Submit the form
    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  }
  
  // Handle avatar URL input change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPreviewAvatar(value);
    form.setValue("avatar", value);
  };
  
  // Generate avatar fallback using initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Preview and Input */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24 border-4 border-muted">
                <AvatarImage src={previewAvatar || ""} />
                <AvatarFallback>{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
              </Avatar>
              
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/avatar.jpg" 
                        {...field}
                        value={field.value || ''}
                        onChange={handleAvatarChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter a URL for your profile image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Leave blank to keep current password" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    At least 8 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Confirm your new password" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={updateProfileMutation.isPending}
                className="w-full"
              >
                {updateProfileMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}