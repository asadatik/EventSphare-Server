require("dotenv").config();
const cron = require("node-cron");
const moment = require("moment");
const { sendEmail } = require("../../lib/SendMail");
const Event = require("../../models/Event");
const Order = require("../../models/Order");
const User = require("../../models/User");

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const { ObjectId } = require("mongodb");
const { sendReminderEmail } = require("../../lib/sendReminderEmail");

// All order get korar api
const getAllOrder = async (req, res) => {
  try {
    const allOrder = await Order.find();
    res.status(200).json(allOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get order by gmail
const getOrderById = async (req, res) => {
  const gmail = req.params.gmail;
  console.log(gmail)
  try {
    const orders = await Order.find({ eventOrganizerEmail: gmail })
    if (orders) {
      res.status(200).send(orders);
    }
    else {
      res.status(404).send({ message: "Booking Data Not Found" })
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get a user all orderd events
const myAllOrder = async (req, res) => {
  const userEmail = req.params.email;

  try {
    const query = { bookedUserEmail: userEmail }
    const allOrder = await Order.find(query)
    res.status(200).json(allOrder);
  }
  catch (error) {
    res.status(500).json({ message: error.message })
  }
}
// get a user all orderd events
const getOrganizerOrder= async (req, res) => {
  const organizerrEmail = req.params.email;

  try {
    const query = { eventOrganizerEmail: organizerrEmail }
    const allOrder = await Order.find(query)
    res.status(200).json(allOrder);
  }
  catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// refund request
const refundRequest = async (req, res) => {
  const id = req.params.id;
  console.log(id)
  const query = { _id: new ObjectId(id) }
  try {
    const resp = await Order.updateOne(
      query, {
      $set: {
        refundRequested: "Requested"
      }
    }, { upsert: false, runValidators: true })
    res.status(200).json(resp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


// create Payment
const createPayment = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { price } = req.body;
      if (!price) {
        return res.status(400).json({ error: "Price is required" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: parseInt(price * 100), // amount in cents
        currency: 'usd',
        payment_method_types: ['card'],
      });

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

const getSingleOrder = async (req, res) => {
  try {
    const { transitionId } = req.params;
    const query = { transitionId: transitionId };
    const result = await Order.findOne(query);

    if (!result) {
      return res.status(404).send({ message: "Booking data not found" });
    }

    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server Error" });
  }
};
const metricsForAdminChart = async (req, res) => {
  try {
    const events = await Event.find({});
    const orders = await Order.find({});
    const user = await User.find({ role: "organizer" });

    const metrics = {
      totalEvents: events.length,
      totalSales: orders.reduce((acc, order) => acc + order.amount, 0),
      totalTickets: orders.reduce((acc, order) => acc + order?.totalTickets, 0),
      newOrganizers: user.length// Example static data or calculate from your data
    };

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
// monthly-metrics
const monthlyMetrics = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const eventMetrics = await Event.aggregate([
      {
        $match: {
          updatedAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$updatedAt" },
          totalEvents: { $sum: 1 },
          newOrganizers: { $addToSet: "$organizer.email" }
        }
      },
      {
        $project: {
          month: "$_id",
          totalEvents: 1,
          newOrganizers: { $size: "$newOrganizers" }
        }
      },
      { $sort: { month: 1 } }
    ]);

    const orderMetrics = await Order.aggregate([
      {
        $match: {
          updatedAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$updatedAt" },
          ticketSales: { $sum: "$totalTickets" },
          totalSales: { $sum: "$amount" }
        }
      },
      {
        $project: {
          month: "$_id",
          ticketSales: 1,
          totalSales: 1
        }
      },
      { $sort: { month: 1 } }
    ]);

    // Combine the results
    const monthlyMetrics = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const eventData = eventMetrics.find(e => e.month === month) || { totalEvents: 0, newOrganizers: 0 };
      const orderData = orderMetrics.find(o => o.month === month) || { ticketSales: 0, totalSales: 0 };

      return {
        name: new Date(currentYear, i).toLocaleString('default', { month: 'short' }),
        totalEvents: eventData.totalEvents,
        newOrganizers: eventData.newOrganizers,
        ticketSales: orderData.ticketSales,
        totalSales: orderData.totalSales
      };
    });

    res.json(monthlyMetrics);
  } catch (error) {
    res.status(500).json({ message: "Error fetching monthly metrics", error: error.message });
  }
}
// payment intent
const createOrder = async (req, res) => {
  const order = req.body;
  const bookedUserEmail = req.body.bookedUserEmail;

  const {eventId,bookedUserName,eventName, eventImage,amount,totalTickets,selectSeatNames,transitionId,eventDate}=req.body
 
  const id = req.params.id

  const query = { _id: eventId };
  const events = await Event.findOne(query);

  cron.schedule("0 8 * * *", async () => {
    console.log("Checking for events tomorrow...");


    const tomorrow = moment().add(1, "day").startOf("day");

    for (const event of events) {
        const eventDate = moment(event.dateTime);

        // Check if the event is tomorrow
        if (eventDate.isSame(tomorrow, 'day')) {
            await sendReminderEmail(bookedUserEmail, eventName, event.dateTime);
        }
  }})
  
  try {
    const result = await Order.create(order)
    sendEmail(bookedUserEmail, {
      subject: "Your Order is Successfull on EventSphere !",
      message: `<!DOCTYPE html><html><head>
   <style>body{font-family:Arial,sans-serif;background-color:#f4f4f4;margin:0;padding:0;color:#333}.email-container{width:100%;max-width:600px;margin:0 auto;background-color:#fff;border:1px solid #ddd;padding:20px;border-radius:8px}.email-header{text-align:center;background-color:#007bff;padding:20px;color:#fff;border-radius:8px 8px 0 0}.email-header h1{margin:0;font-size:24px}.email-body{padding:20px}.email-body h2{color:#007bff;margin-top:0}.email-body p{line-height:1.6}.event-details{margin:20px 0;padding:15px;background-color:#f9f9f9;border-radius:6px}.event-details p{margin:5px 0}.event-image{max-width:100%;height:auto;border-radius:6px}.email-footer{text-align:center;padding:20px;background-color:#f4f4f4;color:#999;font-size:12px}.email-footer a{color:#007bff;text-decoration:none}</style>
      </head><body><div class="email-container"><div class="email-header"><h1>Hey Congratulations From EventSphere </h1></div><div class="email-body"><h2>Your Event Booking is Confirmed for the Event of ${eventName}!</h2><p>Hi ${bookedUserName},</p><p>Thank you for booking with <strong>EventSphere</strong>! We are excited to have you at our upcoming event. Below are your booking details:</p><div class="event-details"><p> <img src="${eventImage}" alt="Event Image" class="event-image">
<strong>Event Name : </strong>${eventName}</p><p><strong>Date : </strong>${eventDate}</p><p><strong>Total Tickets : </strong>${totalTickets}</p><p><strong> Select Seat Names : </strong>${selectSeatNames}</p><p><strong>TransitionId : </strong>${transitionId}</p><p><strong>Amount : </strong>${amount}</p></div><p>Please make sure to arrive at the venue at least 30 minutes before the event start time to ensure a smooth check-in process. If you have any questions, feel free to reach out to our support team.</p><p>We look forward to seeing you at the event!</p><p>Best regards,<br>The EventSphere Team</p></div><div class="email-footer"><p>&copy; 2024 EventSphere. All rights reserved.</p><p><a href="eventsphare@gmail.com">Contact Support</a></p></div></div></body></html>`
  });
    res.send({
      success: true,
      paymentResult: { insertedId: result._id },
      message: "Order created successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
}


module.exports = { getAllOrder, createOrder, getOrderById, metricsForAdminChart, monthlyMetrics, myAllOrder, refundRequest, createPayment, getSingleOrder , getOrganizerOrder, };
