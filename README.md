# Hotel Reservation System

A modern, full-stack hotel reservation platform built with React, Node.js, and MySQL. Features user authentication, hotel booking, payment processing, and admin dashboard.

## Features

- **User Management**: Registration, login, and profile management
- **Hotel Booking**: Browse and reserve hotels with detailed information
- **Payment System**: Secure deposit and withdrawal processing
- **Admin Dashboard**: Manage users, transactions, and system settings
- **Responsive Design**: Mobile-friendly interface with modern UI
- **Real-time Updates**: Live booking status and wallet balance updates

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, MySQL
- **Authentication**: JWT tokens
- **Payment Integration**: USDT and cryptocurrency support
- **Deployment**: Compatible with cPanel and other hosting platforms

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- MySQL database
- NPM or Yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/liyu-coder/smh-hotel.git
   cd smh-hotel
   ```

2. Install dependencies:
   ```bash
   npm install
   cd backend
   npm install
   cd ..
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in both root and backend directories
   - Update database credentials and API settings

4. Set up the database:
   - Create MySQL database
   - Import `database_schema.sql`

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Deployment

For production deployment, see the `DEPLOYMENT_GUIDE.md` file for detailed instructions on cPanel and other hosting platforms.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is proprietary and confidential. All rights reserved.

## Support

For technical support and inquiries, please contact the development team.