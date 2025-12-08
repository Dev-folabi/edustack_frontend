"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "../ui/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  userService,
  UserProfile,
  UpdateProfileData,
} from "../../services/userService";
import { COLORS } from "@/constants/config";
import { Loader } from "../ui/Loader";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLock,
  FaCamera,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
  photo_url: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export const ProfilePage: React.FC = () => {
  const { showToast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      email: "",
      name: "",
      phone: "",
      address: "",
      photo_url: "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userService.getUserProfile();
        if (response.data) {
          setUser(response.data);
          const userData = response.data;
          const roleData =
            userData.staff || userData.student || userData.parent;

          profileForm.reset({
            username: userData.username,
            email: userData.email,
            name: roleData?.name || "",
            phone: Array.isArray(roleData?.phone)
              ? roleData?.phone[0]
              : roleData?.phone || "",
            address: roleData?.address || "",
            photo_url: roleData?.photo_url || "",
          });
        }
      } catch (error) {
        showToast({
          title: "Error",
          type: "error",
          message: "Failed to load profile",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [showToast, profileForm]);

  const onProfileSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true);
    try {
      const updateData: UpdateProfileData = {
        username: values.username,
        email: values.email,
        name: values.name,
        phone: values.phone,
        address: values.address,
        photo_url: values.photo_url,
      };

      const response = await userService.updateUserProfile(updateData);
      if (response.success && response.data) {
        setUser(response.data);
        showToast({
          title: "Success",
          type: "success",
          message: "Profile updated successfully",
        });
      }
    } catch (error) {
      showToast({
        title: "Error",
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to update profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setIsSaving(true);
    try {
      const updateData: UpdateProfileData = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      };

      const response = await userService.updateUserProfile(updateData);
      if (response.success) {
        showToast({
          title: "Success",
          type: "success",
          message: "Password updated successfully",
        });
        passwordForm.reset();
        setIsEditingPassword(false);
      }
    } catch (error) {
      showToast({
        title: "Error",
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to update password",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loader text="Loading profile..." />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6">
          <p className="text-red-500">Failed to load profile.</p>
        </Card>
      </div>
    );
  }

  const roleData = user.staff || user.student || user.parent;
  const userRole = user.staff
    ? "Staff"
    : user.student
    ? "Student"
    : user.parent
    ? "Parent"
    : "User";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Profile Header Card */}
        <Card className="mb-8 overflow-hidden border-0 shadow-lg">
          <div
            className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary[500]} 0%, ${COLORS.primary[700]} 100%)`,
            }}
          />
          <CardContent className="relative pt-0 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                  <AvatarImage src={roleData?.photo_url} alt={roleData?.name} />
                  <AvatarFallback
                    className="text-4xl font-bold text-white"
                    style={{ backgroundColor: COLORS.primary[500] }}
                  >
                    {roleData?.name?.charAt(0) || user.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <button
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow"
                  style={{ color: COLORS.primary[500] }}
                >
                  <FaCamera className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {roleData?.name || user.username}
                </h1>
                <p className="text-gray-600 mb-2 flex items-center justify-center md:justify-start gap-2">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: COLORS.primary[500] }}
                  >
                    {userRole}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>{user.email}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FaUser
                      className="w-5 h-5"
                      style={{ color: COLORS.primary[500] }}
                    />
                    Personal Information
                  </CardTitle>
                  <FaEdit className="w-4 h-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...profileForm}>
                  <form
                    onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <FaUser className="w-4 h-4 text-gray-400" />
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="border-gray-300 focus:border-primary focus:ring-primary"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <FaUser className="w-4 h-4 text-gray-400" />
                              Username
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="border-gray-300 focus:border-primary focus:ring-primary"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <FaEnvelope className="w-4 h-4 text-gray-400" />
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                className="border-gray-300 focus:border-primary focus:ring-primary"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <FaPhone className="w-4 h-4 text-gray-400" />
                              Phone Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="border-gray-300 focus:border-primary focus:ring-primary"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="flex items-center gap-2">
                              <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
                              Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="border-gray-300 focus:border-primary focus:ring-primary"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="photo_url"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="flex items-center gap-2">
                              <FaCamera className="w-4 h-4 text-gray-400" />
                              Photo URL
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="https://..."
                                className="border-gray-300 focus:border-primary focus:ring-primary"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end pt-4 border-t">
                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6"
                        style={{ backgroundColor: COLORS.primary[500] }}
                      >
                        <FaSave className="w-4 h-4" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Security Section */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="flex items-center gap-2">
                  <FaLock
                    className="w-5 h-5"
                    style={{ color: COLORS.primary[500] }}
                  />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {!isEditingPassword ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Password</p>
                        <p className="text-sm text-gray-500">••••••••</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingPassword(true)}
                        className="flex items-center gap-2"
                      >
                        <FaEdit className="w-3 h-3" />
                        Change
                      </Button>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Security Tip:</strong> Use a strong password
                        with at least 6 characters.
                      </p>
                    </div>
                  </div>
                ) : (
                  <Form {...passwordForm}>
                    <form
                      onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                autoComplete="current-password"
                                className="border-gray-300"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                autoComplete="new-password"
                                className="border-gray-300"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                autoComplete="new-password"
                                className="border-gray-300"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-2 pt-2">
                        <Button
                          type="submit"
                          disabled={isSaving}
                          className="flex-1 flex items-center justify-center gap-2"
                          style={{ backgroundColor: COLORS.primary[500] }}
                        >
                          <FaSave className="w-4 h-4" />
                          {isSaving ? "Updating..." : "Update"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditingPassword(false);
                            passwordForm.reset();
                          }}
                          className="flex items-center gap-2"
                        >
                          <FaTimes className="w-4 h-4" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="text-lg">Account Info</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Role</span>
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: COLORS.primary[500] }}
                  >
                    {userRole}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Account Status</span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                    Active
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
