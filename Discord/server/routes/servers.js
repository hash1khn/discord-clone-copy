const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  createServer,
  getServers,
  getServerByHandle,
  joinServer
} = require('../controller/serverController');

router.post('/', protect, createServer);
router.get('/', protect, getServers);
router.get('/:handle', protect, getServerByHandle);
router.post('/:handle/join', protect, joinServer);

module.exports = router;