const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Supabase PostgreSQL database...');

  // 1. Create Location
  const location = await prisma.parkingLocation.upsert({
    where: { id: 'loc-grand-terminal-1' },
    update: {},
    create: {
      id: 'loc-grand-terminal-1',
      name: 'Grand Terminal AI Parking',
      address: '100 Metro City Boulevard, Central Plaza',
      totalSlots: 24,
    },
  });

  // 2. Create Users
  const operatorPassword = await bcrypt.hash('Operator@123', 10);
  const userPassword = await bcrypt.hash('User@123', 10);

  const operator = await prisma.user.upsert({
    where: { email: 'operator@aiparking.com' },
    update: { passwordHash: operatorPassword },
    create: {
      fullName: 'Chief Operator Alex',
      email: 'operator@aiparking.com',
      passwordHash: operatorPassword,
      role: 'OPERATOR',
      phone: '+1 555-0199',
      vehicleNumber: 'ADMIN-01',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: { passwordHash: userPassword },
    create: {
      fullName: 'John Doe',
      email: 'john@example.com',
      passwordHash: userPassword,
      role: 'USER',
      phone: '+1 555-0142',
      vehicleNumber: 'NYC-4821',
    },
  });

  // 3. Create 24 Slots (8 per floor)
  const floors = [
    { name: 'Ground Floor', prefix: 'A' },
    { name: 'Floor 1', prefix: 'B' },
    { name: 'Floor 2', prefix: 'C' },
  ];

  for (const floor of floors) {
    for (let i = 1; i <= 8; i++) {
      const slotNumber = `${floor.prefix}${i}`;
      let status = 'AVAILABLE';
      if (floor.prefix === 'A') {
        if ([1, 2, 4, 6, 7].includes(i)) status = 'OCCUPIED';
        else if (i === 8) status = 'RESERVED';
      }

      await prisma.parkingSlot.upsert({
        where: { id: `slot-${slotNumber}` },
        update: { status },
        create: {
          id: `slot-${slotNumber}`,
          slotNumber,
          floor: floor.name,
          vehicleType: i === 7 ? 'EV' : i === 8 ? 'BIKE' : 'CAR',
          pricePerHour: i === 7 ? 7.5 : i === 8 ? 2.5 : 5.0,
          status,
          locationId: location.id,
        },
      });
    }
  }

  // 4. Create Initial Bookings
  const now = new Date();
  await prisma.booking.create({
    data: {
      userId: customer.id,
      slotId: 'slot-A8',
      startTime: now,
      endTime: new Date(now.getTime() + 2 * 3600 * 1000),
      duration: 2,
      amount: 10.0,
      vehicleNumber: 'NYC-4821',
      status: 'ACTIVE',
      paymentStatus: 'PAID',
    },
  }).catch(() => {});

  console.log('✅ Supabase database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });