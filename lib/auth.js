import { createHash } from 'crypto';
export const token = () => createHash('sha256').update('fb:' + process.env.DASHBOARD_PASSWORD).digest('hex');
