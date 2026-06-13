// AI matching logic for GlowMap
// Simulates Claude API streaming with realistic mock responses

export const QUIZ_QUESTIONS = [
  {
    id: 'hair_type',
    question: 'What\'s your hair type?',
    stepLabel: 'Step 1 of 4',
    options: [
      { value: 'straight', label: 'Straight & Sleek', emoji: '📏' },
      { value: 'wavy', label: 'Wavy & Textured', emoji: '〰️' },
      { value: 'curly', label: 'Curly & Coily', emoji: '🌀' },
      { value: 'frizzy', label: 'Frizzy & Unruly', emoji: '⚡' },
    ]
  },
  {
    id: 'occasion',
    question: 'What\'s the occasion?',
    stepLabel: 'Step 2 of 4',
    options: [
      { value: 'bridal', label: 'Wedding / Bridal', emoji: '👑' },
      { value: 'party', label: 'Party / Event', emoji: '🎉' },
      { value: 'everyday', label: 'Everyday Look', emoji: '☀️' },
      { value: 'treatment', label: 'Hair Treatment', emoji: '💆' },
    ]
  },
  {
    id: 'budget',
    question: 'What\'s your budget?',
    stepLabel: 'Step 3 of 4',
    options: [
      { value: '1000', label: 'Under ₹1,000', emoji: '💚' },
      { value: '3000', label: '₹1,000 – ₹3,000', emoji: '💛' },
      { value: '8000', label: '₹3,000 – ₹8,000', emoji: '🧡' },
      { value: '50000', label: '₹8,000+', emoji: '💎' },
    ]
  },
  {
    id: 'locality',
    question: 'Which area do you prefer?',
    stepLabel: 'Step 4 of 4',
    options: [
      { value: 'Banjara Hills', label: 'Banjara Hills', emoji: '📍' },
      { value: 'Gachibowli', label: 'Gachibowli', emoji: '📍' },
      { value: 'Jubilee Hills', label: 'Jubilee Hills', emoji: '📍' },
      { value: 'Madhapur', label: 'Madhapur', emoji: '📍' },
    ]
  },
];

import { SALONS } from '../data/salons.js';

// Simulate AI match scoring
export function scoreSalon(salon, answers) {
  let score = 0;

  // Budget compatibility (20 pts)
  const budget = parseInt(answers.budget || '3000');
  const minPrice = salon.priceFrom;
  if (minPrice <= budget) {
    score += 20;
  } else if (minPrice <= budget * 1.3) {
    score += 10;
  }

  // Locality relevance (10 pts)
  if (salon.locality === answers.locality) {
    score += 10;
  } else {
    score += 4; // nearby bonus
  }

  // Occasion fit (30 pts)
  const occasion = answers.occasion;
  if (occasion === 'bridal') {
    if (salon.tags.some(t => t.toLowerCase().includes('bridal'))) score += 30;
    else if (salon.priceBand === 'premium') score += 15;
    else score += 8;
  } else if (occasion === 'party') {
    if (salon.services.some(s => s.name.toLowerCase().includes('makeup'))) score += 25;
    else score += 12;
  } else if (occasion === 'treatment') {
    if (salon.services.some(s => ['keratin', 'spa', 'facial', 'conditioning'].some(t => s.name.toLowerCase().includes(t)))) score += 28;
    else score += 12;
  } else {
    score += 20; // everyday - all salons ok
  }

  // Hair type match (40 pts)
  const hairType = answers.hair_type;
  if (hairType === 'curly') {
    if (salon.name.toLowerCase().includes('curl')) score += 40;
    else if (salon.description.toLowerCase().includes('curl') || salon.description.toLowerCase().includes('frizz')) score += 28;
    else score += 10;
  } else if (hairType === 'frizzy') {
    if (salon.tags.some(t => t.toLowerCase().includes('keratin')) || salon.name.toLowerCase().includes('keratin')) score += 38;
    else if (salon.services.some(s => s.name.toLowerCase().includes('keratin'))) score += 32;
    else score += 12;
  } else if (hairType === 'wavy') {
    if (salon.services.some(s => s.name.toLowerCase().includes('balayage') || s.name.toLowerCase().includes('colour'))) score += 30;
    else score += 20;
  } else {
    score += 25; // straight - most salons fine
  }

  // Normalize to 100
  return Math.min(100, Math.max(40, score + salon.matchScore - 50));
}

// Generate personalized match reason
export function generateReason(salon, answers) {
  const hairType = answers.hair_type;
  const occasion = answers.occasion;
  const budget = parseInt(answers.budget || '3000');

  if (salon.id === 'salon-17' && hairType === 'curly') {
    return 'DevaCurl certified specialists who understand your curl pattern — the only salon in Hyderabad dedicated to curly hair.';
  }

  if (occasion === 'bridal' && salon.tags.some(t => t.toLowerCase().includes('bridal'))) {
    return `Bridal specialist in ${salon.locality} with experience in traditional Telugu looks, within your budget range.`;
  }

  if (hairType === 'frizzy' && salon.services.some(s => s.name.toLowerCase().includes('keratin'))) {
    return `Keratin treatment specialist with ${salon.services.find(s => s.name.toLowerCase().includes('keratin'))?.name || 'keratin services'} available at competitive prices.`;
  }

  if (occasion === 'party') {
    return `Party makeup services starting ₹${salon.priceFrom.toLocaleString('en-IN')}, conveniently located in ${salon.locality}.`;
  }

  return salon.matchReason || `${salon.tags[0]} in ${salon.locality}, fits within your ₹${budget.toLocaleString('en-IN')} budget.`;
}

// Simulate streaming text (word by word with timeout)
export function simulateStreaming(text, onChunk, onComplete) {
  const words = text.split(' ');
  let index = 0;

  const interval = setInterval(() => {
    if (index < words.length) {
      onChunk(words[index] + (index < words.length - 1 ? ' ' : ''));
      index++;
    } else {
      clearInterval(interval);
      onComplete && onComplete();
    }
  }, 60);

  return interval;
}

// Mock chatbot responses
function buildSalonSummary(salon) {
  return `${salon.name} in ${salon.locality}, starting at ₹${salon.priceFrom}. ${salon.tags[0] || salon.description.slice(0, 50)}.`;
}

function findSalonsForQuestion(q) {
  const bridalKeywords = /bridal|wedding/;
  const keratinKeywords = /keratin|frizz|smoothening|straighten/;
  const curlyKeywords = /curly|curl/;
  const budgetKeywords = /budget|affordable|cheap|₹|rupee/;
  const makeupKeywords = /makeup|party|glam|event|reception|bridal/;
  const nailsKeywords = /nail|manicure|pedicure|gel/;
  const skinKeywords = /skin|facial|skincare|glow|derm|treatment/;
  const locationMatch = SALONS.find(salon => q.includes(salon.locality.toLowerCase()));

  let matches = [];

  if (bridalKeywords.test(q)) {
    matches = SALONS.filter(salon => salon.tags.some(tag => /bridal|wedding/i.test(tag)) || salon.services.some(service => /bridal/i.test(service.name)));
  } else if (keratinKeywords.test(q)) {
    matches = SALONS.filter(salon => salon.services.some(service => /keratin|smoothening/i.test(service.name)) || salon.tags.some(tag => /keratin/i.test(tag)));
  } else if (curlyKeywords.test(q)) {
    matches = SALONS.filter(salon => /curl/i.test(salon.name + ' ' + salon.description) || salon.services.some(service => /curl/i.test(service.name)));
  } else if (budgetKeywords.test(q)) {
    matches = SALONS.filter(salon => salon.priceFrom <= 1000);
  } else if (makeupKeywords.test(q)) {
    matches = SALONS.filter(salon => salon.services.some(service => /makeup|bridal|party|glam/i.test(service.name)) || salon.tags.some(tag => /makeup|bridal|party/i.test(tag)));
  } else if (nailsKeywords.test(q)) {
    matches = SALONS.filter(salon => salon.services.some(service => /nail|manicure|pedicure/i.test(service.name)) || salon.tags.some(tag => /nail/i.test(tag)));
  } else if (skinKeywords.test(q)) {
    matches = SALONS.filter(salon => salon.services.some(service => /facial|skin|cleanup|spa/i.test(service.name)) || salon.tags.some(tag => /skin|facial|spa/i.test(tag)));
  }

  if (locationMatch) {
    matches = SALONS.filter(salon => salon.locality.toLowerCase() === locationMatch.locality.toLowerCase());
  }

  if (!matches.length) {
    const recommendKeywords = /recommend|best|match|suggest/;
    if (recommendKeywords.test(q)) {
      matches = SALONS.slice().sort((a, b) => b.matchScore - a.matchScore);
    }
  }

  if (!matches.length) {
    matches = SALONS.slice().sort((a, b) => b.matchScore - a.matchScore);
  }

  return matches.slice(0, 3);
}

export function getChatbotResponse(question, salon = null) {
  const q = question.toLowerCase();

  if (!salon) {
    const matches = findSalonsForQuestion(q);
    return `Here are the top ${matches.length} salons for your request:
${matches.map((salon, idx) => `${idx + 1}. ${buildSalonSummary(salon)}`).join('\n')}
Tell me if you want me to narrow this by price, area, or service type.`;
  }

  if (q.includes('balayage') || q.includes('highlight')) {
    const balayageService = salon.services.find(s => s.name.toLowerCase().includes('balayage'));
    if (balayageService) {
      return `Yes! ${salon.name} offers ${balayageService.name} for ₹${balayageService.price.toLocaleString('en-IN')}, taking about ${balayageService.duration}. I'd recommend calling ahead to book as this service is popular!`;
    }
    return `${salon.name} doesn't offer balayage — they specialise in ${salon.tags.join(', ')}. You might want to check The Style Lab Secunderabad for colour work!`;
  }

  if (q.includes('bridal') || q.includes('wedding')) {
    const bridalService = salon.services.find(s => s.name.toLowerCase().includes('bridal'));
    if (bridalService) {
      return `Absolutely! Their ${bridalService.name} package is ₹${bridalService.price.toLocaleString('en-IN')} and takes ${bridalService.duration}. They're known for ${salon.sentiment.split('·')[0].trim()} work. Book at least 2 months in advance for wedding dates!`;
    }
    return `${salon.name} offers party and special occasion makeup starting from ₹${salon.priceFrom.toLocaleString('en-IN')}. For dedicated bridal packages, Studio 9 Banjara Hills would be a better fit!`;
  }

  if (q.includes('price') || q.includes('cost') || q.includes('how much')) {
    return `${salon.name} services start from ₹${salon.priceFrom.toLocaleString('en-IN')}. Popular services include: ${salon.services.slice(0, 3).map(s => `${s.name} at ₹${s.price.toLocaleString('en-IN')}`).join(', ')}.`;
  }

  if (q.includes('time') || q.includes('hour') || q.includes('open')) {
    return `${salon.name} is open ${salon.hours}. They're currently ${salon.openNow ? 'open right now' : 'closed'}! Call them at ${salon.phone} to confirm availability.`;
  }

  if (q.includes('curly') || q.includes('curl')) {
    if (salon.id === 'salon-17') {
      return `Curls & Co is 100% dedicated to curly hair! They use the DevaCurl technique and can handle curl patterns 2A to 4C. Nalini would be your best stylist for curly hair specifically.`;
    }
    return `${salon.name} handles general hair services. For curly hair specialists, I'd recommend Curls & Co Madhapur — they're DevaCurl certified and the best in Hyderabad for curly hair!`;
  }

  if (q.includes('park') || q.includes('parking')) {
    return `${salon.name} is at ${salon.address}. There's typically street parking available in the area. I'd suggest arriving 10 minutes early for your appointment!`;
  }

  if (q.includes('book') || q.includes('appointment')) {
    return `You can book directly through GlowMap! Click the "Book Now" button to select a service, stylist, and your preferred time slot. You'll get an instant confirmation via email.`;
  }

  return `Great question! ${salon.name} specialises in ${salon.tags.join(', ')}. For specific queries, I'd suggest calling them directly at ${salon.phone} — they're happy to help!`;
}
