# SMH Hotel Reservation Backend API

Complete backend API for the SMH Hotel Reservation System with full database integration and authentication.

## Features

- **User Authentication**: JWT-based authentication with registration, login, password reset
- **User Management**: Profile management, password changes, account deletion
- **Hotel Management**: CRUD operations for hotels with filtering and search
- **Booking System**: Complete reservation system with commission calculations
- **Wallet System**: Deposit and withdrawal functionality with multiple payment methods
- **Transaction Management**: Complete transaction history with admin approval/rejection
- **Team System**: Referral system with multi-level tracking
- **Support System**: Ticket-based support system with admin management
- **Country Discovery**: Country-based hotel browsing

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=smh_hotel_reservation
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   JWT_EXPIRE=7d
   
   CORS_ORIGIN=http://localhost:5173
   
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb smh_hotel_reservation
   
   # Run schema migration
   psql -d smh_hotel_reservation -f schema.sql
   ```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user (protected)

### Users

- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `PUT /api/users/password` - Change password (protected)
- `DELETE /api/users/account` - Delete account (protected)

### Hotels

- `GET /api/hotels` - Get all hotels with pagination
- `GET /api/hotels/:id` - Get hotel by ID
- `GET /api/hotels/featured/list` - Get featured hotels

### Bookings

- `GET /api/bookings` - Get user bookings (protected)
- `GET /api/bookings/:id` - Get booking by ID (protected)
- `POST /api/bookings` - Create new booking (protected)
- `PUT /api/bookings/:id/cancel` - Cancel booking (protected)

### Wallet

- `GET /api/wallet` - Get wallet data (protected)
- `POST /api/wallet/deposit` - Create deposit (protected)
- `POST /api/wallet/withdraw` - Create withdrawal (protected)
- `GET /api/wallet/summary` - Get wallet summary (protected)

### Transactions

- `GET /api/transactions` - Get user transactions (protected)
- `GET /api/transactions/:id` - Get transaction by ID (protected)
- `GET /api/transactions/admin/all` - Get all transactions (admin)
- `PUT /api/transactions/:id/approve` - Approve transaction (admin)
- `PUT /api/transactions/:id/reject` - Reject transaction (admin)

### Team

- `GET /api/team` - Get team member data (protected)
- `GET /api/team/referrals` - Get team referrals (protected)
- `POST /api/team/join` - Join team with referral code (protected)
- `GET /api/team/stats` - Get team statistics (protected)

### Support

- `GET /api/support` - Get user support tickets (protected)
- `GET /api/support/:id` - Get ticket by ID (protected)
- `POST /api/support` - Create support ticket (protected)
- `GET /api/support/admin/all` - Get all tickets (admin)
- `PUT /api/support/:id/status` - Update ticket status (admin)

### Countries

- `GET /api/countries` - Get all countries
- `GET /api/countries/:id` - Get country by ID
- `GET /api/countries/name/:name` - Get country by name
- `GET /api/countries/featured/list` - Get featured countries

### Health Check

- `GET /health` - API health check

## Database Schema

The database includes the following tables:

- **users** - User accounts and authentication
- **user_wallets** - User wallet data and balances
- **transactions** - Deposit and withdrawal transactions
- **countries** - Country data for hotel discovery
- **hotels** - Hotel information and details
- **hotel_images** - Hotel image gallery
- **bookings** - Hotel reservations
- **team_members** - Team and referral system
- **support_tickets** - Support system

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- Window: 15 minutes (configurable)
- Max requests: 100 per window (configurable)

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Password hashing with bcrypt
- JWT token authentication
- Input validation with express-validator
- SQL injection prevention with parameterized queries

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "status": 400
}
```

## Development Notes

- The server uses connection pooling for database connections
- All database operations use parameterized queries
- Timestamps are automatically managed with triggers
- Foreign key constraints ensure data integrity
- Indexes are created for performance optimization

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a strong JWT secret
3. Configure proper CORS origins
4. Use environment variables for sensitive data
5. Enable HTTPS
6. Set up proper database backups
7. Configure proper logging
8. Set up monitoring and alerting

## License

MIT

## Support

For support, please create an issue in the repository or contact the development team.
