# Amani Donors

A comprehensive multi-tenant donor management application built with Angular 20 and Angular Material. Features trip planning, promise tracking, and organizational branding with mobile-first responsive design.

## 🚀 Quick Start

```bash
npm install
npm start
```

The application will open automatically at `http://localhost:4200`.

## ✨ Features

### Core Functionality
- **Trip Planning**: Create trips, manage checklists, track progress, export to PDF
- **Promise Tracking**: Log commitments, monitor fulfillment, export to CSV
- **Multi-tenant**: Support for multiple organizations with custom branding
- **Authentication**: Mock user system with role-based access (donor, staff, admin)
- **Responsive Design**: Mobile-first approach with Angular Material components

### Organizations
- **Amani International**: Primary tenant with custom branding
- **Generic NGO**: Template organization for demonstration
- **Demo NGO**: Additional tenant for testing scenarios

### User Roles & Access
- **Donors**: Access trip planning and promise tracking
- **Staff**: Same as donors with additional management features
- **Admin**: Full access including organizational setup guide

## 🔑 Demo Accounts

### Amani International
- **Admin**: admin@amani.org
- **Staff**: staff@amani.org
- **Donor**: donor@amani.org

### Generic NGO
- **Admin**: admin@generic.org
- **Donor**: donor@generic.org

### Demo NGO
- **Admin**: admin@demo.org
- **Donor**: donor@demo.org

## 🛠 Development

### Available Scripts

```bash
# Development
npm start              # Start dev server with auto-open
npm run watch          # Build in watch mode
npm run build          # Production build
npm run build:prod     # Optimized production build

# Testing
npm test               # Run unit tests
npm run test:coverage  # Run tests with coverage report
npm run test:watch     # Run tests in watch mode
npm run e2e            # Run end-to-end tests
npm run e2e:ui         # Run E2E tests with UI
npm run e2e:debug      # Debug E2E tests
```

### Project Structure

```
src/
├── app/
│   ├── core/               # Core services and guards
│   │   ├── guards/         # Route guards (AuthGuard)
│   │   ├── models/         # TypeScript interfaces
│   │   └── services/       # Business logic services
│   ├── shared/             # Shared components
│   │   └── components/     # Reusable UI components
│   ├── features/           # Feature modules
│   │   ├── auth/           # Authentication components
│   │   ├── donor-trip/     # Trip planning feature
│   │   ├── donor-promises/ # Promise tracking feature
│   │   └── admin/          # Admin onboarding guide
│   └── assets/
│       └── tenants/        # Multi-tenant configurations
│           ├── amani/      # Amani branding & config
│           ├── generic/    # Generic NGO branding
│           └── demo-ngo/   # Demo NGO branding
tests/                      # Playwright E2E tests
```

## 🎨 Customization

### Adding New Tenants

1. Create tenant configuration:
```json
// src/assets/tenants/your-org/config.json
{
  "name": "Your Organization",
  "shortName": "YourOrg",
  "primaryColor": "#your-color",
  "accentColor": "#your-accent",
  "logoUrl": "assets/tenants/your-org/logo.svg",
  "website": "https://your-org.com",
  "supportEmail": "support@your-org.com"
}
```

2. Add logo file:
```
src/assets/tenants/your-org/logo.svg
```

3. Update tenant service to include new organization.

### Theming

The application uses Angular Material's theming system. Tenant-specific colors are applied dynamically through CSS custom properties defined in the tenant configuration.

## 🧪 Testing

### Unit Tests
- **Framework**: Jasmine & Karma
- **Coverage**: Core services and components
- **Run**: `npm test`

### E2E Tests
- **Framework**: Playwright
- **Coverage**: User workflows across all features
- **Browsers**: Chrome, Firefox, Safari (Desktop & Mobile)
- **Run**: `npm run e2e`

### Test Scenarios
- User authentication and authorization
- Tenant switching and branding
- Trip creation and checklist management
- Promise tracking and fulfillment
- Admin onboarding workflows
- Accessibility and keyboard navigation

## ♿ Accessibility

- ARIA labels and roles
- Keyboard navigation support
- Color contrast compliance
- Screen reader compatibility
- Focus management

## 🌍 Internationalization Ready

The application is structured to support i18n:
- Angular i18n architecture in place
- Translatable strings identified
- RTL layout considerations
- Date/currency formatting preparation

## 📱 Mobile Support

- Mobile-first responsive design
- Touch-friendly interface
- Optimized navigation patterns
- Progressive Web App ready architecture

## 🔧 Technical Stack

- **Angular 20**: Latest framework with standalone components
- **Angular Material 20.2**: Material Design components
- **TypeScript 5.8**: Type-safe development
- **RxJS 7.8**: Reactive programming
- **Playwright**: End-to-end testing
- **Jasmine/Karma**: Unit testing

## 📈 Architecture Highlights

- **Standalone Components**: Modern Angular architecture
- **Lazy Loading**: Optimized routing with code splitting
- **Service-based Architecture**: Clean separation of concerns
- **State Management**: Observable-based with localStorage persistence
- **Route Guards**: Protected routes with authentication
- **Multi-tenant Design**: Scalable organizational support

## 🚀 Deployment

For production deployment:

```bash
npm run build:prod
```

The built application will be in the `dist/` directory, ready for deployment to any static hosting service.

## 🤝 Contributing

1. Clone the repository
2. Install dependencies: `npm install`
3. Create feature branch: `git checkout -b feature/your-feature`
4. Run tests: `npm test && npm run e2e`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
