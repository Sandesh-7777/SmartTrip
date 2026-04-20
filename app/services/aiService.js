import { GEMINI_URL } from '../constants/gemini';

// Core Gemini API caller
const callGemini = async (prompt) => {
  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
    const errData = await response.json();
    console.log('Gemini API Error:', JSON.stringify(errData));
    if (response.status === 429) {
        throw new Error('RATE_LIMIT');
    }
    throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini raw response:', JSON.stringify(data));

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No response from Gemini');
    return text;
  } catch (err) {
    console.log('callGemini error:', err.message);
    throw err;
  }
};

// ─── 1. Generate Day-wise Itinerary ──────────────────────

export const generateItinerary = async (trip) => {
  const prompt = `
You are a smart travel planner. Generate a detailed day-wise itinerary for this trip.

Trip Details:
- Destination: ${trip.destination}
- Start Date: ${trip.start_date}
- End Date: ${trip.end_date}
- Trip Type: ${trip.trip_type}
- Transport: ${trip.transport}
- Travelers: ${trip.travelers}
- Budget: ₹${trip.budget}
- Notes: ${trip.notes || 'None'}

Return ONLY a valid JSON array like this (no markdown, no explanation):
[
  {
    "day": 1,
    "date": "Day 1 - Mon, 1 Jan",
    "title": "Arrival & Exploration",
    "activities": [
      { "time": "Morning", "icon": "🌅", "activity": "Arrive and check in to hotel" },
      { "time": "Afternoon", "icon": "☀️", "activity": "Visit main attraction" },
      { "time": "Evening", "icon": "🌆", "activity": "Local dinner and rest" }
    ]
  }
]

Generate one object per day. Keep activities realistic for ${trip.destination}.
`;

  const text = await callGemini(prompt);
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

// ─── 2. Recommend Packages ───────────────────────────────

export const generatePackageRecommendations = async (userPreferences) => {
  const prompt = `
You are a travel package recommendation AI.

User Preferences:
- Interests: ${userPreferences.interests?.join(', ') || 'Beach, Mountain, Heritage'}
- Budget per person: ₹${userPreferences.budget || 10000}
- Travel style: ${userPreferences.style || 'Leisure'}
- Past destinations: ${userPreferences.pastDestinations?.join(', ') || 'None'}

From these package categories: Beach, Mountain, Nature, Heritage, Adventure
Recommend 3 package types that best match this user.

Return ONLY valid JSON (no markdown):
{
  "recommendations": [
    {
      "category": "Beach",
      "reason": "Short reason why this matches",
      "topDestination": "Goa",
      "estimatedBudget": "₹8,000 - ₹12,000"
    }
  ]
}
`;

  const text = await callGemini(prompt);
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

// ─── 3. Auto-categorize Expense ──────────────────────────

export const categorizeExpense = async (title, amount) => {
  const prompt = `
Categorize this travel expense into exactly one of these categories:
Food, Transport, Stay, Activities, Shopping, Medical, Fuel, Other

Expense title: "${title}"
Amount: ₹${amount}

Return ONLY the category name, nothing else. Example: Food
`;

  const text = await callGemini(prompt);
  return text.trim();
};

// ─── 4. Generate Trip Suggestions ────────────────────────

export const generateTripSuggestions = async (preferences) => {
  const prompt = `
You are a smart travel suggestion AI for Indian travelers.

User details:
- Budget: ₹${preferences.budget || 10000} per person
- Duration: ${preferences.duration || '3-5'} days
- Travel type: ${preferences.type || 'Leisure'}
- Season: ${preferences.season || 'Any'}
- From city: ${preferences.fromCity || 'Mumbai'}

Suggest 4 trips perfectly matching these preferences.

Return ONLY valid JSON (no markdown):
{
  "suggestions": [
    {
      "destination": "Goa",
      "tagline": "Sun, Sand & Serenity",
      "duration": "3D/2N",
      "estimatedCost": "₹8,000",
      "category": "Beach",
      "emoji": "🏖️",
      "highlights": ["Beach", "Nightlife", "Water Sports"]
    }
  ]
}
`;

  const text = await callGemini(prompt);
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};