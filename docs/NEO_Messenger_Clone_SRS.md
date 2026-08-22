# NEO Culture Tech

## [NCT] NEO Messenger Clone

## Description

NEO Messenger Clone is a responsive real-time communication platform for a closed student or club community. Users can create direct and small-group conversations, exchange text and image messages, and share temporary photo stories that disappear from the active story tray after 24 hours.

The project should provide a clear, reliable, and secure messaging experience on both mobile and desktop.

---

## Objectives

### Features

#### 1. The project is built in TSX using React

Use reusable React components, TypeScript types, routing, forms, API responses, and reusable conversation UI.

#### 2. User Authentication and Profile Setup

Users can:

- Sign up
- Sign in
- Sign out
- Recover their password
- Upload an avatar
- Create or update a display name

#### 3. Conversation Inbox

Display direct and group conversations ordered by the latest activity, including:

- Latest message preview
- Timestamp
- Unread count
- Participants

#### 4. Direct and Small-Group Conversations

Users can create:

- Direct conversations
- Small-group conversations with up to 10 members

Group settings should include:

- Title
- Image
- Member list

#### 5. Real-Time Text Messaging

Messages should appear without refreshing the page.

Users can:

- Send text messages
- View timestamps
- Load older messages using pagination

#### 6. Image Messages

Users may attach one image to a message.

The application must:

- Validate the image type and size
- Show upload progress
- Provide clear success or failure feedback

#### 7. Message State and Ownership

The application should:

- Show unread and read state at the conversation level
- Allow users to delete only their own messages from public view

Editing and reactions may be treated as extra features.

#### 8. Photo Stories with 24-Hour Expiration (Advanced)

Users can:

- Upload one image
- Add an optional short caption

Stories should no longer appear in the active story tray after 24 hours.

#### 9. Story Tray and Viewer (Advanced)

Display active stories in a horizontal tray with:

- Author information
- Posted time
- Progress
- Previous/next controls
- Keyboard navigation
- Touch navigation

#### 10. Story View Tracking (Advanced)

The application should record when a user views a story.

The story owner should be able to see:

- Viewer count
- A simple viewer list

#### 11. Search and Unread Navigation

Allow users to:

- Search users by name
- Search conversations by name
- View unread badges
- Quickly navigate to the latest unread message

#### 12. Responsive and Accessible Design

Support mobile and desktop layouts.

The application should include:

- Keyboard navigation
- Visible focus states
- Image alt text
- Skeleton loading states
- Retry controls
- Clear empty states
- Clear error states

#### 13. Security and Privacy Rules

The application must ensure:

- Only conversation members can read messages
- Only conversation members can subscribe to conversation updates
- Users can modify only their own content
- Story files follow defined access policies

#### 14. Extra Features

Be creative and add **2 extra features** that improve the messaging experience.

Examples include:

- Typing indicators
- Emoji reactions
- Limited message editing
- Online presence

---

# General Pages

### Homepage / Authentication

Includes:

- Product introduction
- Sign up
- Sign in
- Password recovery
- Profile setup

### Inbox

Includes:

- Conversation list
- Story tray
- Search
- Unread counts
- New-conversation action

### Conversation

Includes:

- Message history
- Real-time updates
- Text composer
- Image upload
- Group information

### Story Composer

Includes:

- Image selection
- Image preview
- File validation
- Caption input
- Publish action

### Story Viewer

Includes:

- Story progress
- Author details
- Navigation
- Seen state
- Viewer list

### Profile and Settings

Includes:

- Display name
- Avatar
- Sign out
- Basic preferences

---

# Libraries

- React with TypeScript (TSX)
- Vite
- React Router
- Tailwind CSS
- An optional UI library such as:
  - shadcn/ui
  - Radix UI
  - MUI
- React Hook Form
- Zod
- Supabase Auth
- Supabase Postgres
- Supabase Realtime
- Supabase Storage
- TanStack Query
- Vitest
- React Testing Library
- Playwright

---

# Material

- React TypeScript
- Vite Guide
- Tailwind CSS with Vite
- Supabase Auth, Realtime, and Storage
- TanStack Query
- Playwright Documentation

---

# Deliverables

The project must include:

- Screenshots of the completed website stored in a folder inside the GitHub repository
- A short **5–8 minute** video demonstrating the main user flows and completed features
- A link to the club's official GitHub repository containing the complete source code
- A `README` file containing:
  - Setup instructions
  - Dependencies
  - Environment variables
  - Team contribution table
  - Extra-feature descriptions

---

# Code Repository and Documentation

All source code related to the project must be pushed to the club's official GitHub repository.

Each team is responsible for maintaining a clear and organized code structure.

The project should follow these practices:

- Use proper file organization
- Use meaningful commit messages
- Keep code modular
- Use reviewed pull requests
- Include a link to the OneDrive weekly reports or project board

## Secrets and Environment Variables

Never commit secret keys.

Store secrets in a `.env` file and provide a safe `.env.example` file.

## README Requirements

The README must clearly explain:

- Project purpose
- Local setup
- Library dependencies
- Database setup
- Environment variables
- Deployment steps
- Team contributions

---

# Final Evaluation

There is no single correct approach to this project, as long as the team meets the required functionality and provides a clear, usable interface.

The project will be evaluated based on:

- Reliability of real-time chat
- Reliability of unread state
- Reliability of image upload
- Reliability of 24-hour story expiration
- Security of conversation membership
- Security of database policies
- Security of real-time channels
- Security of file storage
- Clear user experience for permanent conversations and temporary photo updates
- Responsive UI/UX
- Accessibility
- Media feedback
- Testing
- Documentation
- Balanced contribution
- Creativity and usefulness of the additional features

---

# Project Timeline / Deadline

The project is expected to be completed in **7 weeks**, from **Week 5 to Week 12 of Semester B/2026**.

- **Project deadline:** 17/9/2026
- **Project demonstration:** 18–19/9/2026
