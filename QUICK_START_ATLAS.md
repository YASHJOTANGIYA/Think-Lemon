# 🚀 Quick Reference - MongoDB Atlas Setup

## 📋 Quick Steps (15 minutes total)

### 1️⃣ Create Account (5 min)
- Go to: https://www.mongodb.com/cloud/atlas/register
- Sign up & verify email

### 2️⃣ Create Cluster (5 min)
- Click "Build a Database"
- Choose **M0 FREE** tier
- Select region (Mumbai for India)
- Click "Create Cluster"

### 3️⃣ Create User (2 min)
- Go to "Database Access"
- Add user: `thinklemon_admin`
- **Save the password!** ⚠️

### 4️⃣ Allow Access (2 min)
- Go to "Network Access"
- Click "Allow Access from Anywhere"

### 5️⃣ Get Connection String (1 min)
- Click "Connect" on cluster
- Choose "Drivers"
- Copy connection string

### 6️⃣ Update .env File (1 min)
```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/think-lemon?retryWrites=true&w=majority
```
Replace USERNAME and PASSWORD with your actual credentials!

### 7️⃣ Restart & Seed
```bash
# Stop current server (Ctrl+C)
npm run dev
npm run seed
```

---

## ✅ Success Indicators

You'll see:
```
✅ MongoDB Connected Successfully
🚀 Server is running on port 5000
```

---

## 🔗 Important Links

- **Atlas Dashboard:** https://cloud.mongodb.com/
- **Detailed Guide:** See `MONGODB_ATLAS_SETUP.md`

---

## ⚠️ Common Issues

**"bad auth" error?**
→ Check username/password in connection string

**"Connection timeout"?**
→ Add IP to Network Access (0.0.0.0/0)

**Special characters in password?**
→ URL encode them or use simple password

---

## 📞 Need Help?

1. Check `MONGODB_ATLAS_SETUP.md` for detailed guide
2. Verify all 7 steps completed
3. Check troubleshooting section

**Your connection string should look like:**
```
mongodb+srv://thinklemon_admin:MyPass123@cluster0.ab1cd.mongodb.net/think-lemon?retryWrites=true&w=majority
```
