// Mock booking history seeded per user email
import { SALONS } from './salons.js';

const today = new Date();
const daysFromNow = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

export const MOCK_BOOKINGS = {
  'priya@gmail.com': [
    {
      id: 'GLW-HYD-41201',
      salonId: 'salon-01',
      salonName: 'Studio 9 Banjara Hills',
      salonLocality: 'Banjara Hills',
      service: 'Bridal Makeup (Full Package)',
      stylist: 'Meenakshi R.',
      date: daysFromNow(6),
      time: '10:00 AM',
      amount: 28000,
      status: 'upcoming',
    },
    {
      id: 'GLW-HYD-41188',
      salonId: 'salon-17',
      salonName: 'Curls & Co Madhapur',
      salonLocality: 'Madhapur',
      service: 'DevaCurl Signature Cut',
      stylist: 'Nalini P.',
      date: daysFromNow(14),
      time: '2:00 PM',
      amount: 1200,
      status: 'upcoming',
    },
    {
      id: 'GLW-HYD-40911',
      salonId: 'salon-01',
      salonName: 'Studio 9 Banjara Hills',
      salonLocality: 'Banjara Hills',
      service: 'Silk Saree Updo',
      stylist: 'Anjali S.',
      date: daysFromNow(-12),
      time: '11:00 AM',
      amount: 3500,
      status: 'completed',
    },
    {
      id: 'GLW-HYD-40744',
      salonId: 'salon-02',
      salonName: 'Brides of Hyderabad Jubilee Hills',
      salonLocality: 'Jubilee Hills',
      service: 'HD Facial + Cleanup',
      stylist: 'Priya K.',
      date: daysFromNow(-28),
      time: '3:00 PM',
      amount: 2200,
      status: 'completed',
    },
    {
      id: 'GLW-HYD-40610',
      salonId: 'salon-05',
      salonName: 'The Beauty Room SR Nagar',
      salonLocality: 'SR Nagar',
      service: 'Keratin Treatment',
      stylist: 'Any Available',
      date: daysFromNow(-5),
      time: '4:00 PM',
      amount: 4500,
      status: 'cancelled',
    },
  ],

  'kavitha@gmail.com': [
    {
      id: 'GLW-HYD-41299',
      salonId: 'salon-03',
      salonName: 'Nail Republic Gachibowli',
      salonLocality: 'Gachibowli',
      service: '4-Week Gel Manicure',
      stylist: 'Divya',
      date: daysFromNow(3),
      time: '5:00 PM',
      amount: 800,
      status: 'upcoming',
    },
    {
      id: 'GLW-HYD-41100',
      salonId: 'salon-04',
      salonName: 'Her Canvas Salon HiTech City',
      salonLocality: 'HiTech City',
      service: 'Advanced Balayage',
      stylist: 'Sana',
      date: daysFromNow(-8),
      time: '11:00 AM',
      amount: 7500,
      status: 'completed',
    },
    {
      id: 'GLW-HYD-40950',
      salonId: 'salon-03',
      salonName: 'Nail Republic Gachibowli',
      salonLocality: 'Gachibowli',
      service: 'Gel Pedicure',
      stylist: 'Priya',
      date: daysFromNow(-20),
      time: '6:00 PM',
      amount: 600,
      status: 'completed',
    },
    {
      id: 'GLW-HYD-40820',
      salonId: 'salon-01',
      salonName: 'Studio 9 Banjara Hills',
      salonLocality: 'Banjara Hills',
      service: 'Party Makeup',
      stylist: 'Meenakshi R.',
      date: daysFromNow(-3),
      time: '7:00 PM',
      amount: 3500,
      status: 'cancelled',
    },
  ],

  'demo@glowmap.in': [
    {
      id: 'GLW-HYD-41350',
      salonId: 'salon-17',
      salonName: 'Curls & Co Madhapur',
      salonLocality: 'Madhapur',
      service: 'Curl Rescue Treatment',
      stylist: 'Nalini P.',
      date: daysFromNow(2),
      time: '11:00 AM',
      amount: 2500,
      status: 'upcoming',
    },
    {
      id: 'GLW-HYD-41200',
      salonId: 'salon-02',
      salonName: 'Brides of Hyderabad Jubilee Hills',
      salonLocality: 'Jubilee Hills',
      service: 'Bridal Trial Makeup',
      stylist: 'Renu',
      date: daysFromNow(20),
      time: '10:00 AM',
      amount: 8000,
      status: 'upcoming',
    },
    {
      id: 'GLW-HYD-40890',
      salonId: 'salon-04',
      salonName: 'Her Canvas Salon HiTech City',
      salonLocality: 'HiTech City',
      service: 'Hair Spa Treatment',
      stylist: 'Sana',
      date: daysFromNow(-15),
      time: '2:00 PM',
      amount: 1800,
      status: 'completed',
    },
  ],
};

export function getBookingsForUser(email) {
  return MOCK_BOOKINGS[email?.toLowerCase()] || [];
}
