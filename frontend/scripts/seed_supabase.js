const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://svoqmezvgujbqunjtrii.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ECZKglC5auCD6sDbkbwwqA_Jplg1Wwt';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Starting Supabase Seeding...');

  await supabase.from('parking_locations').upsert({
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Grand Terminal AI Parking',
    address: '100 Metro City Boulevard, Central Plaza',
    city: 'Metropolis',
    total_floors: 3,
    total_slots: 24,
  });

  const operatorPassword = await bcrypt.hash('Operator@123', 10);
  const userPassword = await bcrypt.hash('User@123', 10);

  await supabase.from('profiles').upsert([
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      email: 'operator@aiparking.com',
      full_name: 'Chief Operator Alex',
      password_hash: operatorPassword,
      role: 'OPERATOR',
      phone: '+1 555-0199',
      vehicle_number: 'ADMIN-01',
      status: 'ACTIVE',
    },
    {
      id: 'b0000000-0000-0000-0000-000000000002',
      email: 'john@example.com',
      full_name: 'John Doe',
      password_hash: userPassword,
      role: 'USER',
      phone: '+1 555-0142',
      vehicle_number: 'NYC-4821',
      status: 'ACTIVE',
    },
  ]);

  const floors = [
    { name: 'Ground Floor', prefix: 'A' },
    { name: 'Floor 1', prefix: 'B' },
    { name: 'Floor 2', prefix: 'C' },
  ];

  const slotsToInsert = [];
  for (const floor of floors) {
    for (let i = 1; i <= 8; i++) {
      const slotNumber = `${floor.prefix}${i}`;
      let status = 'AVAILABLE';
      if (floor.prefix === 'A') {
        if ([1, 2, 4, 6, 7].includes(i)) status = 'OCCUPIED';
        else if (i === 8) status = 'RESERVED';
      }

      slotsToInsert.push({
        slot_number: slotNumber,
        floor: floor.name,
        vehicle_type: i === 7 ? 'EV' : i === 8 ? 'BIKE' : 'CAR',
        price_per_hour: i === 7 ? 7.50 : i === 8 ? 2.50 : 5.00,
        status,
        location_id: 'a0000000-0000-0000-0000-000000000001',
      });
    }
  }

  await supabase.from('parking_slots').upsert(slotsToInsert, { onConflict: 'slot_number,floor' });
  console.log('Supabase database seeded with 24 slots and demo profiles!');
}

seed().catch(console.error);
