# SMH - Luxury Hotel Reservation Platform

A world-class hotel booking platform with premium UI/UX, modern design, and smooth animations.

## Features

### Authentication
- **Login Page**: Secure email/password authentication
- **Register Page**: User registration with real-time validation
- **Password Strength Indicator**: Visual feedback on password security
- **Protected Routes**: Automatic redirect for unauthenticated users

### Homepage
- **Hero Section**: Full-screen parallax hero with city skyline
- **Featured Properties**: Luxury hotel cards with ratings, amenities, and pricing
- **Explore by Country**: Interactive country grid with hover effects
- **Trusted Partners**: Display of world-class hotel brands
- **Guest Testimonials**: Real reviews with star ratings
- **Responsive Navigation**: Fixed navbar with logout functionality

### Design System
- **Color Palette**:
  - Gold Primary: `#D4AF37`
  - Background: White/Light Gray
  - Text: Dark Gray/Black
- **Typography**: Modern, clean, with proper hierarchy
- **Animations**: Smooth page transitions, hover effects, and scroll-based animations
- **Responsive**: Mobile-first design that works on all devices

## Tech Stack

- **React**: Component-based UI
- **React Router**: Client-side routing
- **Tailwind CSS v4**: Utility-first styling
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Beautiful icon system
- **TypeScript**: Type-safe code

## Getting Started

The application is already running! Here's how to use it:

### 1. Registration
- Click "Create account" on the login page
- Fill in your details:
  - Full Name
  - Email
  - Phone Number
  - Password (min 8 characters)
  - Confirm Password
- Password strength indicator will guide you
- Click "Create Account"

### 2. Login
- Use the email and password you registered with
- Click "Log In"
- You'll be redirected to the homepage

### 3. Navigation
- **Home**: Browse featured properties and destinations
- **Packages**: View special hotel packages (coming soon)
- **Bookings**: Manage your reservations (coming soon)
- **Profile**: Edit your account details (coming soon)
- **Logout**: Sign out of your account

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── figma/
│   │   │   └── ImageWithFallback.tsx    # Image component with fallback
│   │   └── ProtectedRoute.tsx           # Route guard component
│   ├── context/
│   │   └── AuthContext.tsx              # Authentication state management
│   ├── pages/
│   │   ├── Login.tsx                    # Login page
│   │   ├── Register.tsx                 # Registration page
│   │   └── Home.tsx                     # Main homepage
│   ├── routes.tsx                       # Router configuration
│   └── App.tsx                          # Root component
├── styles/
│   ├── theme.css                        # Design tokens and theme
│   └── fonts.css                        # Font imports
└── ...
```

## Key Features Explained

### Authentication System
- Uses **localStorage** for demo purposes
- Stores users in `hotel_users` key
- Active session in `hotel_user` key
- **In production**, replace with proper backend authentication (JWT, OAuth, etc.)

### Routing
- Uses **React Router v7** Data mode
- Protected routes redirect to `/login` if not authenticated
- Clean URL structure

### Animations
- **Hero parallax**: Background scales on scroll
- **Fade in**: Sections animate as they enter viewport
- **Hover effects**: Cards lift and shadow on hover
- **Page transitions**: Smooth entry animations

### Responsive Design
- Mobile-first approach
- Breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

## Customization

### Change Brand Colors
Edit `/src/styles/theme.css`:
```css
--gold: #D4AF37;        /* Primary gold color */
--gold-dark: #B8941F;   /* Darker gold for hover states */
--gold-light: #E8D4A0;  /* Lighter gold for accents */
```

### Add New Pages
1. Create page component in `src/app/pages/`
2. Add route in `src/app/routes.tsx`
3. Add navigation link in `Home.tsx` navbar

### Modify Properties
Edit the `properties` array in `src/app/pages/Home.tsx`:
```typescript
const properties = [
  {
    id: 1,
    name: 'Your Hotel Name',
    location: 'City, Country',
    rating: 5,
    price: 450,
    image: 'image-url',
    tags: ['WiFi', 'Pool', 'Restaurant']
  }
];
```

## Demo Credentials

Since this is a demo app with local storage:
- Register with any email/password
- Login with the same credentials
- Data persists in browser localStorage

## Future Enhancements

- [ ] Supabase backend integration
- [ ] Real-time booking system
- [ ] Payment gateway integration
- [ ] Advanced search and filters
- [ ] Google Maps integration
- [ ] Email notifications
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Calendar date picker for bookings
- [ ] User profile management
- [ ] Booking history
- [ ] Favorites/Wishlist

## Performance

- Lazy loading for images
- Code splitting by route
- Optimized animations (GPU-accelerated)
- Debounced scroll listeners

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes

- Images are loaded from Unsplash via CDN
- No backend required for demo
- localStorage persists across sessions
- Clear browser data to reset demo

---

**Built with ❤️ using React, Tailwind, and Framer Motion**
