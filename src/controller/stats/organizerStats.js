const Event = require("../../models/Event");
const Order = require("../../models/Order");


const getMonthYear = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  // Use Intl.DateTimeFormat to get the abbreviated month name
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(d);
  const year = d.getFullYear();

  // Return the formatted result
  return `${monthName} ${year}`;
};

// for Area Chart
const getAreaChartData = async (req, res) => {
  const { email } = req?.params;
  const query = { "contactInfo.email": email }
  try {
    // Fetch all events created by the organizer
    const totalevents =await Event.find(query)
    // Fetch all orders for the organizer's events
    const orderedEvents = await Order.find({
      eventOrganizerEmail: email,
    });

    // Group expected sales by month
    const expectedSalesByMonth = totalevents.reduce((acc, event) => {
      const month = getMonthYear(event.createdAt);
      if (!acc[month]) acc[month] = { Expected_Sale: 0 };
      acc[month].Expected_Sale += event.price;
      return acc;
    }, {});

    // Group actual sales by month
    const salesByMonth = orderedEvents.reduce((acc, order) => {
      const month = getMonthYear(order.createdAt);
      if (!month) return acc;

      if (!acc[month]) acc[month] = { Actual_Sale: 0 };
      acc[month].Actual_Sale += order.amount;
      return acc;
    }, {});

    // Merge the expected and actual sales data into one object by month
    const statsByMonth = {};
    for (let month in expectedSalesByMonth) {
      statsByMonth[month] = {
        Expected_Sale: expectedSalesByMonth[month].Expected_Sale || 0,
        Actual_Sale: salesByMonth[month] ? salesByMonth[month].Actual_Sale : 0,
      };
    }

    // Include months with only sales but no events
    for (let month in salesByMonth) {
      if (!statsByMonth[month]) {
        statsByMonth[month] = {
          Expected_Sale: 0,
          Actual_Sale: salesByMonth[month].Actual_Sale,
        };
      }
    }

    // Convert the stats into an array of objects for easy charting
    const monthlyStats = Object.keys(statsByMonth).map((month) => ({
      month,
      ...statsByMonth[month],
    }));

    // Sort the array by the month
    monthlyStats.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    res.json(monthlyStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// for pie Chart
const getPieChartData = async (req, res) => {
  const { email } = req?.params;
  const query = { "contactInfo.email": email }
  const totalevents = await Event.find(query)
  const orderedEvents = await Order.find({
    eventOrganizerEmail: email,
  });

  //   const expectedSale = totalevents.reduce((sum, data) => sum + data.price, 0);
  //   const sale = orderedEvents.reduce((sum, data) => sum + data.amount, 0);
  const data = [
    { name: "Your Total Events", value: totalevents.length },
    { name: "Your Sale Events", value: orderedEvents.length },
  ];

  res.json(data);
};

function getWeek(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

const getWaveChartData = async (req, res) => {
  const organizerrEmail = req.params.email;
  const eventDetails = await Event.find({ eventCreatorEmail: organizerrEmail });
  const orderedEvents = await Order.find({
    eventOrganizerEmail: organizerrEmail,
  });

  //   const expectedSale = totalevents.reduce((sum, data) => sum + data.price, 0);
  //   const sale = orderedEvents.reduce((sum, data) => sum + data.amount, 0);
  // Initialize accumulators for day, week, and month statistics
  const dayStats = {};
  const weekStats = {};
  const monthStats = {};

  // Loop through the events
  eventDetails.forEach((event) => {
    const date = new Date(event.createdAt);  // Assuming `saleDate` is the field when the event was sold

    // Day-based statistics
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const dayKey = `${day}/${month}/${year}`;
    if (!dayStats[dayKey]) {
      dayStats[dayKey] = 0;
    }
    dayStats[dayKey]++;

    // Week-based statistics
    const week = getWeek(date);
    const weekKey = `Week ${week} of ${year}`;
    if (!weekStats[weekKey]) {
      weekStats[weekKey] = 0;
    }
    weekStats[weekKey]++;

    // Month-based statistics
    const monthKey = `${month}/${year}`;
    if (!monthStats[monthKey]) {
      monthStats[monthKey] = 0;
    }
    monthStats[monthKey]++;
  });

  // Format the statistics data to send in the response
  const formattedDayStats = Object.entries(dayStats).map(([day, eventCount]) => ({
    day,
    eventCount,
  }));
  const formattedWeekStats = Object.entries(weekStats).map(([week, eventCount]) => ({
    week,
    eventCount,
  }));
  const formattedMonthStats = Object.entries(monthStats).map(([month, eventCount]) => ({
    month,
    eventCount,
  }));


  // Send the response with statistics for day, week, and month
  res.send({
    weekStats: formattedWeekStats.length,
    monthStats: formattedMonthStats.length,
  });
};

// for Area Chart
const getBarChartData = async (req, res) => {
  const { email } = req?.params;
  const query = { "contactInfo.email": email }
  try {

    // Fetch all orders for the organizer's events
    const orderedEvents = await Order.find({
      eventOrganizerEmail: email,
    });

   // Group actual sales by month
   const salesByMonth = orderedEvents.reduce((acc, order) => {
    const month = getMonthYear(order.createdAt);
    if (!month) return acc;

    if (!acc[month]) acc[month] = { Monthly_Sale: 0 };
    acc[month].Monthly_Sale += order.amount; // Sum the actual sale for that month
    return acc;
  }, {});

  // Convert the stats into an array of objects for easy charting
  const monthlySales = Object.keys(salesByMonth).map((month) => ({
    month,
    Monthly_Sale: salesByMonth[month].Monthly_Sale 
  }));

  // Sort the array by the month
  monthlySales.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  res.json(monthlySales);
} catch (err) {
  res.status(500).json({ message: err.message });
}
};

// / Utility function to get the start and end of the current week
const getStartAndEndOfCurrentWeek = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // Get the current day of the week (0 = Sunday, 6 = Saturday)

  // Calculate the start of the current week (previous Sunday)
  const startOfCurrentWeek = new Date(now.setDate(now.getDate() - dayOfWeek));
  startOfCurrentWeek.setHours(0, 0, 0, 0); // Set to midnight on Sunday

  const endOfCurrentWeek = new Date(startOfCurrentWeek);
  endOfCurrentWeek.setDate(startOfCurrentWeek.getDate() + 6); // End of current week (Saturday)
  endOfCurrentWeek.setHours(23, 59, 59, 999); // Last millisecond of Saturday

  return { startOfCurrentWeek, endOfCurrentWeek };
};

// Utility function to get the start and end of the previous week
const getStartAndEndOfPreviousWeek = () => {
  const { startOfCurrentWeek } = getStartAndEndOfCurrentWeek();

  const endOfPreviousWeek = new Date(startOfCurrentWeek);
  endOfPreviousWeek.setDate(startOfCurrentWeek.getDate() - 1); // End of previous week (Saturday)
  endOfPreviousWeek.setHours(23, 59, 59, 999); // Last millisecond of Saturday

  const startOfPreviousWeek = new Date(endOfPreviousWeek);
  startOfPreviousWeek.setDate(endOfPreviousWeek.getDate() - 6); // Start of previous week (Sunday)
  startOfPreviousWeek.setHours(0, 0, 0, 0); // Midnight on Sunday

  return { startOfPreviousWeek, endOfPreviousWeek };
};

// Controller function to get both current and previous week sales
const getWeeklySales = async (req, res) => {
  const organizerEmail = req.params.email;

  try {
    // Get the current week's start and end dates
    const { startOfCurrentWeek, endOfCurrentWeek } = getStartAndEndOfCurrentWeek();

    // Get the previous week's start and end dates
    const { startOfPreviousWeek, endOfPreviousWeek } = getStartAndEndOfPreviousWeek();

    // Find orders for the current week
    const currentWeekOrders = await Order.find({
      eventOrganizerEmail: organizerEmail,
      createdAt: {
        $gte: startOfCurrentWeek,  // Greater than or equal to the start of the current week
        $lte: endOfCurrentWeek,    // Less than or equal to the end of the current week
      },
    });

    // Find orders for the previous week
    const previousWeekOrders = await Order.find({
      eventOrganizerEmail: organizerEmail,
      createdAt: {
        $gte: startOfPreviousWeek,  // Greater than or equal to the start of the previous week
        $lte: endOfPreviousWeek,    // Less than or equal to the end of the previous week
      },
    });

    // Calculate total sales for the current week
    const currentWeekSales = currentWeekOrders.reduce((total, order) => {
      return total + order.amount;
    }, 0);

    // Calculate total sales for the previous week
    const previousWeekSales = previousWeekOrders.reduce((total, order) => {
      return total + order.amount;
    }, 0);

    // Send response with both current and previous week sales
    res.json({
      currentWeekSales,
      previousWeekSales,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAreaChartData, getPieChartData, getBarChartData,getWeeklySales};
