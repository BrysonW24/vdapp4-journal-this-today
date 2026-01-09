'use client';

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  User,
  Mail,
  Key,
  Shield,
  Bell,
  Moon,
  Globe,
  Calendar,
  Save,
  LogOut,
  Camera,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AccountPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [profile, setProfile] = useState(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        try {
          return JSON.parse(storedProfile);
        } catch (_e) {
          // Fall through to default
        }
      }
    }
    return {
      name: user?.name || 'Journal User',
      email: user?.email || 'user@example.com',
      bio: '',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      photoUrl: '',
    };
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    notifications: true,
    emailDigest: false,
    autoSave: true,
    defaultMood: 'neutral',
  });

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
  });

  const handleProfileUpdate = () => {
    // Save to localStorage so Layout can pick it up
    if (typeof window !== 'undefined') {
      localStorage.setItem('userProfile', JSON.stringify(profile));
      // Dispatch custom event to notify Layout of the update
      window.dispatchEvent(new Event('profileUpdated'));
    }
    toast.success('Profile updated successfully!');
  };

  const handlePreferencesUpdate = () => {
    toast.success('Preferences saved!');
  };

  const handlePasswordChange = () => {
    toast.success('Password change request sent to your email');
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Convert to base64 and store
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoUrl = reader.result as string;
        setProfile({ ...profile, photoUrl });
        toast.success('Photo uploaded! Click Save Profile to keep changes.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignOut = async () => {
    await logout();
    toast.success('Signed out successfully');
    router.push('/login');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Account Settings
            </h1>
            <p className="text-xl text-gray-600">
              Manage your account and preferences
            </p>
          </div>

          {/* Profile Section */}
          <div className="mb-8 bg-white rounded-xl border-2 border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User size={24} />
              Profile Information
            </h2>

            {/* Profile Picture */}
            <div className="mb-6 flex items-center gap-6">
              {profile.photoUrl ? (
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
                  <img
                    src={profile.photoUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <label
                  htmlFor="photo-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Camera size={18} />
                  Change Photo
                </label>
                <p className="text-xs text-gray-500 mt-2">Max 5MB (JPG, PNG, GIF)</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe size={16} className="inline mr-2" />
                    Timezone
                  </label>
                  <select
                    value={profile.timezone}
                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Australia/Sydney">Sydney (AEST)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-2" />
                    Date Format
                  </label>
                  <select
                    value={profile.dateFormat}
                    onChange={(e) => setProfile({ ...profile, dateFormat: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleProfileUpdate}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <Save size={20} />
                Save Profile
              </button>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="mb-8 bg-white rounded-xl border-2 border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Bell size={24} />
              Preferences
            </h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Moon size={20} className="text-gray-700" />
                  <div>
                    <p className="font-medium text-gray-900">Dark Mode</p>
                    <p className="text-sm text-gray-600">Enable dark theme</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.darkMode}
                    onChange={(e) => setPreferences({ ...preferences, darkMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-gray-700" />
                  <div>
                    <p className="font-medium text-gray-900">Notifications</p>
                    <p className="text-sm text-gray-600">Receive app notifications</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.notifications}
                    onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-gray-700" />
                  <div>
                    <p className="font-medium text-gray-900">Email Digest</p>
                    <p className="text-sm text-gray-600">Weekly summary emails</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.emailDigest}
                    onChange={(e) => setPreferences({ ...preferences, emailDigest: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Save size={20} className="text-gray-700" />
                  <div>
                    <p className="font-medium text-gray-900">Auto-Save</p>
                    <p className="text-sm text-gray-600">Automatically save entries</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.autoSave}
                    onChange={(e) => setPreferences({ ...preferences, autoSave: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <button
                onClick={handlePreferencesUpdate}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <Save size={20} />
                Save Preferences
              </button>
            </div>
          </div>

          {/* Security Section */}
          <div className="mb-8 bg-white rounded-xl border-2 border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield size={24} />
              Security
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Key size={16} className="inline mr-2" />
                  Password
                </label>
                <button
                  onClick={handlePasswordChange}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Change Password
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-gray-700" />
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={security.twoFactorEnabled}
                    onChange={(e) => setSecurity({ ...security, twoFactorEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (minutes)
                </label>
                <select
                  value={security.sessionTimeout}
                  onChange={(e) => setSecurity({ ...security, sessionTimeout: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                  <option value="1440">24 hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign Out</h2>
            <p className="text-gray-600 mb-6">
              Sign out of your account on this device
            </p>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition-all"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
