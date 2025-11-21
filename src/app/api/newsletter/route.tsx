'use server'

export async function subscribeToNewsletter(prevState: any, formData: FormData) {
  const email = formData.get('email');
  const API_KEY = process.env.NEXT_PUBLIC_KIT_API_KEY;
  const FORM_ID = process.env.NEXT_PUBLIC_KIT_FORM_ID; // Get this from Kit Dashboard
  const API_URL = `https://api.convertkit.com/v3/forms/${FORM_ID}/subscribe`;

  if (!email || typeof email !== 'string') {
    return { error: 'Email is required', success: false };
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: API_KEY, email }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error?.message || 'Something went wrong', success: false };
    }

    return { success: true };
  } catch (error) {
    return { error: 'Failed to connect to newsletter service', success: false };
  }
}