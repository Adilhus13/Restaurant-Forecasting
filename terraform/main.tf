terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# RDS PostgreSQL Database
resource "aws_db_instance" "restaurant_db" {
  identifier            = "restaurant-forecasting-db"
  engine                = "postgres"
  engine_version        = "15.3"
  instance_class        = var.db_instance_class
  allocated_storage     = var.db_allocated_storage
  storage_type          = "gp3"
  db_name               = "restaurant_forecasting"
  username              = "postgres"
  password              = var.db_password
  parameter_group_name  = "default.postgres15"
  skip_final_snapshot   = var.skip_final_snapshot

  # Security & backup
  publicly_accessible            = false
  multi_az                        = false
  backup_retention_period         = 7
  backup_window                   = "03:00-04:00"
  preferred_maintenance_window    = "mon:04:00-mon:05:00"
  storage_encrypted               = true
  deletion_protection             = true

  # VPC & Security
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.default.name

  tags = {
    Name = "restaurant-forecasting-db"
    Env  = var.environment
  }
}

# VPC (use default or specify custom)
resource "aws_db_subnet_group" "default" {
  name       = "restaurant-forecasting-subnet-group"
  subnet_ids = var.db_subnet_ids

  tags = {
    Name = "restaurant-forecasting-subnet-group"
  }
}

# RDS Security Group
resource "aws_security_group" "rds_sg" {
  name = "restaurant-forecasting-rds-sg"

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.allowed_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "restaurant-forecasting-rds-sg"
  }
}

# Secrets Manager (store RDS password)
resource "aws_secretsmanager_secret" "db_password" {
  name                    = "restaurant-forecasting/db-password"
  recovery_window_in_days = 0

  tags = {
    Name = "restaurant-forecasting-db-password"
  }
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = var.db_password
}
