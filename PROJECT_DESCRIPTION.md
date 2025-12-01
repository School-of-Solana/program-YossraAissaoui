# Project Description

**Deployed Frontend URL:** [Birthday Events Creator](https://invitemeifyouwant.netlify.app)
- ps: it is working nicely in localhost but i had pb in deploying w/ vercel (eslint errors TT)
  
**Solana Program ID:** `FLf5wn4AFa6ssQAhVYHjkEwoTyJPi7UQ7gZnv5jEWUJM`

## Project Overview

### Description
Birthdayinvite is a decentralized application build on solana to enable users to create their own birthday events on-chain and confirm attendance of their invited friends. 
Any user could connect his phantom wallet create event and interact with the selected event by increment coming button or busy button and add comments.
This dApp demonstrates basic Solana program development concepts including PDAs, account creation, and state management.


### Key Features

- Create Birthday Event: Initialize a new birthday event account for your wallet
- Confirm Attendance: Add 1 to your coming or busy friends counting
- Decline Attendance: Set your attendace back by -1
- Add Comment: Write your comment that is related to a selected event
- Delete Comment: Remove your comment
- View Events: Display all events and comments with owner and current coming/busy friends counting value
  
### How to Use the dApp

1. **Connect Wallet**
2. **Start:** Click on Get Started →
3. **Create a Birthday Event:** Fill up the form, the event name and date, then Click on Create Event
4. **Approve the transaction with your Wallet** 
5. **View Created Event:** The event appears on the screen with: 
   - Event name and date and owner 
   - RSVP Buttons (I'm Coming / I'm Busy) 
   - Comment Section (empty initially) 
   - Counters showing 0 coming, 0 busy
6. **RSVP: "Coming"** Click the "I'm Coming" button and approve with your wallet and you will see "Coming" counter increments to 1
7. **RSVP: "Busy"** Click the "I'm Busy" button and approve with your wallet and you will see "Coming" counter decrements to 0 and "Busy" counter increments to 1
8. **Add a Comment:** Scroll down to comments section write a comment and click "Send" button then approve with your wallet, you will see comments with their owners wallet address
9. **Delete a Comment:** Click the "Delete" button on one of your comments and approve the transaction in your wallet

## Program Architecture
```
programs/birthday-invite/src/
├── lib.rs              # Program entry point and instruction routing
├── state.rs            # Note account structure definition
├── errors.rs           # Custom error types
└── instructions/
    ├── mod.rs                   # Instruction module exports
    ├── add_comment.rs           # Comment creation logic
    ├── confirm_attendance.rs.   # Vote on RSVP (Coming) logic
    ├── decline_attendance.rs    # Switch from confirmed (Coming) to declined (Busy) logic
    ├── initialize_bday_event.rs # Event creation logic
    └── remove_comment.rs        # Comment deletion logic
```

### PDA Usage
The program uses Program Derived Addresses (PDAs) to create deterministic BirthdayEvent accounts for each user. The seed used is the `EVENT_SEED`.

**PDAs Used:**
- **Birthday Event PDA**: Derived using the event name, the seed `"EVENT_SEED"`, and the creator's public key. This ensures each creator can have uniquely named events while maintaining deterministic addressing. The PDA stores the complete event state including:
  - Event metadata (name, date, creator)
  - RSVP tracking (coming/busy counts and individual RSVP records)
  - Comment thread (up to 5 comments per event)
  - Bump seed for PDA derivation

### Program Instructions
The birthday invite program implements several instructions for managing birthday events and guests/users interactions.

**Instructions Implemented:**
- initialize_bday_event: Creates a new birthday event with name and date. Initializes with zero RSVPs and empty comment list.

- confirm_attendance: Allows guests to RSVP as "coming". Sets `is_coming: true` and increments `coming_count`.

- decline_attendance: Allows guests to RSVP as "busy". Sets `is_coming: false` and updates counts accordingly.

- add_comment: Enables guests to post comments (max 500 chars). Stores author, content, and unique ID. Limit: 5 comments per event.

- remove_comment: Allows authors to delete their own comments. Verifies ownership before removal.
  

### Account Structure


```rust
#[account]
pub struct BirthdayEvent {
    pub creator: Pubkey,         // The Address of the event owner
    pub bump: u8,                // PDA bump
    #[max_len(32)]               // Max 32 bytes for event name
    pub event_name: String,      // The name of the created event 
    pub event_date: i64,         // The date of the created event stored in unix timestamp
    pub coming_count: u32,       // The counting of the guests who voted on coming
    pub busy_count: u32,         // The counting of the guests who voted on busy
    #[max_len(5)]                // Max of 5 RSVP
    pub rsvps: Vec<RSVP>,        // List of tracked RSVP
    #[max_len(5)]                // Max 5 comments per event
    pub comments: Vec<Comment>,  // List of all comments
}
```

### Nested Structures:
```rust
pub struct RSVP {
    pub invited_person: Pubkey,  // Guest's public key
    pub is_coming: bool,         // true = Coming, false = Busy
}

pub struct Comment {
    pub comment_author: Pubkey,  // Comment author's public key
    pub comment_id: u64,         // Unique identifier for the comment
    #[max_len(500)].             // Max 500 characters in one comment
    pub content: String,         // Comment text
}
```

## Testing

### Test Coverage
The test suite covers the core functionality of the birthday invite program, including event creation, RSVP management, and comment interactions. Tests are written using Anchor's testing framework with Mocha and Chai assertions.

**Happy Path Tests:**
- **Test 1: Create Birthday Event** - Verifies that a creator can successfully initialize a birthday event with a name and future date. Confirms the event account is created with correct initial values (event name, creator public key, and zero RSVP counts).

- **Test 2: RSVP Coming** - Tests that a guest can confirm their attendance to an event. Validates that the `comingCount` increments correctly when a guest RSVPs as "coming".

- **Test 3: RSVP Toggle (Coming → Busy)** - Ensures guests can change their RSVP status from "coming" to "busy". Verifies that `comingCount` decrements and `busyCount` increments appropriately.

- **Test 4: Add Comment** - Confirms that guests can add comments to birthday events. Checks that the comment is stored with correct content and author information.

- **Test 5: Remove Comment** - Tests that comment authors can successfully delete their own comments from events. Validates that the comment count decreases after removal.

- **Test 6: Multiple Guests RSVP** - Verifies that multiple different guests can independently RSVP to the same event, ensuring the system handles concurrent attendees correctly.


**Unhappy Path Tests:** 

I will Consider adding tests for future enhancements but now they are not included in tests/birthday-invite.ts file:
- Test 1: Invalid event dates
- Test 2: Event name validation and edge cases
- Test 3: Duplicate RSVP handling
- Test 4: Unauthorized comment deletion attempts

-> For now, the test suite contains 6 tests in total, all passing.


### Running Tests
```bash
# Navigate to anchor project
cd anchor_project
cd birthday-invite

# Commands to run your tests
yarn install    # install dependencies
anchor test    # run tests

# Expected output: 6 passing tests
```

### Additional Notes for Evaluators

**Frontend Implementation:**

- Built with Next.js/React + TypeScript + Tailwind + Solana web3.js
- Uses @solana/wallet-adapter-react for wallet connections
- Real-time updates after each transaction

**Running Frontend Locally**
```bash
# Navigate to frontend directory
cd frontend
cd birthday-invite-frontend

# Install dependencies and run
npm install    # Install dependencies
npm run dev    # Run development server

# Navigate to http://localhost:3000/ in your browser to interact with the dApp.
```

**Deployment:**

- Program deployed on Solana Devnet (you can airdrop 5 Sol to your account, using solana faucet: https://solfaucet.com/ )
- Program ID: `FLf5wn4AFa6ssQAhVYHjkEwoTyJPi7UQ7gZnv5jEWUJM`
- Codama was not used for client generation, so i used Anchor's native TypeScript client (`@coral-xyz/anchor`)
- IDL located at: `target/idl/birthday_invite.json` and made a copy for the frontend at: `src/idl/birthday_invite.json`
- Frontend hosted originally on Vercel but failed to deploy (i will update the link above as soon as it works)
- All source code available in repository