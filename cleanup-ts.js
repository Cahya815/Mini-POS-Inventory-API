const fs = require('fs');
const path = require('path');

const tsFiles = [
  'src/common/errors/AppError.ts',
  'src/common/middleware/authMiddleware.ts',
  'src/common/middleware/roleMiddleware.ts',
  'src/config/database.ts',
  'src/config/env.ts',
  'src/modules/auth/auth.controller.ts',
  'src/modules/auth/auth.routes.ts',
  'src/modules/auth/auth.service.ts',
  'src/modules/users/user.controller.ts',
  'src/modules/users/user.routes.ts',
  'src/modules/users/user.service.test.ts',
  'src/modules/users/user.service.ts',
];

let deleted = 0;
tsFiles.forEach(file => {
  try {
    fs.unlinkSync(file);
    console.log(`✓ Deleted: ${file}`);
    deleted++;
  } catch (err) {
    console.error(`✗ Failed to delete ${file}:`, err.message);
  }
});

console.log(`\nCleanup complete: ${deleted}/${tsFiles.length} files deleted`);
