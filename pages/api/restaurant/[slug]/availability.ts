import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { times } from '../../../../data'
// import { findAvailabileTables } from "../../../../services/restaurant/findAvailableTables";

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { slug, day, time, partySize } = req.query as {
      slug: string
      day: string
      time: string
      partySize: string
    }

    if (!day || !time || !partySize) {
      return res.status(400).json({
        errorMessage: 'Invalid data provided',
      })
    }

    const searchTimes = times.find((t) => {
      return t.time === time
    })?.searchTimes

    if (!searchTimes) {
      return res.status(400).json({
        errorMessage: 'Invalid data provided',
      })
    }

    const bookings = await prisma.booking.findMany({
      where: {
        booking_time: {
          gte: new Date(`${day}T${searchTimes[0]}`), // ilk zaman
          lte: new Date(`${day}T${searchTimes[searchTimes.length - 1]}`), // son zaman (ilk ve son zaman arasındaki müsait table aranacak)
        },
      },
      select: {
        number_of_people: true,
        booking_time: true,
        tables: true,
      },
    })

    // öğrenci kodu for  bag fixed
    /*         bookings.forEach((booking) => {
    let str = booking.booking_time.toISOString();
    if (bookingsLookup[str]) {
      bookingsLookup[str] = {
        ...bookingsLookup[str],
        ...booking.tables.reduce((acc, curr) => {
          return { ...acc, [curr.table_id]: true };
        }, {}),
      };
    } else {
      bookingsLookup[str] = booking.tables.reduce((acc, curr) => {
        return { ...acc, [curr.table_id]: true };
      }, {});
    }
  }); */

    const bookingTableObj: { [key: string]: { [key: number]: true } } = {}

    bookings.forEach((booking) => {
      bookingTableObj[booking.booking_time.toISOString()] =
        booking.tables.reduce((obj, table) => {
          return {
            ...obj,
            [table.table_id]: true,
          }
        }, {})
    })

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        slug,
      },
      select: {
        tables: true,
        open_time: true,
        close_time: true,
      },
    })

    if (!restaurant) {
      return res.status(400).json({
        errorMessage: 'Invalid data provided',
      })
    }

    const tables = restaurant.tables

    const searchTimesWithTables = searchTimes.map((searchTime) => {
      return {
        date: new Date(`${day}T${searchTime}`),
        time: searchTime,
        tables,
      }
    })

    if (!searchTimesWithTables) {
      return res.status(400).json({
        errorMessage: 'Invalid data provided',
      })
    }

    searchTimesWithTables.forEach((t) => {
      t.tables = t.tables.filter((table) => {
        if (bookingTableObj[t.date.toISOString()]) {
          if (bookingTableObj[t.date.toISOString()][table.id]) return false
        }
        return true
      })
    })

    const availabilities = searchTimesWithTables
      .map((t) => {
        const sumSeats = t.tables.reduce((sum, table) => {
          return sum + table.seats
        }, 0)
        return {
          time: t.time,
          available: sumSeats >= parseInt(partySize),
        }
      })
      .filter((availability) => {
        const timeIsAfterOpeningHour =
          new Date(`${day}T${availability.time}`) >=
          new Date(`${day}T${restaurant.open_time}`)
        const timeIsBeforeClosingHour =
          new Date(`${day}T${availability.time}`) <=
          new Date(`${day}T${restaurant.close_time}`)

        return timeIsAfterOpeningHour && timeIsBeforeClosingHour
      })

    return res.json(
      availabilities
    )
  }
}

// http://localhost:3000/api/restaurant/vivaan-fine-indian-cuisine-ottawa/availability?day=2023-02-03&time=15:00:00.000Z&partySize=8

// örnek olarak  kullanıcaz ===> vivaan-fine-indian-cuisine-ottawa  (en üstte 3 adet daha ekledim.)











// const searchTimesWithTables = await findAvailabileTables({
//   day,
//   time,
//   res,
//   restaurant,
// });

// if (!searchTimesWithTables) {
//   return res.status(400).json({
//     errorMessage: "Invalid data provided",
//   });
// }

// const availabilities = searchTimesWithTables
//   .map((t) => {
//     const sumSeats = t.tables.reduce((sum, table) => {
//       return sum + table.seats;
//     }, 0);

//     return {
//       time: t.time,
//       available: sumSeats >= parseInt(partySize),
//     };
//   })
// .filter((availability) => {
//   const timeIsAfterOpeningHour =
//     new Date(`${day}T${availability.time}`) >=
//     new Date(`${day}T${restaurant.open_time}`);
//   const timeIsBeforeClosingHour =
//     new Date(`${day}T${availability.time}`) <=
//     new Date(`${day}T${restaurant.close_time}`);

//   return timeIsAfterOpeningHour && timeIsBeforeClosingHour;
// });


