variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-north-1"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "production"
}

variable "db_instance_class" {
  description = "RDS instance type"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS storage in GB"
  type        = number
  default     = 20
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
  # Prompt user to provide this
}

variable "db_subnet_ids" {
  description = "Subnet IDs for RDS (must be in different AZs)"
  type        = list(string)
  # User must provide these (or use default VPC subnets)
}

variable "allowed_cidr" {
  description = "CIDR block allowed to access RDS (e.g., Amplify or EC2 security group)"
  type        = string
  default     = "10.0.0.0/16"
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot on destruction"
  type        = bool
  default     = false
}
