import { App } from 'cdktf';
import { InfrastructureApp } from './app';
import { config } from './config';

/**
 * Terraform cdk Main application that holds all stacks
 * Provisioned in this context.
 */
const app = new App();
const props = config();
/**
 * Infrastructure Application
 */
new InfrastructureApp(app, 'InfraApplication', props);
app.synth();
