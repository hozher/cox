/**
 * This function collects and holds all
 * configurations for the application which is designed
 * to be used via cli, either through a CI/CD or local CLI
 *
 * @returns Configuration Object
 */
export const config = () => ({
    bucketName: process.env.BUCKET_NAME || 'fe-application-cox-assignment',
    vpc: process.env.VPC_ID || 'vpc-id',
    subnets: process.env.SUBNETS || 'subnet-id1, subnet-id2',
});
