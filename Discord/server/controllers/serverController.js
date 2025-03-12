const Server = require('../models/Server');

// Create a new server
exports.createServer = async (req, res) => {
  try {
    const { name, description, handle } = req.body;
    
    // Check if server handle already exists
    const serverExists = await Server.findOne({ handle });
    if (serverExists) {
      return res.status(400).json({
        success: false,
        message: 'Server with this handle already exists'
      });
    }

    const server = await Server.create({
      name,
      description,
      handle: handle.startsWith('@') ? handle : `@${handle}`,
      owner: req.user._id,
      admins: [req.user._id],
      members: [req.user._id],
      channels: [{ name: 'general', type: 'text' }] // Default channel
    });

    res.status(201).json({
      success: true,
      server
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all servers (with optional search)
exports.getServers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { isPrivate: false };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { handle: { $regex: search, $options: 'i' } }
      ];
    }

    const servers = await Server.find(query)
      .populate('owner', 'username handle')
      .select('name handle description members');

    res.json({
      success: true,
      servers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get server by handle
exports.getServerByHandle = async (req, res) => {
  try {
    const server = await Server.findOne({ handle: req.params.handle })
      .populate('owner', 'username handle')
      .populate('members', 'username handle')
      .populate('admins', 'username handle');

    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }

    res.json({
      success: true,
      server
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Join server
exports.joinServer = async (req, res) => {
  try {
    const server = await Server.findOne({ handle: req.params.handle });
    
    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }

    if (server.members.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this server'
      });
    }

    server.members.push(req.user._id);
    await server.save();

    res.json({
      success: true,
      message: 'Successfully joined the server'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};