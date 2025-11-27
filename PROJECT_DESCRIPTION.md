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
[TODO: Explain how you implemented Program Derived Addresses (PDAs) in your project. What seeds do you use and why?]

**PDAs Used:**
- PDA 1: [Purpose and description]
- PDA 2: [Purpose and description]

### Program Instructions
[TODO: List and describe all the instructions in your Solana program]

**Instructions Implemented:**
- Instruction 1: [Description of what it does]
- Instruction 2: [Description of what it does]
- ...

### Account Structure
[TODO: Describe your main account structures and their purposes]

```rust
// Example account structure (replace with your actual structs)
#[account]
pub struct YourAccountName {
    // Describe each field
}
```

## Testing

### Test Coverage
[TODO: Describe your testing approach and what scenarios you covered]

**Happy Path Tests:**
- Test 1: [Description]
- Test 2: [Description]
- ...

**Unhappy Path Tests:**
- Test 1: [Description of error scenario]
- Test 2: [Description of error scenario]
- ...

### Running Tests
```bash
# Commands to run your tests
anchor test
```

### Additional Notes for Evaluators

[TODO: Add any specific notes or context that would help evaluators understand your project better]