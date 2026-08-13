// Auth helper — calls the Flask backend so registered users are shared
// across everyone using the app, not just stored in one browser.

import { API_BASE_URL } from '../config';

export async function registerUser({ name, usn, email, password, bloodGroup, donor }) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, usn, email, password, bloodGroup, donor }),
    });
    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || 'Registration failed.' };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Could not reach the server. Is the backend running?' };
  }
}

export async function loginUser(identifier, password) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || 'Login failed.' };
    }
    return { success: true, user: data.user };
  } catch (err) {
    return { success: false, error: 'Could not reach the server. Is the backend running?' };
  }
}

