import fs from 'fs';
import { fileURLToPath } from 'url';

import('./src/server.js').catch(e => {
    fs.writeFileSync('err_server.txt', e.stack);
});
