# KeurSanté LMS Admin Platform - Project Context & Development Plan

## Overview

This is the **administrative management platform** for KeurSanté, a local-first mobile learning platform designed for Community Health Workers (CHWs) in Senegal. While the mobile app serves CHWs directly with training content, this admin platform enables instructors, administrators, and content creators to manage the entire learning ecosystem.

## Mobile App Context (What We're Supporting)

The KeurSanté mobile app serves CHWs (ages 27–30, bilingual French/Wolof, tech-savvy) with:
- **Offline-first learning**: Video lectures with downloadable text alternatives
- **Modular training**: Small sections with comprehension tests between modules
- **Interactive elements**: Quizzes, simulations, practical scenarios
- **Community forums**: Peer-to-peer interaction with tutor moderation
- **Cultural relevance**: Senegal-specific health scenarios and local examples
- **Bilingual support**: French/Wolof language switching
- **Progress tracking**: Individual analytics and shareable digital certificates

## Current Implementation Status

### ✅ Fully Implemented Features

#### Core Infrastructure
- **Database Schema**: Complete PostgreSQL schema with all necessary models (Users, Formations, Modules, Courses, Quizzes, Resources, Enrollments, Progress, Certificates)
- **Authentication System**: Role-based access (Admin, Instructor, Student) with secure sessions
- **Dashboard Layout**: Sidebar navigation, header, breadcrumbs, and responsive design
- **File Upload System**: UploadThing integration for images, videos, and PDF attachments

#### Course Management (Most Complete)
- **Course Creation**: Multi-tab interface with basic info, content, quiz, and resources
- **Course Editing**: Complete editing interface with rich text editor (TipTap/Lexical)
- **Quiz System**: Multiple choice questions with automated scoring and correct answers
- **Resource Management**: Upload and organize PDFs, documents, images, and links
- **Course Actions**: Full CRUD operations with proper database relations
- **Course Listing**: Working courses list within modules with status indicators

#### Formation & Module Display
- **Formation Listing**: Display existing formations with module counts
- **Module Listing**: Display modules within formations with course counts
- **Navigation Structure**: Deep linking through formation → module → course hierarchy
- **Basic Actions**: Formation and module fetching from database

### 🚧 Partially Implemented Features

#### Formation Management
- **Formation Display**: formations-list component works
- **Formation Actions**: Basic CRUD operations exist but incomplete
- **Formation Navigation**: Links to `/formations/new` exist but page missing

#### Module Management  
- **Module Display**: modules-list component works with course counts
- **Module Form**: Component exists but not properly connected
- **Module Actions**: `getModulesList()` works but creation/editing missing

### ❌ Missing Critical Features

#### Formation Creation & Management
- **Formation Creation Page**: `/dashboard/formations/new` route not implemented
- **Formation Form Component**: No interface for creating new formations
- **Formation Editing**: No way to edit existing formation details
- **Formation Status Management**: Cannot publish/unpublish formations
- **Formation Actions**: Missing update, delete, and publish operations

#### Module Creation & Management
- **Module Creation Page**: `/modules/new` route referenced but doesn't exist
- **Module Actions File**: `actions/modules/actions.ts` is completely empty
- **Module Editing**: No interface for editing existing modules
- **Module Ordering**: No drag-and-drop or reordering functionality

#### Certification System
- **Completion Logic**: No course/module/formation completion tracking
- **Certificate Generation**: No automated certificate creation
- **Certificate Templates**: No certificate design system
- **Progress Validation**: No logic for determining when certification is earned

#### Mobile App Integration
- **Public API**: No API endpoints for mobile app consumption
- **Authentication**: No API key system for mobile app access
- **Data Exposure**: No way to expose formations to mobile users
- **Progress Tracking API**: No endpoints for mobile progress updates

## Technical Architecture

### Current Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Framework**: Tailwind CSS with Radix UI components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom auth system (Authism)
- **File Management**: UploadThing for uploads and media storage
- **Content Editor**: TipTap/Lexical for rich text course content

### Database Models
```
Users (Admin/Instructor/Student) → Enrollments → Progress → Certificates
Formations → Modules → Courses → Quizzes/Resources
```

## **Priority Development Plan: Complete Formation Building Workflow**

### **Current Focus: Course/Formation Editing Features**

Our immediate goal is to complete the formation building workflow: **Formation → Modules → Courses → Certification → API Access**

### **Phase 1: Complete Formation Management (1 week)**

#### Task 1.1: Formation Creation & Editing ⭐ **HIGH PRIORITY**
- [ ] Create `/dashboard/formations/new` page with formation creation form
- [ ] Build FormationForm component with fields:
  - [ ] Title, description, thumbnail upload
  - [ ] Passing grade configuration
  - [ ] Status management (DRAFT/PUBLISHED)
- [ ] Create formation editing page `/dashboard/formations/[id]/edit`
- [ ] Add formation preview functionality

#### Task 1.2: Enhanced Formation Actions
- [ ] Implement `updateFormation(id, data)` action
- [ ] Implement `deleteFormation(id)` action  
- [ ] Implement `publishFormation(id)` action
- [ ] Add formation status validation and business rules

### **Phase 2: Complete Module Management (1 week)**

#### Task 2.1: Module Creation & Editing ⭐ **HIGH PRIORITY**
- [ ] Create `/dashboard/formations/[formationId]/modules/new` page
- [ ] Connect existing `module-form.tsx` component to creation workflow
- [ ] Create module editing page `/modules/[moduleId]/edit`
- [ ] Add module ordering/reordering functionality
- [ ] Implement module status management

#### Task 2.2: Module Actions Implementation
- [ ] Implement full `actions/modules/actions.ts`:
  - [ ] `createModule(formationId, moduleData)`
  - [ ] `updateModule(moduleId, moduleData)`
  - [ ] `deleteModule(moduleId)`
  - [ ] `reorderModules(formationId, moduleOrders)`
  - [ ] `getModuleDetails(moduleId)`

### **Phase 3: Certification System (1 week)**

#### Task 3.1: Completion Logic ⭐ **HIGH PRIORITY**
- [ ] Implement course completion tracking based on quiz scores
- [ ] Add module completion calculation (all courses completed)
- [ ] Add formation completion logic (based on passingGrade threshold)
- [ ] Create automatic certificate generation triggers

#### Task 3.2: Certificate Generation
- [ ] Create certificate template system (PDF generation)
- [ ] Implement certificate storage and URL generation
- [ ] Add certificate verification system with unique IDs
- [ ] Create certificate download and sharing functionality

### **Phase 4: Mobile API Integration (1 week)**

#### Task 4.1: Public API Endpoints ⭐ **HIGH PRIORITY**
- [ ] Create `/api/formations` - List all published formations
- [ ] Create `/api/formations/[id]` - Get formation with full module/course tree
- [ ] Create `/api/formations/[id]/enroll` - User enrollment endpoint
- [ ] Create `/api/progress` - Track and update user progress
- [ ] Create `/api/certificates/[id]` - Certificate verification

#### Task 4.2: API Authentication & Security
- [ ] Implement API key authentication for mobile app
- [ ] Add rate limiting and request validation
- [ ] Add proper error handling and status codes
- [ ] Create comprehensive API documentation

### **Phase 5: Testing & Polish (3-5 days)**

#### Task 5.1: End-to-End Workflow Testing
- [ ] Test complete formation creation → publication workflow
- [ ] Test module creation and course assignment
- [ ] Test completion tracking and certificate generation
- [ ] Test API endpoints with realistic mobile app scenarios

#### Task 5.2: UI/UX Polish
- [ ] Add loading states and progress indicators
- [ ] Implement proper error handling and user feedback
- [ ] Add confirmation dialogs for destructive actions
- [ ] Optimize responsive design for all screen sizes

## **Immediate Next Steps (This Week)**

1. **🚨 Formation Creation Page** - Biggest blocker, needed before anything else
2. **🚨 Module Creation Implementation** - Second biggest gap in workflow  
3. **Module Actions Backend** - Enable full module CRUD operations

## Success Metrics

The formation building workflow will be considered complete when:

1. **✅ Full Formation Lifecycle**: Create → Edit → Add Modules → Add Courses → Publish
2. **✅ Content Management**: Rich course content with quizzes and resources
3. **✅ Completion Tracking**: Automatic progress tracking and certificate generation
4. **✅ Mobile Integration**: API endpoints ready for mobile app consumption
5. **✅ Publication Workflow**: Draft → Review → Publish → Available to CHWs

## **Estimated Timeline: 4-5 weeks**

This focused approach will deliver a complete, production-ready formation building system that can immediately start serving CHW training content through the mobile app.
