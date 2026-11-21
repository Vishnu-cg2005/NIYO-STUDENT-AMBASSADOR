import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xjpugxfohmmyysyntbao.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_61le9ZhyAfLPVB84Ais-mw_o4X_sEOv';

// Initialize Supabase Client
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

/**
 * Initiates real Google OAuth flow via Supabase.
 * Redirects user to Google consent screen and returns to current app origin.
 * 
 * @param {string} redirectHash - Hash route to land on after successful auth (e.g. '#dashboard')
 */
export async function signInWithGoogle(redirectHash = '#dashboard') {
  try {
    const origin = window.location.origin;
    // Construct return URL with exact hash routing
    const redirectTo = `${origin}${window.location.pathname}${redirectHash}`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('[Supabase Auth] Google OAuth Error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('[Supabase Auth] Unexpected Google Sign-In Error:', err);
    return { success: false, error: err };
  }
}

/**
 * Sign in with email and password via Supabase Auth
 */
export async function signInWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
}

/**
 * Sign up with email and password via Supabase Auth
 */
export async function signUpWithEmail(email, password, metadata = {}) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) {
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
}

/**
 * Signs out user from Supabase and clears local student session
 */
export async function signOutUser() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('[Supabase Auth] Sign out error:', err);
  } finally {
    // Clear student local keys
    try {
      localStorage.removeItem('niyo_student_user');
      localStorage.removeItem('niyo_active_profile');
    } catch {
      // ignore
    }
  }
}

/**
 * Checks if a user's required profile fields are fully completed.
 * Required: fullName, phone, collegeName, department, yearOfStudy, city, state, graduationYear
 */
export function isProfileComplete(profile) {
  if (!profile) return false;
  const required = [
    'fullName',
    'phone',
    'collegeName',
    'department',
    'yearOfStudy',
    'city',
    'state',
    'graduationYear',
  ];
  return required.every((field) => {
    const val = profile[field];
    return typeof val === 'string' && val.trim().length > 0;
  });
}

/**
 * Retrieves the student's profile for a specific user ID.
 * Falls back to stored local profile or user metadata.
 */
export function getUserProfile(userId) {
  if (!userId) return null;
  try {
    const key = `niyo_profile_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Saves profile data for a specific user ID.
 * 
 * NOTE ON SUPABASE PERSISTENCE:
 * Database tables are not yet created in this phase.
 * We store this in localStorage under `niyo_profile_${userId}` with an explicit
 * `isTemporaryPreview: true` flag.
 * 
 * When the Supabase 'profiles' database table is created, replace with:
 * const { data, error } = await supabase.from('profiles').upsert({ id: userId, ...profileData });
 */
export function saveUserProfile(userId, profileData) {
  if (!userId) return { success: false, error: 'User ID is required.' };
  try {
    const payload = {
      ...profileData,
      userId,
      isTemporaryPreview: true,
      updatedAt: new Date().toISOString(),
    };
    const key = `niyo_profile_${userId}`;
    localStorage.setItem(key, JSON.stringify(payload));
    localStorage.setItem('niyo_active_profile', JSON.stringify(payload));

    // Also update niyo_student_user for compatibility with existing dashboard
    const studentUser = {
      id: userId,
      fullName: payload.fullName,
      email: payload.email,
      collegeName: payload.collegeName,
      phone: payload.phone,
      department: payload.department,
      yearOfStudy: payload.yearOfStudy,
      city: payload.city,
      state: payload.state,
      graduationYear: payload.graduationYear,
      authProvider: payload.authProvider || 'google',
    };
    localStorage.setItem('niyo_student_user', JSON.stringify(studentUser));

    return { success: true, profile: payload };
  } catch (err) {
    console.error('[Supabase Auth] Failed to save profile locally:', err);
    return { success: false, error: err.message };
  }
}
