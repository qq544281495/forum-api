const operate = require('../utils/operate');
const path = require('path');

module.exports = {
  deleteUserAvatar: async (url, origin) => {
    if (!url) return;
    const lastPath = url.substring(origin.length);
    const avatarUrl = path.join(__dirname, `../public${lastPath}`);
    const existsAvatar = await operate.exists(avatarUrl);
    if (existsAvatar) {
      await operate.delete(avatarUrl);
    }
  },
};
