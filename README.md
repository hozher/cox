## Technical Assignment

Infrastructure project that provisions AWS Services in order to host a simple react application through [Terraform CDK](https://learn.hashicorp.com/tutorials/terraform/cdktf)

## Description

The aim of this solution is to provision an architecture that allows to deploy a simple react application making usage of `terraform cdk` in order to provision infrastructure as code. In this case TypeScript.

### Components 

The solution components are described as follows:

#### Static Site Approach 

 + S3 Bucket: to store the web application assets
 + CloudFront Distribution: to create a CDN and provide a SSL certificate

#### Container Based Approach

 + ECS Cluster: to host all services (micro-services)
 + ECR Repository: to store all docker images
 + ECS Task and Service: to create the micro-service itself
 + Security Groups and IAM Roles: because security matters.

## Usage

Of course always make sure to install all dependencies.
```bash
yarn install
```

Make sure all `env-vars` are properly settled. Either on the CI/CD platform or in your local; in this case:
```bash
export BUCKET_NAME=<your-bucket-name-for-the-fe-app>
export VPC_ID=<your-vpc-id-where-the-ecs-is-going-to-be-provisioned>
export SUBNETS=<your-subnets-(comma-separated)-for-ecs-as-well>
```

_Please make sure to have an AWS Token at this point_

To make sure what is going to be provisioned
```bash
yarn synth 
```

Once you are ready, deploy (_don't worry there is a confirmation step_)
```bash
yarn deploy
```

Voilá all resources are deployed. 🎉

## Useful Commands

In order to format your code use:
```bash
yarn format
```

In order to transpile your code use:
```bash
yarn build
```

In order to delete all resources provisioned:
```bash
yarn destroy
```

### Contact
[César Bonilla](https://github.com/hozher)
