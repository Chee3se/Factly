import { useState, useRef, JSX } from "react";
import { router } from "@inertiajs/react";
import App from "@/layouts/App";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  Save,
  Shield,
  Camera,
  AlertTriangle,
  Upload,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  LogOut,
  X,
} from "lucide-react";
import { DeviceType, Session } from "@/types/session";
import { Type } from "@/types/enums";
import { Decoration } from "@/types";
import { ImageCropper } from "@/components/Profile/ImageCropper";
import { useLobby } from "@/hooks/useLobby";
import LobbyNotificationBanner from "@/components/Lobby/LobbyNotificationBanner";

export interface Props {
  auth: Auth;
  sessions: Session[];
  decorations: Decoration[];
}

interface PasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

interface FormData {
  name: string;
  email: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/svg+xml",
];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".svg"];

export default function Profile({
  auth,
  sessions = [],
  decorations = [],
}: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: auth.user.name || "",
    email: auth.user.email || "",
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [showCropDialog, setShowCropDialog] = useState<boolean>(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState<boolean>(false);
  const [showSessionsDialog, setShowSessionsDialog] = useState<boolean>(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [passwordData, setPasswordData] = useState<PasswordData>({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const handleDecorationChange = (decorationId: number | null) => {
    setIsLoading(true);
    router.put(
      route("profile.decoration.update"),
      { decoration_id: decorationId },
      {
        onSuccess: () => {
          setIsLoading(false);
          router.reload();
        },
        onError: () => {
          setIsLoading(false);
        },
      },
    );
  };

  const { currentLobby } = useLobby(auth.user?.id);

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (
    field: keyof PasswordData,
    value: string,
  ): void => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = (): void => {
    setIsLoading(true);

    // @ts-ignore
    router.put(route("profile.update"), formData, {
      onSuccess: () => {
        setIsLoading(false);
      },
      onError: () => {
        setIsLoading(false);
      },
    });
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return "The file must not be larger than 2MB.";
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "The file must be a JPEG, PNG, GIF, or SVG image.";
    }

    // Check file extension
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return "The file must have a valid image extension (.jpg, .jpeg, .png, .gif, or .svg).";
    }

    return null;
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const file = event.target.files?.[0];
    setFileError("");

    if (file) {
      // Validate file
      const error = validateFile(file);
      if (error) {
        setFileError(error);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      setSelectedImageFile(file);
      setShowAvatarDialog(false);
      setShowCropDialog(true);
    }
  };

  const handleCropComplete = (croppedFile: File): void => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("avatar", croppedFile);

    router.post(route("profile.avatar.upload"), formData, {
      onSuccess: () => {
        setIsLoading(false);
        setSelectedImageFile(null);
        setFileError("");
      },
      onError: () => {
        setIsLoading(false);
        setSelectedImageFile(null);
      },
    });
  };

  const handlePasswordUpdate = (): void => {
    setIsLoading(true);

    // @ts-ignore
    router.put(route("profile.password"), passwordData, {
      onSuccess: () => {
        setPasswordData({
          current_password: "",
          password: "",
          password_confirmation: "",
        });
        setIsLoading(false);
      },
      onError: () => {
        setIsLoading(false);
      },
    });
  };

  const handleDeleteAccount = (): void => {
    setIsLoading(true);
    router.delete(route("profile.destroy"), {
      onSuccess: () => {
        setIsLoading(false);
      },
      onError: () => {
        setIsLoading(false);
      },
    });
  };

  const handleLogoutOtherSessions = (): void => {
    setIsLoading(true);
    router.post(
      route("profile.logout-other-sessions"),
      {},
      {
        onSuccess: () => {
          setIsLoading(false);
        },
        onError: () => {
          setIsLoading(false);
        },
      },
    );
  };

  const handleLogoutSession = (sessionId: string): void => {
    setIsLoading(true);
    router.delete(route("profile.session.logout", { session_id: sessionId }), {
      onSuccess: () => {
        setIsLoading(false);
      },
      onError: () => {
        setIsLoading(false);
      },
    });
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDeviceIcon = (device: DeviceType): JSX.Element => {
    switch (device) {
      case "Mobile Device":
        return <Smartphone className="h-4 w-4" />;
      case "Tablet":
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getAvatarUrl = (avatar?: string): string | null => {
    if (!avatar) return null;
    return `/storage/${avatar}`;
  };

  const isGoogleUser = auth.user.type === Type.Google;

  return (
    <App title="Profile" auth={auth}>
      <LobbyNotificationBanner currentLobby={currentLobby} />
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar
                      className="h-20 w-20"
                      decoration={auth.user.decoration}
                      margin="m-1"
                    >
                      <AvatarImage
                        src={getAvatarUrl(auth.user.avatar) || undefined}
                        alt={formData.name}
                      />
                      <AvatarFallback className="text-lg">
                        {getInitials(formData.name)}
                      </AvatarFallback>
                    </Avatar>
                    <Dialog
                      open={showAvatarDialog}
                      onOpenChange={(open) => {
                        setShowAvatarDialog(open);
                        if (!open) {
                          setFileError("");
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute -bottom-2 cursor-pointer -right-2 h-8 w-8 rounded-full p-0"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Change Profile Picture</DialogTitle>
                          <DialogDescription>
                            Upload a custom image for your profile picture.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {fileError && (
                            <Alert variant="destructive">
                              <AlertDescription>{fileError}</AlertDescription>
                            </Alert>
                          )}
                          <div className="text-center">
                            <div className="flex items-center justify-center">
                              <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2"
                                disabled={isLoading}
                              >
                                <Upload className="h-4 w-4" />
                                {isLoading ? "Uploading..." : "Choose Image"}
                              </Button>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept=".jpg,.jpeg,.png,.gif,.svg"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Supports JPEG, PNG, GIF, SVG (max 2MB)
                            </p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold">{formData.name}</h2>
                    <p className="text-muted-foreground">{formData.email}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="secondary">
                        {auth.user.role || "User"}
                      </Badge>
                      {isGoogleUser && (
                        <Badge
                          variant="outline"
                          className="text-blue-600 border-blue-200"
                        >
                          Google Account
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        Member since{" "}
                        {new Date(
                          auth.user.created_at || Date.now(),
                        ).getFullYear()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your username and email address.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Username</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      disabled={isLoading || isGoogleUser}
                    />
                    {isGoogleUser && (
                      <p className="text-sm text-muted-foreground">
                        Email cannot be changed for Google accounts
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSave}
                    className="flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🎨</span>
                  Profile Decorations
                </CardTitle>
                <CardDescription>
                  Choose a decoration to frame your profile picture.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div
                    className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all ${
                      !auth.user.decoration
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleDecorationChange(null)}
                  >
                    <Avatar className="mx-auto mb-2 h-16 w-16">
                      <AvatarImage
                        src={getAvatarUrl(auth.user.avatar) || undefined}
                        alt={formData.name}
                      />
                      <AvatarFallback>
                        {getInitials(formData.name)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium">None</p>
                  </div>
                  {decorations.map((decoration) => (
                    <div
                      key={decoration.id}
                      className={`${
                        decoration.is_unlocked
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-50"
                      } border-2 rounded-lg p-4 text-center transition-all ${
                        auth.user.decoration?.id === decoration.id
                          ? "border-primary bg-primary/10"
                          : decoration.is_unlocked
                            ? "border-gray-200 hover:border-gray-300"
                            : "border-gray-300"
                      }`}
                      onClick={() =>
                        decoration.is_unlocked
                          ? handleDecorationChange(decoration.id)
                          : undefined
                      }
                    >
                      <Avatar
                        className="h-16 w-16"
                        decoration={decoration}
                        margin="m-1"
                      >
                        <AvatarImage
                          src={getAvatarUrl(auth.user.avatar) || undefined}
                          alt={formData.name}
                        />
                        <AvatarFallback>
                          {getInitials(formData.name)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium">{decoration.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {decoration.is_unlocked
                          ? decoration.description
                          : decoration.unlock_description || "Locked"}
                      </p>
                      {!decoration.is_unlocked && (
                        <p className="text-xs text-red-500 mt-1">🔒 Locked</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isGoogleUser && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium">Change Password</h4>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="current_password">
                          Current Password
                        </Label>
                        <Input
                          id="current_password"
                          type="password"
                          value={passwordData.current_password}
                          onChange={(e) =>
                            handlePasswordChange(
                              "current_password",
                              e.target.value,
                            )
                          }
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new_password">New Password</Label>
                        <Input
                          id="new_password"
                          type="password"
                          value={passwordData.password}
                          onChange={(e) =>
                            handlePasswordChange("password", e.target.value)
                          }
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm_password">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirm_password"
                          type="password"
                          value={passwordData.password_confirmation}
                          onChange={(e) =>
                            handlePasswordChange(
                              "password_confirmation",
                              e.target.value,
                            )
                          }
                          disabled={isLoading}
                        />
                      </div>

                      <Button
                        onClick={handlePasswordUpdate}
                        className="w-fit"
                        disabled={
                          isLoading ||
                          !passwordData.current_password ||
                          !passwordData.password ||
                          !passwordData.password_confirmation
                        }
                      >
                        {isLoading ? "Updating..." : "Update Password"}
                      </Button>
                    </div>
                  </div>
                )}

                {isGoogleUser && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">
                      Google Account Security
                    </h4>
                    <p className="text-sm text-blue-700">
                      Your account is managed through Google. To change your
                      password or security settings, please visit your Google
                      Account settings.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Active Sessions</h4>
                      <p className="text-sm text-muted-foreground">
                        Manage your active sessions across devices (
                        {sessions.length} active)
                      </p>
                    </div>
                    <Dialog
                      open={showSessionsDialog}
                      onOpenChange={setShowSessionsDialog}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline">View Sessions</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Active Sessions</DialogTitle>
                          <DialogDescription>
                            Manage your active sessions across different devices
                            and browsers.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {sessions.length > 0 ? (
                            sessions.map((session: Session, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-4 border rounded-lg"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0 mt-1">
                                    {getDeviceIcon(session.device)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium">
                                        {session.device}
                                      </h4>
                                      {session.is_current && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          Current Session
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {session.browser} on {session.platform}
                                    </p>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                      {session.location && (
                                        <span className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {session.location}
                                        </span>
                                      )}
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {session.last_active}
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      IP: {session.ip_address}
                                    </p>
                                  </div>
                                </div>
                                {!session.is_current && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleLogoutSession(session.id)
                                    }
                                    disabled={isLoading}
                                  >
                                    <LogOut className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-muted-foreground py-8">
                              No active sessions found.
                            </p>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={handleLogoutOtherSessions}
                            disabled={isLoading}
                          >
                            {isLoading
                              ? "Logging out..."
                              : "Logout All Other Sessions"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50/50">
              <CardHeader className="border-b border-red-200">
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  These actions cannot be undone. Please be careful.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white border border-red-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 mb-1">
                      Delete Account
                    </h4>
                    <p className="text-sm text-red-700">
                      Permanently delete your account and all associated data.
                      This action cannot be undone.
                    </p>
                  </div>
                  <Dialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        disabled={isLoading}
                        className="sm:ml-4 whitespace-nowrap"
                      >
                        Delete Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="h-5 w-5" />
                          Delete Account
                        </DialogTitle>
                        <DialogDescription className="text-left">
                          Are you absolutely sure you want to delete your
                          account? This will:
                          <ul className="mt-2 ml-4 list-disc space-y-1">
                            <li>Permanently delete all your data</li>
                            <li>Remove your profile and settings</li>
                            <li>Cancel any active subscriptions</li>
                            <li>Log you out of all devices</li>
                          </ul>
                          <p className="mt-4 font-medium text-red-600">
                            This action cannot be undone.
                          </p>
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowDeleteDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={isLoading}
                        >
                          {isLoading ? "Deleting..." : "Yes, Delete My Account"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <ImageCropper
          open={showCropDialog}
          onOpenChange={setShowCropDialog}
          imageFile={selectedImageFile}
          onCropComplete={handleCropComplete}
        />
      </div>
    </App>
  );
}
