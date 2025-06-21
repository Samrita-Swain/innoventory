# Innoventory - IP Management Dashboard

A comprehensive multi-user dashboard for intellectual property management with admin and sub-admin functionality. Built with modern technologies including React.js, TypeScript, PostgreSQL, and Prisma ORM.

## Features

### 🎯 Multi-User System
- **Admin Dashboard**: Full access to all features and analytics
- **Sub-Admin Dashboard**: Personalized view with assigned permissions
- Role-based access control (RBAC)
- Permission management system

### 📊 Interactive Analytics
- Animated KPI cards with real-time data
- Interactive charts (Bar, Line, Doughnut) with clickable segments
- Geographic work distribution with interactive world map
- Yearly trends and country-wise breakdowns

### 🎨 Modern UI/UX
- Smooth animations using Anime.js and Framer Motion
- Responsive design with Tailwind CSS
- Interactive widgets and components
- Real-time data visualization

### 📈 Dashboard Features

#### Admin Dashboard
- **KPIs**: Total customers, vendors, IPs registered/closed
- **Geographic Distribution**: Interactive world map showing work distribution
- **Pending Work**: Top 10 pending items with urgency indicators
- **Pending Payments**: Payment tracking with visual indicators
- **Yearly Trends**: Multi-dataset charts for historical analysis

#### Sub-Admin Dashboard
- **Personalized Summary**: Assigned customers, vendors, and orders
- **Order Status Breakdown**: Visual representation of work progress
- **Assigned Pending Orders**: Priority-based task management
- **Recent Activity Log**: Personal activity tracking
- **Quick Actions**: Contextual action buttons based on permissions

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Anime.js, Framer Motion
- **Charts**: Chart.js, React-Chartjs-2
- **Maps**: Leaflet, React-Leaflet
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: JWT, bcryptjs
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon account)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd innoventory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database - Replace with your Neon database URL
   DATABASE_URL="postgresql://username:password@localhost:5432/innoventory?schema=public"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"
   NEXTAUTH_URL="http://localhost:3000"

   # JWT
   JWT_SECRET="your-jwt-secret-here-change-this-in-production"

   # App
   NODE_ENV="development"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Admin Credentials

### Admin Access
- **Email**: admin@innoventory.com
- **Password**: admin123
- **Permissions**: Full access to all features

**Note**: All demo data has been removed. Only the admin user remains for initial access. All other data (customers, vendors, orders, etc.) will be created by users through the application interface.

## 🎯 **Key Features Implemented**

### **Real-Time Data Management**
- ✅ **Customer Management** - Complete CRUD operations with real-time updates
- ✅ **Vendor Management** - Vendor profiles with specializations and ratings
- ✅ **Order Management** - IP registration orders with automatic reference numbers
- ✅ **User Management** - Admin can create sub-admins with granular permissions

### **Database Integration**
- ✅ **PostgreSQL Database** - Robust relational database with Prisma ORM
- ✅ **Real-time Search** - Debounced search with instant results
- ✅ **Advanced Filtering** - Multi-criteria filtering system
- ✅ **Form Validation** - Client and server-side validation

### **Authentication & Authorization**
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Role-Based Access Control** - Admin and Sub-Admin roles
- ✅ **Granular Permissions** - Fine-grained permission system
- ✅ **Session Management** - Secure session handling

### **User Experience**
- ✅ **Anime.js Animations** - Smooth, professional animations throughout
- ✅ **Responsive Design** - Works perfectly on all devices
- ✅ **Loading States** - Beautiful loading indicators
- ✅ **Error Handling** - Comprehensive error management

## 📊 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### **Users**
- `GET /api/users` - Get sub-admin users (Admin only)
- `POST /api/users` - Create sub-admin user (Admin only)

### **Customers**
- `GET /api/customers` - Get customers with search/filter
- `POST /api/customers` - Create customer

### **Vendors**
- `GET /api/vendors` - Get vendors with search/filter
- `POST /api/vendors` - Create vendor

### **Orders**
- `GET /api/orders` - Get orders with search/filter
- `POST /api/orders` - Create order

## 🚀 **Deployment**

### **Vercel (Recommended)**
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

## 👨‍💻 **Author**

**Pritam Pattanaik**
- GitHub: [@Pritam-Pattanaik](https://github.com/Pritam-Pattanaik)

## 🙏 **Acknowledgments**

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Animated with [Anime.js](https://animejs.com/)
- Database powered by [PostgreSQL](https://postgresql.org/)
- ORM by [Prisma](https://prisma.io/)

---

## 🚀 **Deployment**

### Vercel Deployment (Recommended)

1. **Fork this repository** to your GitHub account
2. **Connect to Vercel**: Import your forked repository to Vercel
3. **Set Environment Variables** in Vercel dashboard:
   ```
   DATABASE_URL=your_neon_database_url
   JWT_SECRET=your_jwt_secret_key
   NEXTAUTH_SECRET=your_nextauth_secret
   ```
4. **Deploy**: Vercel will automatically build and deploy your application

### Environment Variables Setup

Copy `.env.example` to `.env` and update with your values:
```bash
cp .env.example .env
```

### Build Status

✅ **Production Ready** - All TypeScript errors resolved
✅ **ESLint Compliant** - All warnings and errors fixed
✅ **Prisma Compatible** - Client generation configured for Vercel
✅ **Build Optimized** - Successfully compiles for production
✅ **Type Safe** - 100% TypeScript compliance

---

**⭐ If you found this project helpful, please give it a star!**
