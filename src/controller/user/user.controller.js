const { default: mongoose } = require("mongoose");
const { ObjectId, BSON } = require("mongodb");
const User = require("../../models/User");
const { newConversation } = require("../conversation/conversation.controller");

// Get All User Filtering By User roll: user && roll: organizer
const getAllUser = async (req, res) => {
  try {
    // Define the query to filter users by their role
    const query = { role: { $in: ['user', 'organizer'] } };
    const result = await User.find(query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSingleUser = async (req, res) => {
  try {
    const query = {
      email: req.params.email
    };

    // Step 1: Find the user by email
    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).send({ success: false, message: 'User not found' });
    }

    // Step 2: Query for followers by their emails
    const followers = await User.find({ email: { $in: user.followers } }); // Fetch followers' details by email

    // Step 3: Attach the populated followers to the user object
    const userWithFollowers = {
      ...user.toObject(),
      followers // Replace followers array with populated user data
    };

    res.send(userWithFollowers);    

  } catch (error) {
    res.send({
      message: error.message,
    })
  }
};
const getSingleUserById = async (req, res) => {
  try {

    const userId =(req.params.id)
    const query={_id:userId}
    const user = await User.findById(query);

    if (!userId) {
      console.error("User ID is missing or invalid");
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid user ID");
    }
    res.send(user);    

  } catch (error) {
    res.send({
      message: error.message,
    })
  }
};


const createUser = async (req, res) => {

  const user = req.body;
  try {

    await User.create(user)
    res.send({
      success: true,
      message: "Created Successfully",
    })
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    })
  }
};

// update user
const updateUser = async (req, res) => {
  try {
    console.log(req.body)
    const result = await User.updateOne(
      { email: req?.params?.email },
      {
        $set: {
          name: req.body.name,
          phone: req.body.phone,
          city: req.body.city,
          birth: req.body.birth,
          country: req.body.country,
          gender: req.body.gender,
          skills: req.body.skills,
          specialty: req.body.specialty,
          aboutMe: req.body.aboutMe,
        }
      },
      { upsert: false, runValidators: true }
    )
    res.status(200).json(result);
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ message: error.message });
  }
};


// update user Review
const updateUserReviw = async (req, res) => {
  try {
    console.log(req?.params?.email)
    console.log(req.body)
    const result = await User.updateOne(
      { email: req?.params?.email },
      {
        $set: {
          review: req.body,
        }
      },
      { upsert: false, runValidators: true }
    )
    res.status(200).json(result);
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ message: error.message });
  }
};

const updateNotification = async (req, res) => {
  try {

    // Create new notification object from req.body
    const newNotification = {
      type: req.body.type,
      message: req.body.message,
      route: req.body.route || null, // Optional route, can be null
      isRead: false, // Default value
      createdAt: new Date() // Current date
    };
      console.log(newNotification)
    const result = await User.updateOne(
      { email: req?.params?.email },
      {
        $push: {
          notifications: newNotification
        }
      },
      { upsert: false, runValidators: true }
    );

    res.status(200).json(result);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

// followes add korar api

const addedFollower = async (req, res) => {
  const { dynamicUserEmail, currentUserEmail, updateFollowArrayDynamicUser, updateFollowArrayCurrentuser } = req.body;
  console.log("this is a requested put request", req.body)

  try {
    // Update the dynamic user's follower list
    const dynamicUserUpdate = await User.updateOne(
      { email: dynamicUserEmail },
      { $set: { followers: updateFollowArrayDynamicUser } }
    );

    // Update the current user's following list
    const currentUserUpdate = await User.updateOne(
      { email: currentUserEmail },
      { $set: { followers: updateFollowArrayCurrentuser } }
    );

    // Check if both updates were successful
    if (dynamicUserUpdate.modifiedCount > 0 && currentUserUpdate.modifiedCount > 0) {
      res.status(200).json({ message: 'Successfully followed!', modifiedCount: 1 });
    } else {
      res.status(400).json({ message: 'Failed to follow.' });
    }


  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Post OrganizerRequest
const beOrganizer = async (req, res) => {
  try {
    const updateResult = await User.updateOne(
      { email: req.params.email },
      {
        $set: {
          companyName: req.body.companyName,
          location: req.body.location,
          email: req.body.email,
          phone: req.body.phone,
          socialPlatform: req.body.socialPlatform,
          country: req.body.country,
          CEOEmail: req.body.CEOEmail,
          organizer: false,
        }
      },
      { upsert: false, runValidators: true }
    );
    
    // Send the update result as a response
    res.status(200).json(updateResult);
    console.log('Update result:', updateResult);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Organizer Requested User
const getOrganizerRequest= async (req, res) => {
  try {
    const query = { organizer: false };
    const result = await User.find(query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user data by id 
const getUserRollUpdatedId = async (req, res) => {
  try {
    const id = req.params.id
    const user = await User.findOne({_id: id}).select({role:1, organizer: 1})
    if (user) {
      res.status(200).send(user)
    }else{
      res.status(400).send({message:"User Not Found"})
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* Put Request User Roll Update 
const userRollUpdate = async (req, res) =>{
  try{
    const id = req.params.id
    const updatedUserRoll = await User.updateOne({_id: id}, {
      $set:{
        role: "organizer",
        organizer: true,
      }
    });
    if (updatedUserRoll) {
      res.status(200).send({
        success: true , 
        message: "User Role Updated Successfully ", 
        data: updatedUserRoll})
    }
    else{
      res.status(404).send({
        success: false,
        message: "User Role Not Updated"
      })
    }
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//* User Roll Update with Email
const userRollUpdateWithEmail = async (req, res) =>{
  const {email, newRole} = req.body;
  console.log(email, newRole)
  try{
    const updatedUserRoll = await User.updateOne({email: email}, {
      $set:{
        role: newRole,
      }
    });
    if (updatedUserRoll) {
      res.status(200).send({
        success: true , 
        message: "User Role Updated Successfully ", 
        data: updatedUserRoll})
    }
    else{
      res.status(404).send({
        success: false,
        message: "User Role Not Updated"
      })
    }
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
}


//* Put Request User block: true
const blockUser = async (req, res) =>{
  try{
    const id = req.params.id
    const blockedUser = await User.updateOne({_id: id}, {
      $set:{
        block: req.body.block,
      }
    });
    if (blockedUser) {
      res.status(200).send({
        success: true , 
        message: "User Role Updated Successfully ", 
        data: blockedUser})
    }
    else{
      res.status(404).send({
        success: false,
        message: "User Role Not Updated"
      })
    }
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
}
// Organizing Request Cancel
const organizerRequestCancel = async (req, res) =>{
  try{
    const id = req.params.id
    const updatedUserRoll = await User.updateOne({_id: id}, {
      $set:{
        organizer: true,
      }
    });
    if (updateUser) {
      res.status(200).send({
        success: true , 
        message: "Request Rejected Successfully! ", 
        data: updatedUserRoll})
    }
    else{
      res.status(404).send({
        success: false,
        message: "User Role Not Updated"
      })
    }
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// handleAddFollower
const handleAddFollower = async (req, res) => {
  const id = req.params.id
  const { followerEmail } = req.body;  
  if (!followerEmail) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const userId = id; 
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.followers.includes(followerEmail)) {
      user.followers.push(followerEmail); // Add email to the followers array
      await user.save(); // Save changes to the database
    }

    return res.status(200).json({ message: 'Follower added successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

// handleRemoveFollower
const handleRemoveFollower = async (req, res) => {
  const id = req.params.id;
  const { followerEmail } = req.body;

  if (!followerEmail) {
      return res.status(400).json({ message: 'Email is required' });
  }

  try {
      const userId = id;
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Remove the follower if it exists in the followers array
      if (user.followers.includes(followerEmail)) {
          user.followers = user.followers.filter(email => email !== followerEmail);
          await user.save(); // Save changes to the database
      }

      return res.status(200).json({ message: 'Follower removed successfully' });
  } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
  }
};
module.exports = { 
  getAllUser,
  getSingleUser, 
  createUser, 
  updateUser, 
  beOrganizer, 
  getOrganizerRequest, 
  getUserRollUpdatedId,
  blockUser, 
  userRollUpdate,
  organizerRequestCancel,
  addedFollower,
  updateUserReviw,
  updateNotification,
  handleAddFollower,
  handleRemoveFollower,
  getSingleUserById,
  userRollUpdateWithEmail
}; 
