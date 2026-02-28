import mongoose from 'mongoose';
import 'dotenv/config';
import User from './models/User.js';
import Issue from './models/Issue.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/civicplus';

const fakeIssues = [
  // Bengaluru
  { title: 'Deep pothole near Silk Board junction', description: 'A large pothole over 30cm deep causing accidents daily. Multiple vehicles damaged.', category: 'Pothole', lat: 12.9177, lng: 77.6233, address: 'Silk Board Junction, Bengaluru', status: 'pending' },
  { title: 'Street light not working on Koramangala 5th Block', description: 'Three consecutive street lights are out since last two weeks. Very dark at night.', category: 'Streetlight', lat: 12.9352, lng: 77.6245, address: 'Koramangala 5th Block, Bengaluru', status: 'in-progress' },
  { title: 'Garbage pile near Indiranagar metro station', description: 'Unsanitary garbage dump overflowing for 4 days. Foul smell affecting commuters.', category: 'Garbage', lat: 12.9784, lng: 77.6408, address: 'Indiranagar Metro, Bengaluru', status: 'resolved' },
  { title: 'Water pipe burst on MG Road', description: 'Major water leakage for 3 days. Road flooded, traffic disrupted.', category: 'Water Leakage', lat: 12.9767, lng: 77.6101, address: 'MG Road, Bengaluru', status: 'in-progress' },
  { title: 'Blocked drainage at BTM Layout', description: 'Stormwater drain completely blocked causing flooding during rains.', category: 'Drainage', lat: 12.9166, lng: 77.6101, address: 'BTM Layout 2nd Stage, Bengaluru', status: 'pending' },
  { title: 'Broken footpath slab at Jayanagar', description: 'Several footpath slabs missing, posing danger to pedestrians especially elderly.', category: 'Others', lat: 12.9250, lng: 77.5938, address: 'Jayanagar 4th Block, Bengaluru', status: 'resolved' },

  // Mysuru
  { title: 'Pothole on Mysore-Bengaluru highway', description: 'Multiple potholes on NH 275 causing dangerous driving conditions.', category: 'Pothole', lat: 12.3375, lng: 76.6139, address: 'NH 275, Mysuru', status: 'pending' },
  { title: 'Non-functional street lights near Mysore Palace', description: 'Lights near the main tourist attraction not working for a week.', category: 'Streetlight', lat: 12.3052, lng: 76.6552, address: 'Mysore Palace Road, Mysuru', status: 'in-progress' },

  // Mangaluru
  { title: 'Overflow garbage near Hampankatta Circle', description: 'Public dustbins overflowing near the central market area.', category: 'Garbage', lat: 12.8714, lng: 74.8431, address: 'Hampankatta Circle, Mangaluru', status: 'pending' },
  { title: 'Sewage overflow in Kadri locality', description: 'Sewage water mixing with drinking water pipelines. Health emergency.', category: 'Drainage', lat: 12.8856, lng: 74.8423, address: 'Kadri Hills, Mangaluru', status: 'in-progress' },

  // Hubballi
  { title: 'Road cave-in near Hubli station', description: 'A section of road has caved in near the railway station approach road.', category: 'Pothole', lat: 15.3647, lng: 75.1240, address: 'Railway Station Road, Hubballi', status: 'pending' },
  { title: 'Street light flickering on Lamington Road', description: 'Faulty street lights causing accidents in the evening.', category: 'Streetlight', lat: 15.3600, lng: 75.1350, address: 'Lamington Road, Hubballi', status: 'resolved' },

  // Additional Bengaluru cluster for heatmap density
  { title: 'Pothole near Whitefield ITPL gate', description: 'Large pothole at ITPL main gate causing daily traffic jam.', category: 'Pothole', lat: 12.9846, lng: 77.7271, address: 'ITPL Main Gate, Whitefield', status: 'pending' },
  { title: 'Broken street light — HSR Layout sector 5', description: 'Street light broken at a blind corner increasing road risk.', category: 'Streetlight', lat: 12.9108, lng: 77.6462, address: 'HSR Layout Sector 5, Bengaluru', status: 'in-progress' },
  { title: 'Water logging on Outer Ring Road', description: 'Persistent waterlogging after rains due to clogged storm drains near Marathahalli.', category: 'Drainage', lat: 12.9591, lng: 77.6974, address: 'Outer Ring Road, Marathahalli, Bengaluru', status: 'pending' },

  // ── Cluster test group A: Pothole cluster at Silk Board (3 reports within ~50m) ──
  { title: 'Dangerous pothole — Silk Board flyover approach', description: 'Massive pothole on the flyover approach road. Bikes swerving dangerously every morning.', category: 'Pothole', lat: 12.9179, lng: 77.6235, address: 'Silk Board Flyover, Bengaluru', status: 'pending' },
  { title: 'Giant pothole blocking left lane at Silk Board', description: 'Left lane completely blocked by a crater-sized pothole. BBMP has been notified twice but no action.', category: 'Pothole', lat: 12.9180, lng: 77.6236, address: 'Silk Board Junction, Bengaluru', status: 'pending' },

  // ── Cluster test group B: Garbage cluster at Indiranagar metro (2 reports within ~30m) ──
  { title: 'Overflowing garbage bin near Indiranagar metro entrance', description: 'The garbage bin near Gate 2 has been overflowing for 5 days. Rodents spotted near the pile.', category: 'Garbage', lat: 12.9785, lng: 77.6409, address: 'Indiranagar Metro Gate 2, Bengaluru', status: 'pending' },
  { title: 'Garbage dumped illegally beside metro pillar', description: 'Construction waste and household garbage dumped beside metro pillar 47. Blocking pedestrian footpath.', category: 'Garbage', lat: 12.9786, lng: 77.6410, address: 'Indiranagar Metro, Bengaluru', status: 'pending' },
];

const DEPT_MAP = {
  Pothole: 'Roads & Infrastructure',
  Streetlight: 'Electricity Department',
  Garbage: 'Solid Waste Management',
  Drainage: 'Water & Sanitation',
  'Water Leakage': 'Water & Sanitation',
  Others: 'General Administration',
};

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ DB connected');

  // Find or create demo citizen users (we use 2 so cluster reporters look realistic)
  let citizen = await User.findOne({ email: 'demo@citizen.com' });
  if (!citizen) {
    citizen = await User.create({
      name: 'Demo Citizen',
      email: 'demo@citizen.com',
      password: 'demo1234',
      role: 'citizen',
    });
    console.log('👤 Demo citizen created: demo@citizen.com / demo1234');
  } else {
    console.log('👤 Using existing demo citizen');
  }

  let citizen2 = await User.findOne({ email: 'demo2@citizen.com' });
  if (!citizen2) {
    citizen2 = await User.create({
      name: 'Ravi Kumar',
      email: 'demo2@citizen.com',
      password: 'demo1234',
      role: 'citizen',
    });
    console.log('👤 Demo citizen 2 created: demo2@citizen.com / demo1234');
  } else {
    console.log('👤 Using existing demo citizen 2');
  }

  // Assign alternating citizens so cluster reporters look distinct
  const citizens = [citizen, citizen2];

  let created = 0;
  for (let idx = 0; idx < fakeIssues.length; idx++) {
    const d = fakeIssues[idx];
    const exists = await Issue.findOne({ title: d.title });
    if (exists) { console.log(`  ⏩ Already exists: ${d.title}`); continue; }

    await Issue.create({
      title: d.title,
      description: d.description,
      category: d.category,
      imageUrl: '',
      photoUrl: '',
      location: {
        type: 'Point',
        coordinates: [d.lng, d.lat],
        address: d.address,
      },
      status: d.status,
      citizen: citizens[idx % 2]._id,
      assignedDepartment: DEPT_MAP[d.category],
      governmentRemarks: d.status === 'resolved' ? 'Issue resolved by department team.' : '',
      statusHistory: [
        { status: 'pending', remark: 'Issue submitted', updatedBy: citizens[idx % 2]._id },
        ...(d.status !== 'pending'
          ? [{ status: d.status, remark: `Status updated to ${d.status}`, updatedBy: citizens[idx % 2]._id }]
          : []),
      ],
    });
    console.log(`  ✅ Created: ${d.title}`);
    created++;
  }

  // ── Wire up cluster test groups ────────────────────────────────────────────
  // Group A: Pothole cluster at Silk Board (3 reports)
  const silkPrimary = await Issue.findOne({ title: 'Dangerous pothole — Silk Board flyover approach' });
  const silkMember1 = await Issue.findOne({ title: 'Giant pothole blocking left lane at Silk Board' });
  if (silkPrimary && silkMember1 && !silkPrimary.isCluster) {
    silkPrimary.isCluster = true;
    silkPrimary.clusterMembers = [silkMember1._id];
    silkPrimary.priorityScore = 1;
    await silkPrimary.save();
    silkMember1.clusterId = silkPrimary._id;
    await silkMember1.save();
    console.log('🔥 Cluster A wired: Pothole @ Silk Board (2 reports)');
  }

  // Group B: Garbage cluster at Indiranagar metro (2 reports)
  const indraPrimary = await Issue.findOne({ title: 'Overflowing garbage bin near Indiranagar metro entrance' });
  const indraMember1 = await Issue.findOne({ title: 'Garbage dumped illegally beside metro pillar' });
  if (indraPrimary && indraMember1 && !indraPrimary.isCluster) {
    indraPrimary.isCluster = true;
    indraPrimary.clusterMembers = [indraMember1._id];
    indraPrimary.priorityScore = 1;
    await indraPrimary.save();
    indraMember1.clusterId = indraPrimary._id;
    await indraMember1.save();
    console.log('🔥 Cluster B wired: Garbage @ Indiranagar (2 reports)');
  }

  console.log(`\n🎉 Seeded ${created} new issues. Total fake issues: ${fakeIssues.length}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
