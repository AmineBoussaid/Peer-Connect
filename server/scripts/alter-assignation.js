const db = require('../config/db');

(async () => {
  try {
    const [rows] = await db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'assignation'
         AND COLUMN_NAME = 'recommendation'`
    );

    if (rows.length === 0) {
      await db.query(
        "ALTER TABLE assignation ADD COLUMN recommendation ENUM('Accepter','Réviser','Rejeter') DEFAULT NULL"
      );
      console.log('Column recommendation added');
    } else {
      console.log('Column recommendation already exists');
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
})();
