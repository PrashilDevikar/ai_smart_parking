const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo accounts...');

  const operatorPassword = await bcrypt.hash('Operator@123', 10);
  const userPassword = await bcrypt.hash('User@123', 10);

  // 1. Create or update operator
  await prisma.user.upsert({
    where: { email: 'operator@aiparking.com' },
    update: { password: operatorPassword, role: 'OPERATOR', status: 'ACTIVE' },
    create: {
      email: 'operator@aiparking.com',
      password: operatorPassword,
      fullName: 'Facility Operator',
      phone: '+1 555 0199',
      role: 'OPERATOR',
      status: 'ACTIVE',
    },
  });

  // 2. Create or update customer
  await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: { password: userPassword, role: 'USER', status: 'ACTIVE' },
    create: {
      email: 'john@example.com',
      password: userPassword,
      fullName: 'John Doe',
      phone: '+1 555 0142',
      vehicleNumber: 'NYC-4821',
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  // 3. Create Parking Location
  let loc = await prisma.parkingLocation.findFirst();
  if (!loc) {
    loc = await prisma.parkingLocation.create({
      data: {
        name: 'Grand Terminal Parking Complex',
        address: '100 Innovation Boulevard, Tech District',
        city: 'New York',
        totalFloors: 3,
        totalSlots: 24,
      },
    });
  }

  // 4. Create Slots (24 slots across 3 floors)
  const floors = ['Ground Floor', 'Floor 1', 'Floor 2'];
  const prefixes = ['A', 'B', 'C'];

  for (let f = 0; f < floors.length; f++) {
    const floor = floors[f];
    const prefix = prefixes[f];
    for (let i = 1; i <= 8; i++) {
      const slotNum = `${prefix}${i}`;
      const existing = await prisma.parkingSlot.findUnique({
        where: { slotNumber: slotNum },
      });
      if (!existing) {
        let vType = 'CAR';
        if (i === 7) vType = 'BIKE';
        if (i === 8) vType = 'EV';

        let initStatus = 'AVAILABLE';
        if (prefix === 'A' && [1, 2, 4, 6].includes(i)) initStatus = 'OCCUPIED';
        if (prefix === 'A' && i === 7) initStatus = 'RESERVED';

        await prisma.parkingSlot.create({
          data: {
            slotNumber: slotNum,
            floor,
            vehicleType: vType,
            status: initStatus,
            pricePerHour: vType === 'EV' ? 7.5 : vType === 'BIKE' ? 3.0 : 5.0,
            locationId: loc.id,
          },
        });
      }
    }
  }

  console.log('? Demo accounts & 24 parking slots created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
