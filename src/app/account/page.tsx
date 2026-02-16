'use client';

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  User,
  Mail,
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
      email: user?.email || '',
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
      <div className="min-h-screen bg-zen-cream dark:bg-zen-night">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-zen-forest dark:text-zen-sage-light mb-4">
              Account Settings
            </h1>
            <p className="text-xl text-zen-moss dark:text-zen-stone">
              Manage your account and preferences
            </p>
          </div>

          {/* Profile Section */}
          <div className="mb-8 bg-white rounded-xl border border-zen-sand p-8 dark:bg-zen-night-card dark:border-zen-night-border">
            <h2 className="text-2xl font-bold text-zen-forest mb-6 flex items-center gap-2 dark:text-zen-parchment">
              <User size={24} />
              Profile Information
            </h2>

            {/* Profile Picture */}
            <div className="mb-6 flex items-center gap-6">
              {profile.photoUrl ? (
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-zen-sand dark:border-zen-night-border">
                  <img
                    src={profile.photoUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-zen-sage rounded-full flex items-center justify-center text-white text-3xl font-bold">
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
                  className="flex items-center gap-2 px-4 py-2 bg-zen-sage text-white rounded-lg hover:bg-zen-sage-light transition-colors cursor-pointer"
                >
                  <Camera size={18} />
                  Change Photo
                </label>
                <p className="text-xs text-zen-stone dark:text-zen-stone mt-2">Max 5MB (JPG, PNG, GIF)</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zen-moss dark:text-zen-stone mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-3 border border-zen-sand rounded-xl focus:border-zen-sage focus:ring-2 focus:ring-zen-sage-soft transition-all dark:bg-zen-night-surface dark:border-zen-night-border dark:text-zen-parchment dark:placeholder-zen-stone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zen-moss dark:text-zen-stone mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-3 border border-zen-sand rounded-xl focus:border-zen-sage focus:ring-2 focus:ring-zen-sage-soft transition-all dark:bg-zen-night-surface dark:border-zen-night-border dark:text-zen-parchment dark:placeholder-zen-stone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zen-moss dark:text-zen-stone mb-2">
                  Bio
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full px-4 py-3 border border-zen-sand rounded-xl focus:border-zen-sage focus:ring-2 focus:ring-zen-sage-soft transition-all resize-none dark:bg-zen-night-surface dark:border-zen-night-border dark:text-zen-parchment dark:placeholder-zen-stone"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zen-moss dark:text-zen-stone mb-2">
                    <Globe size={16} className="inline mr-2" />
                    Timezone
                  </label>
                  <select
                    value={profile.timezone}
                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                    className="w-full px-4 py-3 border border-zen-sand rounded-xl focus:border-zen-sage focus:ring-2 focus:ring-zen-sage-soft transition-all dark:bg-zen-night-surface dark:border-zen-night-border dark:text-zen-parchment dark:placeholder-zen-stone"
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
                  <label className="block text-sm font-medium text-zen-moss dark:text-zen-stone mb-2">
                    <Calendar size={16} className="inline mr-2" />
                    Date Format
                  </label>
                  <select
                    value={profile.dateFormat}
                    onChange={(e) => setProfile({ ...profile, dateFormat: e.target.value })}
                    className="w-full px-4 py-3 border border-zen-sand rounded-xl focus:border-zen-sage focus:ring-2 focus:ring-zen-sage-soft transition-all dark:bg-zen-night-surface dark:border-zen-night-border dark:text-zen-parchment dark:placeholder-zen-stone"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleProfileUpdate}
                className="flex items-center gap-2 px-6 py-3 bg-zen-sage text-white rounded-xl font-medium hover:bg-zen-sage-light hover:shadow-sm transition-all"
              >
                <Save size={20} />
                Save Profile
              </button>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="mb-8 bg-white rounded-xl border border-zen-sand p-8 dark:bg-zen-night-card dark:border-zen-night-border">
            <h2 className="text-2xl font-bold text-zen-forest mb-6 flex items-center gap-2 dark:text-zen-parchment">
              <Bell size={24} />
              Preferences
            </h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-zen-parchment dark:bg-zen-night-surface/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Moon size={20} className="text-zen-moss dark:text-zen-stone" />
                  <div>
                    <p className="font-medium text-zen-forest dark:text-zen-parchment">Dark Mode</p>
                    <p className="text-sm text-zen-moss dark:text-zen-stone">Enable dark theme</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.darkMode}
                    onChange={(e) => setPreferences({ ...preferences, darkMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zen-sand dark:bg-zen-night-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-zen-sage-soft rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zen-sand after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zen-sage"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-zen-parchment dark:bg-zen-night-surface/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-zen-moss dark:text-zen-stone" />
                  <div>
                    <p className="font-medium text-zen-forest dark:text-zen-parchment">Notifications</p>
                    <p className="text-sm text-zen-moss dark:text-zen-stone">Receive app notifications</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.notifications}
                    onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zen-sand dark:bg-zen-night-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-zen-sage-soft rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zen-sand after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zen-sage"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-zen-parchment dark:bg-zen-night-surface/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-zen-moss dark:text-zen-stone" />
                  <div>
                    <p className="font-medium text-zen-forest dark:text-zen-parchment">Email Digest</p>
                    <p className="text-sm text-zen-moss dark:text-zen-stone">Weekly summary emails</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.emailDigest}
                    onChange={(e) => setPreferences({ ...preferences, emailDigest: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zen-sand dark:bg-zen-night-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-zen-sage-soft rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zen-sand after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zen-sage"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-zen-parchment dark:bg-zen-night-surface/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Save size={20} className="text-zen-moss dark:text-zen-stone" />
                  <div>
                    <p className="font-medium text-zen-forest dark:text-zen-parchment">Auto-Save</p>
                    <p className="text-sm text-zen-moss dark:text-zen-stone">Automatically save entries</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.autoSave}
                    onChange={(e) => setPreferences({ ...preferences, autoSave: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zen-sand dark:bg-zen-night-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-zen-sage-soft rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zen-sand after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zen-sage"></div>
                </label>
              </div>

              <button
                onClick={handlePreferencesUpdate}
                className="flex items-center gap-2 px-6 py-3 bg-zen-sage text-white rounded-xl font-medium hover:bg-zen-sage-light hover:shadow-sm transition-all"
              >
                <Save size={20} />
                Save Preferences
              </button>
            </div>
          </div>

          {/* Sign Out */}
          <div className="bg-zen-parchment rounded-xl border border-zen-sand p-8 dark:bg-zen-night-card dark:border-zen-night-border">
            <h2 className="text-2xl font-bold text-zen-forest dark:text-zen-parchment mb-2">Sign Out</h2>
            <p className="text-zen-moss dark:text-zen-stone mb-6">
              Sign out of your account on this device
            </p>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-6 py-3 bg-zen-forest text-white rounded-xl font-medium hover:bg-zen-moss transition-all"
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
