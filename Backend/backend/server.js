const app = require('../apps/api/app');

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`HepatoScan API running on port ${port}`);
});
