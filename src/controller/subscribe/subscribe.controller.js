const Card = require('../../models/subscribe');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createSubscribeStripe = async (req, res) => {
    if (req.method === 'POST') {
      try {
        const {price}  = req.body;
        console.log("Received Price:", price);
        if (!price) {
          return res.status(400).json({ error: "Price is required" });
        }
  
        const paymentIntent = await stripe.paymentIntents.create({
          amount: parseInt(price * 100), // amount in cents
          currency: 'usd',
          payment_method_types: ['card'],
        });
  
        console.log("Payment Intent:", paymentIntent);
  
        res.status(200).json({
          clientSecret: paymentIntent.client_secret,
          success: true,
          message: "Payment intent created successfully",
        });
      } catch (error) {
        console.error("Payment Intent Error:", error.message);
        res.status(500).json({ error: error.message });
      }
    } else {
      res.setHeader('Allow', 'POST');
      res.status(405).end('Method Not Allowed');
    }
  };
  

  const createSubscribe = async (req, res) => {
    const subscribeInfo = req.body;
    const id = req.params.id;
    console.log(id);
    console.log(subscribeInfo, "subscribeInfo");
  
    try {
      const result = await Card.create(subscribeInfo);
      res.send({
        success: true,
        paymentResult: { insertedId: result._id },
        message: "subscribe successfully",
      });
    } catch (error) {
      if (error.code === 11000) {
        res.send({
          success: false,
          message: "This coupon already exists.",
        });
      } else {
        res.send({
          success: false,
          message: error.message,
        });
      }
    }
  };

  const getSingleSubscribe = async (req, res) => {
    try {
      const { transitionId } = req.params;
    //   console.log(transitionId)
      const query = { transitionId: transitionId };
      const result = await Card.findOne(query);
  
      if (!result) {
        return res.status(404).send({ message: "Subscribe data not found" });
      }
  
      res.send(result);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Server Error" });
    }
  };
  
  module.exports = {  createSubscribe,  createSubscribeStripe, getSingleSubscribe };