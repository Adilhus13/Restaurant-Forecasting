# AWS Deployment Guide — Restaurant Demand Forecasting

This guide covers deploying the Next.js application to AWS with RDS PostgreSQL, using **AWS Amplify** (easiest) or **EC2 + RDS** (more control).

## Quick Start: AWS Amplify (Recommended)

### Prerequisites
- AWS Account (you have this)
- GitHub repo connected (you have https://github.com/Adilhus13/Restaurant-Forecasting.git)
- AWS Amplify CLI or console access

### Steps

1. **Connect GitHub to Amplify**
   - Go to AWS Console → Amplify
   - Click "Create App" → "Deploy an app"
   - Select GitHub as source
   - Authorize Amplify to access your GitHub repo
   - Select `Adilhus13/Restaurant-Forecasting`

2. **Configure Build Settings**
   - Amplify auto-detects Next.js
   - Env vars: Set `DATABASE_URL` (RDS connection string, see below)
   - Build command: `npm run build`
   - Start command: `npm start`

3. **Set up RDS PostgreSQL**
   - AWS Console → RDS → Create Database
   - Engine: PostgreSQL 15+
   - DB instance class: `db.t3.micro` (free tier eligible)
   - Storage: 20 GB
   - Public accessible: No (keep private in VPC)
   - VPC: Same as Amplify app
   - Database name: `restaurant_forecasting`
   - Master user: `postgres` / (strong password)

4. **Security Groups**
   - Amplify app security group → inbound rule
   - Allow PostgreSQL (port 5432) from Amplify SG to RDS SG

5. **Environment Variables in Amplify**
   ```
   DATABASE_URL=postgresql://postgres:PASSWORD@rds-endpoint.eu-north-1.rds.amazonaws.com:5432/restaurant_forecasting
   NODE_ENV=production
   ```

6. **Deploy**
   - Push commits to main branch
   - Amplify auto-builds and deploys

---

## Alternative: AWS EC2 + RDS

### Setup RDS PostgreSQL (Same as above)

### Launch EC2 Instance
1. **Create Instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance type: `t3.micro` (free tier)
   - VPC: Same as RDS
   - Security group: Allow HTTP (80), HTTPS (443), SSH (22)

2. **Connect and Deploy**
   ```bash
   ssh -i key.pem ubuntu@EC2_PUBLIC_IP
   
   # Update and install Node.js
   sudo apt update && sudo apt install -y nodejs npm git
   
   # Clone repo
   git clone https://github.com/Adilhus13/Restaurant-Forecasting.git
   cd Restaurant-Forecasting
   
   # Install dependencies
   npm install
   
   # Setup environment
   cp .env.example .env.production
   # Edit .env.production and set DATABASE_URL to RDS endpoint
   
   # Run Prisma migrations
   npx prisma migrate deploy
   
   # Build Next.js
   npm run build
   
   # Start app (use PM2 for persistence)
   npm install -g pm2
   pm2 start "npm start" --name restaurant-forecasting
   pm2 startup
   pm2 save
   ```

3. **Setup HTTPS with Certbot**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot certonly --standalone -d your-domain.com
   ```

4. **Reverse Proxy (Nginx)**
   ```bash
   sudo apt install -y nginx
   # Create /etc/nginx/sites-available/restaurant-forecasting
   # Point to localhost:3000
   sudo systemctl start nginx
   ```

---

## Switching from SQLite to PostgreSQL

1. **Update `prisma/schema.prisma`**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

3. **Seed Production Data**
   ```bash
   curl -X POST https://your-app.com/restaurantDemandForecasting/api/demand/seed \
     -H "Content-Type: application/json" \
     -H "x-user: {\"id\":\"admin\",\"role\":\"admin\"}" \
     -d '{
       "locationId":"loc-downtown-01",
       "groupName":"Antigravity Group",
       "locationName":"Downtown Bistro"
     }'
   ```

---

## Environment Variables

See `.env.example` for the full list. Key production vars:

```env
DATABASE_URL=postgresql://user:password@host/db
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com
```

---

## Monitoring & Logs

**Amplify:** Logs tab in Amplify console (auto-streamed from CloudWatch)

**EC2 + RDS:**
- App logs: `pm2 logs restaurant-forecasting`
- RDS performance insights: RDS console
- CloudWatch: Create custom alarms for RDS CPU/connections

---

## Cost Estimate (per month, free tier eligible)
- RDS PostgreSQL `db.t3.micro`: ~$9 (or free tier if within 12 months)
- Amplify: Pay-per-build (~$0.01/per build minute)
- EC2 `t3.micro`: free tier (or ~$8/month after)
- Total: ~$10–20/month

---

## Next Steps
1. Choose Amplify (easy) or EC2 (more control)
2. Create RDS database
3. Update `prisma/schema.prisma` to use PostgreSQL
4. Set `DATABASE_URL` in AWS console
5. Deploy and seed data

Questions? Reach out or check AWS documentation for your region (eu-north-1).
