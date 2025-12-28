# HillTrack Pulse - Routing Structure

## 🏠 Application Routes

### Public Routes
- **`/`** - Login Page (Default landing page)

### Protected Routes
- **`/admin`** - Admin Dashboard (Requires Admin login)
- **`/volunteer`** - Volunteer Data Entry (Requires Volunteer login)

## 🔐 Authentication System

### AuthContext Features
- **User Types**: Admin | Volunteer
- **State Management**: React Context API
- **Persistence**: localStorage (survives page refresh)
- **Methods**:
  - `login(type)` - Authenticate as admin or volunteer
  - `logout()` - Clear authentication and redirect to login
  - `isAuthenticated` - Check if user is logged in
  - `userType` - Get current user role

### Protected Route Logic
- Unauthenticated users → Redirected to `/` (Login)
- Admin accessing `/volunteer` → Redirected to `/admin`
- Volunteer accessing `/admin` → Redirected to `/volunteer`
- Any invalid route → Redirected to `/`

## 📱 Pages Overview

### 1. Login Page (`/`)
- **Features**:
  - Beautiful gradient background
  - Role selection (Admin vs Volunteer)
  - Visual role cards with icons
  - No password required (demo mode)
- **Navigation**:
  - Select Admin → Login → Redirects to `/admin`
  - Select Volunteer → Login → Redirects to `/volunteer`

### 2. Admin Dashboard (`/admin`)
- **Features**:
  - Backend status banner
  - Statistics cards (Total Patients, Malaria Cases, etc.)
  - Interactive HillMap with patient locations
  - Analytics overview
  - Disease distribution charts
  - Logout button
- **Access**: Admin only

### 3. Volunteer Data Entry (`/volunteer`)
- **Features**:
  - Patient data entry form
  - Fields: Name, Age, Location (Lat/Long), Disease Type, Severity
  - Recent submissions list
  - Real-time form validation
  - Logout button
- **Access**: Volunteer only

## 🚀 Usage

### Starting the App
```bash
cd frontend
npm run dev
```

Visit: `http://localhost:5173`

### Login Flow
1. Open `http://localhost:5173/`
2. Select **Admin** or **Volunteer**
3. Click "Login as [Role]"
4. Automatically redirected to appropriate dashboard

### Testing Routes
```bash
# Try accessing protected routes directly
http://localhost:5173/admin       # → Redirects to login if not authenticated
http://localhost:5173/volunteer   # → Redirects to login if not authenticated

# After login
http://localhost:5173/admin       # ✓ Shows Admin Dashboard
http://localhost:5173/volunteer   # ✓ Shows Volunteer Data Entry
```

## 🛠️ Project Structure

```
frontend/src/
├── App.tsx                          # Main routing configuration
├── context/
│   └── AuthContext.tsx              # Authentication context & provider
├── components/
│   ├── ProtectedRoute.tsx           # Route protection HOC
│   ├── HillMap.tsx                  # Map component
│   └── SimpleMap.tsx                # Backup simple map
├── pages/
│   ├── LoginPage.tsx                # Login / Landing page
│   ├── AdminDashboard.tsx           # Admin dashboard
│   └── VolunteerDataEntry.tsx       # Volunteer data entry form
```

## 🔧 Customization

### Adding New Protected Routes
```tsx
<Route
  path="/new-route"
  element={
    <ProtectedRoute allowedTypes={['admin']}>
      <NewComponent />
    </ProtectedRoute>
  }
/>
```

### Modifying User Types
Edit `AuthContext.tsx`:
```tsx
type UserType = 'admin' | 'volunteer' | 'doctor' | 'analyst'
```

### Changing Default Redirect
Edit `ProtectedRoute.tsx`:
```tsx
return <Navigate to="/custom-login" replace />
```

## 🎨 Design System

### Colors
- **Admin**: Blue/Indigo (`primary-600`)
- **Volunteer**: Green/Emerald (`green-600`)
- **Error**: Red (`red-600`)
- **Success**: Green (`green-600`)

### Icons (Lucide React)
- Activity, User, UserCog, Lock, LogOut
- BarChart3, Map, Users, AlertTriangle, TrendingUp

## 📝 Demo Credentials

**No password required** - Just select role type:
- ✅ Admin
- ✅ Volunteer

Perfect for hackathon demonstrations!
