import { Construct } from 'constructs';
import { TerraformOutput } from 'cdktf';
import { EcrRepository, DataAwsEcrImage } from '@cdktf/provider-aws';
import * as Null from '@cdktf/provider-null';
import * as hashdirectory from 'hashdirectory';
import { IPrincipal } from '../interfaces/i-principal.interface';

/**
 * Useful Configuration Props for ECR
 */
export interface EcrAssetConfig {
    path: string;
    name: string;
}

/**
 * Util Class to abstract ECR Complexity
 * from creating repository to pushing and pulling
 */
export class EcrAsset extends Construct {
    public readonly image: string;
    public readonly repository: EcrRepository;
    public readonly imageDigest?: string;

    constructor(scope: Construct, name: string, config: EcrAssetConfig) {
        super(scope, name);

        const compatibleName = config.name.toLowerCase();

        this.repository = new EcrRepository(this, 'dockerAsset', {
            name: compatibleName,
        });

        const buildAndPush = new Null.Resource(this, 'buildAndPush', {
            dependsOn: [this.repository],
            triggers: { folderhash: hashdirectory.sync(config.path) },
        });

        const data = new DataAwsEcrImage(this, 'image', {
            repositoryName: this.repository.name,
            imageTag: 'latest',
            dependsOn: [buildAndPush],
        });

        const imageName = this.repository.repositoryUrl;
        const command = `aws ecr get-login-password --region us-east-1 |
            docker login --username AWS --password-stdin ${imageName} &&
            cd ${config.path} && docker build -t ${imageName} . &&
            docker push ${imageName}`;
        buildAndPush.addOverride('provisioner.local-exec.command', command);

        new TerraformOutput(this, 'ecr', { value: this.repository.repositoryUrl });

        this.image = this.repository.repositoryUrl;
        this.imageDigest = data.imageDigest;
    }

    public grantPull(principal: IPrincipal) {
        const actions = ['ecr:BatchCheckLayerAvailability', 'ecr:GetDownloadUrlForLayer', 'ecr:BatchGetImage'];
        principal.grant('ecr-pull', actions, this.repository.arn);
        principal.grant('ecr-login', ['ecr:GetAuthorizationToken']);
    }
}
