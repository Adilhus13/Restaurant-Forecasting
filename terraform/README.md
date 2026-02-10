# Terraform — RDS PostgreSQL IaC

This folder contains Infrastructure-as-Code (Terraform) to provision RDS PostgreSQL on AWS for the Restaurant Forecasting application.

## Quick Start

1. **Install Terraform**
   ```bash
   # macOS
   brew install terraform
   
   # Windows (via Chocolatey)
   choco install terraform
   
   # Or download from https://www.terraform.io/downloads.html
   ```

2. **Configure AWS Credentials**
   ```bash
   aws configure
   # Enter your AWS Access Key ID and Secret Access Key
   # Region: eu-north-1
   ```

3. **Prepare Variables**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your actual values:
   # - Strong password for db_password
   # - Your VPC subnet IDs
   # - Allowed CIDR (your EC2 or Amplify security group)
   ```

4. **Initialize & Plan**
   ```bash
   terraform init
   terraform plan
   ```

5. **Apply**
   ```bash
   terraform apply
   # Review the plan, type 'yes' to proceed
   ```

6. **Retrieve Outputs**
   ```bash
   terraform output database_url
   # Copy this DATABASE_URL to your .env.production
   ```

## What Gets Created

- **RDS PostgreSQL Instance** (`db.t3.micro`, 20GB storage)
- **DB Subnet Group** (for VPC)
- **Security Group** (allows port 5432 from allowed_cidr)
- **AWS Secrets Manager** (stores DB password)

## Destroying Resources (Be Careful!)

```bash
terraform destroy
# Type 'yes' to confirm
```

This will delete the RDS database. Remove `deletion_protection = true` in `main.tf` first if you want to destroy without prompts.

## Notes

- **Free Tier:** If you're within the 12-month free trial, `db.t3.micro` and 20 GB storage are free.
- **Subnets:** RDS requires subnets in different availability zones. Use default VPC subnets or specify custom ones.
- **Backups:** Automated daily backups retained for 7 days. Adjust `backup_retention_period` as needed.
- **Encryption:** Storage is encrypted by default.

## Troubleshooting

**Error: "db_subnet_ids" is required**
```bash
# Get default subnets
aws ec2 describe-subnets --filters "Name=default-for-az,Values=true" --region eu-north-1 --query 'Subnets[*].[SubnetId,AvailabilityZone]'
```

**Error: "Password must be at least 8 characters"**
- Use a longer, complex password in `terraform.tfvars`

**State Files**
- Terraform creates `terraform.tfstate` (do NOT commit to git)
- Already in `.gitignore`
- For team workflows, use remote state (S3 + DynamoDB)

## Next Steps

1. After `terraform apply`, note the RDS endpoint
2. Update `prisma/schema.prisma` provider to `postgresql`
3. Set `DATABASE_URL` in your environment
4. Run `npx prisma migrate deploy`
5. Deploy app to Amplify or EC2

Questions? See DEPLOYMENT.md in the root folder.
