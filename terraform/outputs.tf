output "rds_endpoint" {
  description = "RDS database endpoint"
  value       = aws_db_instance.restaurant_db.endpoint
}

output "rds_address" {
  description = "RDS database address (hostname only)"
  value       = aws_db_instance.restaurant_db.address
}

output "rds_port" {
  description = "RDS database port"
  value       = aws_db_instance.restaurant_db.port
}

output "db_name" {
  description = "Database name"
  value       = aws_db_instance.restaurant_db.db_name
}

output "rds_resource_id" {
  description = "RDS database resource ID"
  value       = aws_db_instance.restaurant_db.resource_id
}

output "database_url" {
  description = "PostgreSQL connection string (for environment variable)"
  value       = "postgresql://postgres:${var.db_password}@${aws_db_instance.restaurant_db.address}:${aws_db_instance.restaurant_db.port}/${aws_db_instance.restaurant_db.db_name}"
  sensitive   = true
}
