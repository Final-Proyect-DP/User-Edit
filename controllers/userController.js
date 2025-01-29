const User = require('../models/user');
const { sendMessage } = require('../producers/kafkaProducer');
const logger = require('../config/logger');
const { validateUpdateFields } = require('../utils/validateUser');
const handleErrors = require('../utils/handleErrors');

const updateUser = async (req, res) => {
  const { id } = req.params;
  const updateData = {
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    address: req.body.address,
    phone: req.body.phone,
    semester: req.body.semester,
    parallel: req.body.parallel,
    career: req.body.career,
    description: req.body.description
  };

  try {
    validateUpdateFields(updateData);

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    await sendMessage('user.edit', user);
    
    return res.status(200).json({
      success: true,
      message: 'Usuario actualizado correctamente'
    });

  } catch (error) {
    const { status, response } = handleErrors(error, id);
    return res.status(status).json(response);
  }
};

module.exports = { updateUser };
