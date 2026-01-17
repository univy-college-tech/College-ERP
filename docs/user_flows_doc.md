# User Flows & Journeys

> **Detailed step-by-step user interactions for all personas**

---

## 🎭 User Personas

1. **Admin** - Creates structure, assigns resources
2. **Professor** - Takes attendance, uploads marks, communicates
3. **Student** - Views timetable, checks attendance, sees marks
4. **CR (Class Representative)** - Bridge between professor and students

---

## 🏛️ ADMIN FLOWS

### Flow 1: Create Complete Academic Structure (Critical Path)

**Goal**: Set up a new batch with courses, branches, and classes

**Steps**:
1. Login to Admin Portal
2. Navigate to **Batches** from sidebar
3. Click **"Create Batch"** → Enter "2024-2028" → Save
4. Click batch card → Opens **Batch Detail Page**

**Now on Batch Detail Page (Accordion UI)**:

The page displays courses as collapsible accordion sections. Each course expands to show its branches and classes.

**Step 5 - Link Courses to Batch**:
5. Click **"Link Course"** button (top right)
6. Modal appears → Select "B.Tech" from dropdown → Click **"Link Course"**
7. B.Tech accordion section appears on the page
8. Repeat to link more courses (MBA, M.Tech, etc.)

**Step 6 - Add Branches under Courses**:
9. Click **"Add Branch"** button on the B.Tech accordion header
10. Modal appears:
    - Select Parent Course: "B.Tech" (pre-selected)
    - Branch Name: "Computer Science"
    - Branch Code: "CSE"
11. Click **"Create & Link"**
12. CSE branch card appears inside B.Tech accordion
13. Repeat for ECE, IT, MECH branches

**Step 7 - Create Classes (Sections) for Each Branch**:
14. On CSE branch card, click **"+ Class"** button
15. Modal appears:
    - Branch: CSE (shown)
    - Class Label: Auto-suggested "2024-CSE-A"
16. Click **"Create Class"**
17. Class "2024-CSE-A" appears inside CSE branch card
18. Click "2024-CSE-A" → Opens **Class Management Page**

**Now on Class Management Page**:

**Tab 1 - Assign Students**:
19. Click "Add Students" dropdown
20. Select "Choose from Registered Students"
21. Opens modal with all registered students
22. Filter by "Admission Year: 2024"
23. Select students (bulk select checkboxes)
24. Click "Assign to Class" → Students now in class

**Tab 2 - Add Subjects**:
25. Click "Add Subject" button
26. Enter: Name="Data Structures", Code="CS301", Semester=3
27. Professor dropdown → Search "Sharma" → Select "Prof. Sharma"
28. Click "Save"
29. Repeat for all subjects (DBMS, OS, COA, etc.)
30. System auto-creates groups for each subject-class combo

**Tab 3 - Upload Timetable**:
31. Two options:
    - **Option A**: Drag-drop image file → Upload to Supabase Storage → Save URL
    - **Option B**: Click "Create Structured Timetable"
      - Grid appears: Days (Mon-Sat) × Periods (1-8)
      - Drag subjects from sidebar into time slots
      - Each slot: Select subject, enter room number
      - Click "Save Timetable"

**Tab 4 - Assign CR**:
32. Dropdown shows all students in class
33. Search "Rahul" → Select
34. Click "Assign as CR"
35. Badge "CR" appears next to student name in list

**Tab 5 - Assign Class In-Charge**:
36. Dropdown shows all professors
37. Search "Sharma" → Select
38. Click "Assign as In-Charge"
39. Success toast: "Class in-charge assigned successfully"

**Result**: Class 2024-CSE-A is now fully operational

**Time**: ~15 minutes for one class

---

### Flow 2: Register New Student

**Steps**:
1. Navigate to Students page
2. Click "Register Student" button
3. Fill form:
   - Full Name
   - Email (will be login credential)
   - **Password** (optional - see note below)
   - Roll Number (unique)
   - Phone
   - Admission Year
   - Gender
   - Date of Birth
4. Click "Register"
5. Backend:
   - Creates user in Supabase Auth (role='student')
   - Inserts into `users` table
   - Inserts into `student_profiles` table
6. Success message shows the **password** (custom or generated)
7. Student can now login with email + password
8. Admin must assign student to class via Class Management page

**🔐 Password Rules:**
- If a custom password is entered, it must be at least 6 characters
- If left empty, a default password is generated: `Student@{roll_number}`
  - Example: Roll Number `2024CS001` → Password: `Student@2024CS001`
- The password is returned in the API response after creation
- Password field is not shown when editing (cannot change password through edit form)

---

### Flow 3: Add New Professor

**Steps**:
1. Navigate to Professors page
2. Click "Add Professor"
3. Fill form:
   - Full Name
   - Email
   - **Password** (optional - see note below)
   - Phone
   - Employee ID
   - Department (select from dropdown)
   - Designation (Assistant Prof, Associate Prof, etc.)
   - Qualification
   - Specialization
   - Joining Date
4. Click "Add"
5. Backend:
   - Creates user in Supabase Auth (role='professor')
   - Inserts into `users` table
   - Inserts into `professor_profiles` table
6. Success message shows the **password** (custom or generated)
7. Professor can now login with email + password
8. Professor now available for subject assignment

**🔐 Password Rules:**
- If a custom password is entered, it must be at least 6 characters
- If left empty, a default password is generated: `Prof@{employee_id}`
  - Example: Employee ID `EMP001` → Password: `Prof@EMP001`
- The password is returned in the API response after creation
- Password field is not shown when editing (cannot change password through edit form)

---

### Flow 4: Link Professor to Subject

**Steps**:
1. Navigate to Class Management page
2. Go to "Subjects" tab
3. For each subject row, there's a "Professor" dropdown
4. Click dropdown → Shows all professors
5. Select professor → Auto-saves
6. System auto-creates group:
   - Group name: "CSE-A - Data Structures"
   - Members: Prof. Sharma + all students of CSE-A
   - Type: class_subject

---

## 👨‍🏫 PROFESSOR FLOWS

### Flow 5: View Today's Timetable (Daily Routine)

**Mobile View**:
1. Open professor portal on phone
2. Lands on Home page (timetable)
3. See greeting: "Good Morning, Prof. Sharma!"
4. Vertical timeline showing today's classes:
   ```
   9:00 AM  ┌──────────────────┐
            │ Data Structures  │
            │ CSE-A            │
            │ Room 301         │
            │ [Contact CR 📱]  │
   10:00 AM └──────────────────┘
            
   10:00 AM ┌──────────────────┐
            │ DBMS Lab         │
            │ CSE-B            │
   11:00 AM │ Lab 2            │
            │ [Contact CR 📱]  │
            └──────────────────┘
   ```
5. Swipe left → Tomorrow's schedule
6. Swipe right → Yesterday's schedule

**Desktop View**:
1. Week grid visible
2. Time on left, Mon-Sat horizontal
3. All week's classes visible at once
4. Hover on card → Shows quick actions

---

### Flow 6: Take Attendance (Critical Flow)

**Context**: It's 9:05 AM, Data Structures class just started

**Step 1 - Start Attendance**:
1. Prof opens Home page
2. Sees "Data Structures | CSE-A" card
3. Clicks "Take Attendance" button
4. Confirmation screen:
   - Subject: Data Structures
   - Class: CSE-A (52 students)
   - Date: Oct 14, 2024 (editable)
   - Time: 9:00 AM (editable)
   - Total classes conducted so far: 17
5. Clicks "Start"

**Step 2 - Mark Attendance (10 Students at a Time)**:
6. Screen shows:
   ```
   Students 1-10

   ☑ 001 - Rahul Kumar
   ☑ 002 - Priya Sharma
   ☐ 003 - Amit Patel        ← Absent (unchecked)
   ☑ 004 - Sneha Gupta
   ☑ 005 - Ravi Singh
   ☑ 006 - Pooja Reddy
   ☑ 007 - Arjun Mehta
   ☐ 008 - Anita Verma       ← Absent
   ☑ 009 - Vikram Joshi
   ☑ 010 - Divya Nair

   Present: 8/10

   [Save & Next (11-20)] ──────────▶
   ```
7. Prof unchecks 003 and 008 (absent students)
8. Clicks "Save & Next"
9. Backend saves these 10 records

**Step 3 - Continue Pagination**:
10. Screen shows students 11-20
11. Prof marks attendance
12. Clicks "Save & Next"
13. Repeat until all 52 students marked

**Step 4 - Final Summary**:
14. Completion screen:
    ```
    ✓ Attendance Submitted

    📊 Summary
    ───────────────────
    Total: 52 students
    Present: 45
    Absent: 7

    Absent Students:
    • 003 - Amit Patel
    • 008 - Anita Verma
    • 015 - Sneha Iyer
    • 023 - Rohan Das
    • 034 - Meera Shah
    • 041 - Karan Kapoor
    • 050 - Simran Kaur

    [Edit Attendance] [Done]
    ```
15. Prof reviews, clicks "Done"
16. Backend:
    - Creates attendance_session
    - Inserts 52 attendance_records
    - Increments total_classes_conducted counter
    - Sends notifications to absent students
17. Success toast: "Attendance saved successfully"

**Time**: ~5 minutes for 52 students

---

### Flow 7: Upload Marks

**Step 1 - Setup**:
1. Navigate to Marks page
2. Select Class: CSE-A
3. Select Subject: Data Structures
4. Click "Create Assessment Component"
5. Enter:
   - Name: "Minor Exam 1"
   - Max Marks: 20
   - Weightage: 20%
   - Date: Oct 15, 2024
6. Click "Add"
7. Repeat for Assignment, Minor 2, etc.

**Step 2 - Enter Marks**:
8. Table appears:
   ```
   Roll | Name          | Minor 1 | Assignment | Minor 2 | Internal
   ───────────────────────────────────────────────────────────────
   001  | Rahul Kumar   | [18]    | [19]       | [__]    | [__]
   002  | Priya Sharma  | [20]    | [18]       | [__]    | [__]
   003  | Amit Patel    | [15]    | [16]       | [__]    | [__]
   ...
   ```
9. Prof enters marks in cells
10. Each cell auto-saves on blur
11. Validation: marks ≤ max_marks
12. Cell turns green when saved
13. Shows total/average at bottom

**Step 3 - Finalize**:
14. Review all entries
15. Click "Publish Marks"
16. Confirmation modal: "Marks will be visible to students. Continue?"
17. Click "Yes"
18. Backend:
    - Saves all marks to student_marks table
    - Sends notifications to students
19. Success toast
20. Students can now view marks in their portal

**Time**: ~10 minutes for 50 students

---

### Flow 8: Contact CR

**Context**: Prof needs to announce something to CSE-A

**Steps**:
1. On Home page, click "Contact CR" button on class card
2. Opens CR Contact page
3. Shows: Rahul Kumar (CR of CSE-A) at top (highlighted as in-charge class)
4. Below: CRs of other classes taught
5. Click "Message Rahul"
6. Opens chat interface
7. Type: "Please remind everyone about tomorrow's lab"
8. Click Send
9. Rahul receives notification on phone
10. Rahul can reply in same chat
11. Real-time updates (Supabase Realtime)

---

## 🎓 STUDENT FLOWS

### Flow 9: View Timetable

**Mobile View**:
1. Login to student portal
2. Lands on Home page
3. See greeting: "Hi Rahul! CSE-A | Semester 3"
4. Today's classes shown on timeline:
   ```
   9:00 AM  ┌──────────────────────┐
            │ 📚 Data Structures   │
            │ 👨‍🏫 Prof. Sharma      │
            │ 📍 Room 301          │
   10:00 AM └──────────────────────┘
            
   10:00 AM ┌──────────────────────┐
            │ 🔬 DBMS Lab          │
            │ 👨‍🏫 Prof. Gupta       │
   11:00 AM │ 📍 Lab 2             │
            └──────────────────────┘
   ```
5. Swipe left/right for other days
6. Click any class card → Shows subject details

**Desktop View**:
1. Week grid visible
2. All 6 days at once
3. Time column on left

---

### Flow 10: Check Attendance

**Steps**:
1. Click "Attendance" tab in bottom nav
2. See subject-wise cards:
   ```
   ┌───────────────────────────────┐
   │ 📚 Data Structures            │
   │ ────────────────────────      │
   │ 85% (17/20 classes)          │ ← Green (good)
   │ ████████░░                    │
   │                               │
   │ [View Details ▼]             │
   └───────────────────────────────┘

   ┌───────────────────────────────┐
   │ 🔬 DBMS                       │
   │ ────────────────────────      │
   │ 68% (15/22 classes)          │ ← Orange (warning)
   │ ██████░░░░                    │
   │                               │
   │ [View Details ▼]             │
   └───────────────────────────────┘
   ```
3. Click "View Details" on any subject
4. Expands to show session-by-session:
   ```
   Oct 12 ✓ Present
   Oct 10 ✓ Present
   Oct 08 ✗ Absent
   Oct 05 ✓ Present
   Oct 03 ✓ Present
   ...
   ```
5. At top: Overall attendance across all subjects: 78%

---

### Flow 11: View Marks

**Steps**:
1. Click "Marks" tab
2. See subject-wise cards:
   ```
   ┌───────────────────────────────────────┐
   │ 📚 Data Structures                    │
   │ ─────────────────────────────────     │
   │                                       │
   │ Minor Exam 1:    18/20 (90%)         │
   │ Assignment:      19/20 (95%)         │
   │ Minor Exam 2:    -/20  (Pending)     │
   │ Internal:        -/10  (Pending)     │
   │                                       │
   │ Current Average: 92.5%               │
   └───────────────────────────────────────┘
   ```
3. Scroll down to see all subjects
4. At bottom: Overall performance graph

---

### Flow 12: Participate in Groups

**Steps**:
1. Click "Groups" tab
2. See list of subject groups:
   ```
   📚 Data Structures - CSE-A (53 members)
   🔬 DBMS - CSE-A (53 members)
   💻 Operating Systems - CSE-A (53 members)
   ...
   ```
3. Click any group
4. Opens chat interface
5. See messages from prof and classmates
6. Type message → Send
7. Real-time updates

---

## 🎯 SPECIAL FLOWS

### Flow 13: CR Receives Urgent Message

**Scenario**: Professor needs to cancel tomorrow's lab

**Steps**:
1. Rahul (CR) is browsing Instagram
2. Gets push notification: "New message from Prof. Sharma"
3. Clicks notification → Opens app → Lands in chat
4. Reads: "Tomorrow's DBMS lab cancelled due to equipment maintenance"
5. Rahul opens CSE-A WhatsApp group
6. Forwards message to all classmates
7. Students avoid unnecessary trip to college

**Impact**: Instant communication, 52 students informed within minutes

---

### Flow 14: Student Checks Fee Status

**Steps**:
1. Opens student portal
2. Clicks Profile tab
3. Sees "Fee Status" section:
   ```
   Semester 3 Fees
   ───────────────────────
   Total:     ₹75,000
   Paid:      ₹50,000
   Pending:   ₹25,000
   Due Date:  Oct 31, 2024

   [Pay Now] [View Receipt]
   ```
4. Clicks "Pay Now" → Redirects to payment gateway
5. After payment → Receipt generated
6. Backend updates fee_payments table
7. Pending amount updates

---

### Flow 15: Professor Applies for Leave

**Steps**:
1. Prof opens portal
2. Navigates to Profile → Leave Management
3. Clicks "Apply for Leave"
4. Fills form:
   - Leave Type: Casual Leave
   - From: Oct 16, 2024
   - To: Oct 17, 2024
   - Reason: "Family function"
5. Clicks "Submit"
6. Backend:
   - Creates leave_application
   - Status: Pending
   - Sends notification to HOD
7. HOD reviews → Approves
8. Prof gets notification: "Leave approved"
9. Students see "Prof on leave" in timetable for those dates

---

### Flow 16: Admin Views Reports

**Steps**:
1. Admin navigates to Reports page
2. Selects "Attendance Report"
3. Filters:
   - Batch: 2024-2028
   - Course: B.Tech
   - Branch: CSE
   - Date Range: Oct 1 - Oct 15
4. Clicks "Generate"
5. Backend calculates:
   - Class-wise attendance %
   - Subject-wise attendance %
   - Defaulters list (< 75%)
6. Shows data in tables + charts
7. Clicks "Export to Excel"
8. Downloads .xlsx file with complete data

---

## 🔄 SYSTEM FLOWS (Behind the Scenes)

### Flow 17: Auto-Generate Groups

**Trigger**: Admin assigns professor to subject in class

**Steps**:
1. Admin on Class Management → Subjects tab
2. Adds "Data Structures" subject
3. Assigns "Prof. Sharma" from dropdown
4. Clicks Save
5. Backend:
   ```typescript
   // Create group
   const group = await createGroup({
     group_type: 'class_subject',
     group_name: 'CSE-A - Data Structures',
     class_id: classId,
     class_subject_id: classSubjectId
   });

   // Add professor as admin
   await addGroupMember({
     group_id: group.id,
     user_id: profSharma.user_id,
     role: 'admin'
   });

   // Add all students as members
   const students = await getClassStudents(classId);
   for (const student of students) {
     await addGroupMember({
       group_id: group.id,
       user_id: student.user_id,
       role: 'member'
     });
   }
   ```
6. Group now available in Groups tab for prof + all students

---

### Flow 18: Real-time Notification Push

**Trigger**: Prof uploads marks

**Steps**:
1. Prof clicks "Publish Marks" for Minor Exam 1
2. Backend:
   ```typescript
   // For each student in class
   for (const student of students) {
     // Create notification
     await createNotification({
       recipient_id: student.user_id,
       notification_type: 'marks',
       title: 'Marks Published',
       message: 'Your marks for Data Structures Minor Exam 1 are now available',
       related_entity_type: 'assessment_component',
       related_entity_id: componentId,
       action_url: '/marks'
     });
   }

   // Supabase Realtime broadcasts to all connected clients
   ```
3. Students' apps show notification instantly (if online)
4. If offline, notification appears when they open app

---

### Flow 19: Audit Trail

**Trigger**: Any critical data change

**Example**: Admin changes student's class

**Steps**:
1. Admin changes Rahul from CSE-A to CSE-B
2. Database trigger fires:
   ```sql
   CREATE TRIGGER audit_class_students
   AFTER UPDATE ON class_students
   FOR EACH ROW
   EXECUTE FUNCTION log_audit_trail();
   ```
3. Audit log created:
   ```json
   {
     "table_name": "class_students",
     "record_id": "uuid-123",
     "action_type": "UPDATE",
     "old_values": {
       "class_id": "cse-a-uuid",
       "student_id": "rahul-uuid"
     },
     "new_values": {
       "class_id": "cse-b-uuid",
       "student_id": "rahul-uuid"
     },
     "changed_by": "admin-user-id",
     "changed_at": "2024-10-14 10:30:00"
   }
   ```
4. Admin can later view audit logs to see who changed what and when

---

## 🎯 Edge Cases & Error Handling

### Case 1: Professor Tries to Mark Attendance Twice

**Flow**:
1. Prof marks attendance for Oct 14
2. Later, prof tries to mark again for same date
3. Backend checks: `attendance_sessions` has `UNIQUE(class_subject_id, conducted_date)`
4. Database rejects with unique constraint error
5. Backend catches error
6. Returns: "Attendance already marked for this date. Do you want to edit?"
7. If yes → Opens edit mode with existing data
8. If no → Cancels operation

---

### Case 2: Student Not Assigned to Any Class

**Flow**:
1. New student logs in
2. Frontend queries for student's class
3. Query returns null
4. Shows message: "You are not assigned to any class yet. Please contact admin."
5. Shows empty state with contact info

---

### Case 3: Network Failure During Attendance Submission

**Flow**:
1. Prof marks 40/50 students
2. Network disconnects
3. Clicks "Submit"
4. Request fails
5. Frontend shows: "Network error. Your data is saved locally."
6. Uses IndexedDB to store attendance data
7. When network returns, auto-retries submission
8. Shows success message

---

## 📊 Usage Patterns

### Daily Professor Usage:
- 9:00 AM: Check timetable → Go to class
- 9:05 AM: Take attendance (5 min)
- 5:00 PM: Upload marks / check messages

**Peak Hours**: 9-11 AM (attendance marking)

### Daily Student Usage:
- Morning: Check timetable for day
- After class: Check if attendance marked
- Evening: Check for announcements

**Peak Hours**: 8-9 AM (before classes), 6-8 PM (after college)

### Admin Usage:
- Beginning of year: Heavy usage (structure setup)
- Monthly: Moderate usage (new admissions)
- Daily: Light usage (queries, reports)

---

**Next Steps**: Use these flows when building features to ensure correct implementation!
