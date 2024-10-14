provider "aws" {
  region = "us-east-1"
}

# Setup IAM Roles
resource "aws_iam_role" "apprunner_role" {
  name = "apprunner-ecr-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "build.apprunner.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy_attachment" "apprunner_policy_attachment" {
  name       = "apprunner-ecr-policy-attachment"
  roles      = [aws_iam_role.apprunner_role.name]
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

# Create an App Runner service
resource "aws_apprunner_service" "chessio_backend" {
  service_name = "chessio-backend"

  source_configuration {
    image_repository {
      image_configuration {
        port = "8080"
      }
      image_identifier      = "039612890043.dkr.ecr.us-east-1.amazonaws.com/awsxero/chessio-backend:latest"
      image_repository_type = "ECR"
    }
    
    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_role.arn
    }

    auto_deployments_enabled = true
  }

  instance_configuration {
    cpu    = "1024"
    memory = "2048"
  }
}

# Output the App Runner service URL
output "app_runner_service_url" {
  value = aws_apprunner_service.chessio_backend.service_url
}