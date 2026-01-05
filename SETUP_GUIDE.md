# CareSync Setup Guide - Click by Click

## Part 1: Install Node.js (skip if you already have it)

### Check if you have Node.js:
1. Open **Terminal** (Mac) or **Command Prompt** (Windows)
2. Type: `node --version`
3. Press Enter

**If you see a version number like `v18.17.0` or higher** → Skip to Part 2

**If you see "command not found" or an error:**
1. Go to https://nodejs.org
2. Click the big green button that says **"LTS"** (left side)
3. Open the downloaded file
4. Click through the installer (Next → Next → Install → Finish)
5. **Close and reopen Terminal/Command Prompt**
6. Type `node --version` again - you should now see a version number

---

## Part 2: Create a Free Database on Supabase

### Step 1: Create an account
1. Go to https://supabase.com
2. Click **"Start your project"** (green button, top right)
3. Click **"Continue with GitHub"** (easiest) or sign up with email

### Step 2: Create a new project
1. After logging in, click **"New Project"** (green button)
2. If asked to create an organization first:
   - Name: Your name or anything
   - Type: Personal
   - Click "Create organization"
3. Now fill in the project details:
   - **Name:** `caresync`
   - **Database Password:** Click **"Generate a password"** 
   - **⚠️ IMPORTANT: Click "Copy" to save this password somewhere (Notes app, etc.) - you'll need it!**
   - **Region:** Pick the one closest to you
   - Click **"Create new project"**
4. Wait 1-2 minutes for setup (you'll see a loading screen)

### Step 3: Get your connection string
1. Once your project is ready, look at the **top right** of the page
2. Click the green **"Connect"** button
3. A popup appears with connection options
4. You'll see tabs: **App Frameworks | ORMs | ...**
5. Click **"ORMs"**
6. Click **"Prisma"** in the list
7. You'll see a connection string that looks like:
   ```
   postgresql://postgres.[something]:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```
8. Click the **copy icon** next to the "Transaction" connection string
9. Paste it somewhere (Notes app) - you'll need this soon
10. In that string, replace `[YOUR-PASSWORD]` with the database password you saved earlier

---

## Part 3: Download and Set Up the Project

### Step 1: Download the project
1. You should have a `caresync` folder from our earlier work
2. Move it somewhere easy to find (like your Desktop)

### Step 2: Open Terminal in the project folder

**On Mac:**
1. Open **Finder**
2. Navigate to the `caresync` folder
3. Right-click the folder
4. Hold **Option** key → Click **"New Terminal at Folder"**

**On Windows:**
1. Open **File Explorer**
2. Navigate to the `caresync` folder  
3. Click in the address bar at the top
4. Type `cmd` and press Enter

### Step 3: Install dependencies
In Terminal/Command Prompt, type:
```bash
npm install
```
Press Enter. Wait 1-2 minutes. You'll see a lot of text scrolling.

When it's done, you'll see something like:
```
added 250 packages in 45s
```

---

## Part 4: Configure the App

### Step 1: Create the environment file
In the same Terminal window, type:

**Mac:**
```bash
cp .env.example .env
```

**Windows:**
```bash
copy .env.example .env
```

### Step 2: Edit the environment file

**Mac:**
```bash
open .env
```
This opens the file in TextEdit.

**Windows:**
```bash
notepad .env
```
This opens the file in Notepad.

### Step 3: Fill in your values
The file will look like this:
```
DATABASE_URL="postgresql://user:password@localhost:5432/caresync?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Replace it with:**
```
DATABASE_URL="YOUR_SUPABASE_CONNECTION_STRING_HERE"
JWT_SECRET="caresync-local-dev-secret-key-12345"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

For `DATABASE_URL`:
1. Paste the connection string you copied from Supabase
2. Make sure `[YOUR-PASSWORD]` is replaced with your actual password
3. The final string should look like:
   ```
   DATABASE_URL="postgresql://postgres.abcdefg:MyActualPassword123@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
   ```

**Save the file** (Cmd+S on Mac, Ctrl+S on Windows) and close it.

---

## Part 5: Set Up the Database

Back in Terminal, run these commands one at a time:

### Command 1:
```bash
npx prisma generate
```
Wait for it to finish. You should see:
```
✔ Generated Prisma Client
```

### Command 2:
```bash
npx prisma db push
```
Wait for it to finish. You should see:
```
🚀 Your database is now in sync with your Prisma schema.
```

---

## Part 6: Run the App!

In Terminal, type:
```bash
npm run dev
```

You should see:
```
▲ Next.js 14.2.3
- Local:        http://localhost:3000

✓ Ready in 2.3s
```

### Open the app:
1. Open your web browser (Chrome, Safari, etc.)
2. Go to: **http://localhost:3000**
3. You should see the CareSync login page!

---

## Part 7: Create Your Account

1. Click **"Sign up"**
2. Fill in:
   - **Your name:** Your actual name
   - **Email:** Any email (doesn't need to be real for local testing)
   - **Password:** At least 8 characters, with uppercase, lowercase, and a number
   - **Household name:** Something like "The [Your Last Name] Family"
3. Click **"Create Account"**
4. You're in! You should see the dashboard.

---

## You're Done! 🎉

You can now:
- Click **"New Task"** to create tasks
- Go to **Calendar** to see the monthly view  
- Go to **Recovery** to see the smart catch-up plan
- Go to **Household** to see member management

### To stop the app:
In Terminal, press **Ctrl + C**

### To start it again later:
1. Open Terminal in the caresync folder
2. Run: `npm run dev`
3. Go to http://localhost:3000

---

## Troubleshooting

### "command not found: npm"
Node.js isn't installed properly. Go back to Part 1.

### "Error: P1001: Can't reach database server"
Your DATABASE_URL is wrong. Double-check:
- You copied the whole string from Supabase
- You replaced `[YOUR-PASSWORD]` with your actual password
- There are no extra spaces

### "Invalid password" when signing up
Password needs: 8+ characters, one uppercase, one lowercase, one number.
Example: `MyPassword123`

### Page won't load / shows error
1. Make sure Terminal is still running `npm run dev`
2. Make sure you're going to `http://localhost:3000` (not https)

### Port 3000 already in use
Something else is using that port. Run this instead:
```bash
npm run dev -- -p 3001
```
Then go to http://localhost:3001
