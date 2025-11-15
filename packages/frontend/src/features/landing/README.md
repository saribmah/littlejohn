# Landing Page Feature

## Overview
The landing page is the first screen users see when visiting Little John. It showcases the product's value proposition and encourages sign-ups.

## Components

### LandingPage
Main landing page component with hero section, features, and call-to-action.

**Props:**
- `onSignUp: () => void` - Callback function triggered when user clicks "Get Started"

## Structure
- **Header**: Logo, navigation links (Features, About, Pricing)
- **Hero Section**: Main headline, description, and CTA button
- **Features Grid**: Three key features with descriptions
  - Conversational Setup
  - Intelligent Execution
  - Full Transparency
- **Footer**: Copyright, legal links (Privacy, Terms, Contact)

## Usage
```tsx
import { LandingPage } from './features/landing';

<LandingPage onSignUp={() => setView('signup')} />
```
