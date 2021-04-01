import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { AwsProvider } from '@cdktf/provider-aws';
import { StaticSiteStack } from './stacks/static-site.stack';
import { AppProps } from './interfaces/app-props.interface';
import { ContainerSiteStack } from './stacks/container-site-stack';

/**
 * Main Infrastructure Application
 * Deploys all stacks required to provision whole
 * architecture.
 */
export class InfrastructureApp extends TerraformStack {
    constructor(scope: Construct, name: string, config: AppProps) {
        super(scope, name);
        /**
         * Since it uses AWS as Cloud Provider
         */
        new AwsProvider(this, 'aws', {
            region: 'us-east-1',
        });

        /**
         * Static Site Application Stack
         */
        new StaticSiteStack(this, 'StaticSiteStack', { bucketName: config.bucketName });

        /**
         * Container Based Site Application Stack
         */
        // new ContainerSiteStack(this, 'ContainerSiteStack', {
        //     vpcId: config.subnets,
        //     subnets: config.subnets.toString().split(','),
        // });
    }
}
