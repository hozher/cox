import { EcsCluster, EcsService, EcsTaskDefinition, SecurityGroup } from '@cdktf/provider-aws';
import { Construct } from 'constructs';
import { ContainerSiteProps } from '../interfaces/container-site-props.interface';
import { EcrAsset } from '../util/ecr-asset';
import { IamRoleResource } from '../util/iam-role.resource';
import * as path from 'path';

/**
 * Container Based Site infrastructure Stack
 * Deploys a dockerized site to ECR and makes
 * usage of ECS to provision a cluster to orchestrate
 * a new service.
 */
export class ContainerSiteStack extends Construct {
    constructor(scope: Construct, name: string, props: ContainerSiteProps) {
        super(scope, name);

        /**
         * Main ECS Cluster to manage Services
         */
        const cluster = new EcsCluster(this, 'EcsCluster', {
            name: 'MainEcsCluster',
        });

        /**
         * ECR Asset to be deployed
         */
        const ecrAsset = new EcrAsset(this, 'AppImage', {
            name: 'feAsset',
            path: path.resolve('fe', __dirname),
        });
        const fullImage = `${ecrAsset.image}@${ecrAsset.imageDigest}`;
        /**
         * ECS Resources to be created in order to
         * have a new service running over the main ECS
         * Cluster
         */
        const taskRole = new IamRoleResource(this, 'EcsTaskRole');
        const taskExecutionRole = new IamRoleResource(this, 'EcsTaskExecutionRole');
        const taskDefinition = new EcsTaskDefinition(this, 'EcsTaskDefinition', {
            networkMode: 'awsvpc',
            requiresCompatibilities: ['FARGATE'],
            cpu: '256',
            memory: '512',
            executionRoleArn: taskExecutionRole.resource.arn,
            taskRoleArn: taskRole.resource.arn,
            containerDefinitions: JSON.stringify([
                {
                    name: 'app',
                    image: fullImage,
                    essential: true,
                    portMappings: [
                        {
                            protocol: 'tcp',
                            containerPort: 80,
                            hostPort: 80,
                        },
                    ],
                },
            ]),
            family: name,
        });
        /**
         * Security Group to allow access to container
         */
        const securityGroup = new SecurityGroup(this, 'ServiceSecurityGroup', {
            namePrefix: 'ServiceSG',
            vpcId: props.vpcId,
            ingress: [
                {
                    protocol: 'tcp',
                    fromPort: 80,
                    toPort: 80,
                    cidrBlocks: ['0.0.0.0/0'],
                    ipv6CidrBlocks: ['::/0'],
                },
            ],
            egress: [
                {
                    protocol: '-1',
                    fromPort: 0,
                    toPort: 0,
                    cidrBlocks: ['0.0.0.0/0'],
                    ipv6CidrBlocks: ['::/0'],
                },
            ],
        });
        /**
         * The ECS Service itself to run the newest task
         * with the corresponding docker image.
         */
        new EcsService(this, 'EcsService', {
            name: 'EcsService',
            cluster: cluster.arn,
            taskDefinition: taskDefinition.arn,
            desiredCount: 1,
            launchType: 'FARGATE',
            schedulingStrategy: 'REPLICA',
            networkConfiguration: [
                {
                    securityGroups: [securityGroup.id],
                    subnets: props.subnets,
                    assignPublicIp: true,
                },
            ],
        });
    }
}
