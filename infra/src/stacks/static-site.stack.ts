import { S3Bucket, CloudfrontDistribution } from '@cdktf/provider-aws';
import { TerraformOutput } from 'cdktf';
import { Construct } from 'constructs';
import { StaticSiteProps } from '../interfaces/static-site-props.interface';

/**
 * Static Site infrastructure Stack
 * Deploys a content site to s3 bucket and makes
 * usage of cloudfront in order to have a https site
 * with the given domain and subdomain.
 */
export class StaticSiteStack extends Construct {
    constructor(scope: Construct, name: string, props: StaticSiteProps) {
        super(scope, name);

        /**
         * S3 Content Bucket which stores all Static Site Assets
         */
        const siteBucket = new S3Bucket(this, 'SiteBucket', {
            acl: 'public-read',
            bucket: props.bucketName,
            website: [
                {
                    indexDocument: 'index.html',
                    errorDocument: 'error.html',
                },
            ],
            policy: `{
                "Version": "2012-10-17",
                "Statement": [
                  {
                    "Sid": "PublicReadGetObject",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": [
                      "s3:GetObject"
                    ],
                    "Resource": [
                      "arn:aws:s3:::${props.bucketName}/*"
                    ]
                  }
                ]
            }`,
        });
        new TerraformOutput(this, 'SiteBucketDomainName', { value: siteBucket.bucketRegionalDomainName });

        /**
         * Cloudfront Distribution to enable SSL as well as caching
         */
        const origin = 'S3Origin';
        const distribution = new CloudfrontDistribution(this, 'Distribution', {
            enabled: true,
            origin: [
                {
                    originId: origin,
                    domainName: siteBucket.bucketRegionalDomainName,
                    customOriginConfig: [
                        {
                            httpPort: 80,
                            httpsPort: 443,
                            originProtocolPolicy: 'http-only',
                            originSslProtocols: ['TLSv1.2', 'TLSv1.1'],
                        },
                    ],
                },
            ],
            defaultCacheBehavior: [
                {
                    allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
                    cachedMethods: ['GET', 'HEAD'],
                    targetOriginId: origin,
                    viewerProtocolPolicy: 'redirect-to-https',
                    forwardedValues: [
                        {
                            headers: ['Host', 'Origin', 'Referer'],
                            cookies: [
                                {
                                    forward: 'all',
                                },
                            ],
                            queryString: true,
                        },
                    ],
                },
            ],
            restrictions: [
                {
                    geoRestriction: [
                        {
                            restrictionType: 'none',
                        },
                    ],
                },
            ],
            viewerCertificate: [
                {
                    cloudfrontDefaultCertificate: true,
                    sslSupportMethod: 'sni-only',
                },
            ],
        });
        new TerraformOutput(this, 'DistributionDomainName', { value: distribution.domainName });
    }
}
