export type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled';

export interface Booking {
  id: string;
  title: string;
  image: string;
  departure: string;
  bookingId: string;
  price: number;
  status: BookingStatus;
}