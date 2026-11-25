const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'photos');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const photoSources = [
  {
    src: 'mrm2021/public/urc2024/team.jpg',
    dest: 'urc2024-team.jpg',
    title: 'University Rover Challenge 2024 Team',
    category: 'Competitions',
    location: 'Hanksville, Utah, USA',
    year: '2024',
    description: 'Mars Rover Manipal team members at the Mars Desert Research Station in Hanksville, Utah.'
  },
  {
    src: 'mrm2021/public/urc2024/urc2024.jpg',
    dest: 'urc2024-rover-desert.jpg',
    title: 'Rover on Martian Terrain - URC 2024',
    category: 'Competitions',
    location: 'Mars Desert Research Station, Utah',
    year: '2024',
    description: 'Autonomous navigation mission traversal in extreme rocky desert conditions.'
  },
  {
    src: 'mrm2021/public/urc2024/rdo1.jpg',
    dest: 'urc2024-rdo1.jpg',
    title: 'Autonomous Navigation Field Run',
    category: 'Field Testing',
    location: 'Hanksville, Utah',
    year: '2024',
    description: 'Autonomous waypoint navigation and obstacle detection in full daylight mission testing.'
  },
  {
    src: 'mrm2021/public/urc2024/rdo2.jpg',
    dest: 'urc2024-rdo2.jpg',
    title: 'Extreme Terrain Rock Crawling',
    category: 'Field Testing',
    location: 'Hanksville, Utah',
    year: '2024',
    description: 'Testing the 5-bar passive suspension system over boulder-strewn Martian analog hills.'
  },
  {
    src: 'mrm2021/public/urc2024/esm1.jpg',
    dest: 'urc2024-robotic-arm.jpg',
    title: 'Robotic Manipulator Arm In Action',
    category: 'Rover Engineering',
    location: 'MDRS, Utah',
    year: '2024',
    description: 'Inverse kinematics control of the 6-DOF robotic manipulator for equipment servicing.'
  },
  {
    src: 'mrm2021/public/urc2024/esm2.jpg',
    dest: 'urc2024-equipment-servicing.jpg',
    title: 'Precision Control Task - Panel Servicing',
    category: 'Competitions',
    location: 'MDRS, Utah',
    year: '2024',
    description: 'Fine manipulator operations pressing buttons, flipping switches, and inserting connectors.'
  },
  {
    src: 'mrm2021/public/urc2024/sm.jpg',
    dest: 'urc2024-science-module.jpg',
    title: 'Life Detection Science Payload',
    category: 'Rover Engineering',
    location: 'On-Board Laboratory',
    year: '2024',
    description: 'Subsurface soil excavation and automated chemical assay testing for biomarkers.'
  },
  {
    src: 'mrm2021/public/urc2024/bike.jpg',
    dest: 'urc2024-delivery-payload.jpg',
    title: 'Delivery & Retrieval Payload',
    category: 'Field Testing',
    location: 'Utah Analog Proving Grounds',
    year: '2024',
    description: 'Deployment and secure cargo delivery across unmapped GPS waypoints.'
  },
  {
    src: 'mrm2021/public/comp/ercteam22.webp',
    dest: 'erc2022-team-poland.webp',
    title: 'ERC 2022 Team - 2nd Worldwide',
    category: 'Competitions',
    location: 'Kielce, Poland',
    year: '2022',
    description: 'MRM securing 2nd place worldwide at the European Rover Challenge remote finals.'
  },
  {
    src: 'mrm2021/public/comp/ERC_TEAM.webp',
    dest: 'erc2021-podium.webp',
    title: 'European Rover Challenge Presentation',
    category: 'Competitions',
    location: 'Krakow, Poland',
    year: '2021',
    description: 'Best performing team award in the ERC presentation and systems engineering task.'
  },
  {
    src: 'mrm2021/public/irc/irc2024.jpg',
    dest: 'irc2024-first-place.jpg',
    title: 'IRC 2024 - 1st Place Champions',
    category: 'Competitions',
    location: 'PSG Tech, Coimbatore',
    year: '2024',
    description: 'MRM champions holding the 1st Place trophy among 25 international qualifiers at IRC 2024.'
  },
  {
    src: 'mrm2021/public/urc2022/urc2022-3.webp',
    dest: 'urc2022-field-test.webp',
    title: 'High-Altitude Desert Testing',
    category: 'Field Testing',
    location: 'Mars Desert Research Station',
    year: '2022',
    description: 'Long-range 5.8 GHz communication link test across canyon ridge lines.'
  },
  {
    src: 'mrm2021/public/urc2022/urc2022-5.webp',
    dest: 'urc2022-science-award.webp',
    title: 'John Barainca Science Award',
    category: 'Competitions',
    location: 'MDRS, Utah',
    year: '2022',
    description: 'Winning the prestigious John Barainca Award for best science team worldwide.'
  },
  {
    src: 'mrm2021/public/urc2022/urc2022-6.webp',
    dest: 'urc2022-rover-habitat.webp',
    title: 'Rover in Front of the MDRS Habitat',
    category: 'Competitions',
    location: 'MDRS Habitat, Utah',
    year: '2022',
    description: 'The team rover parked outside the iconic Mars Desert Research Station habitat module.'
  },
  {
    src: 'mrm2021/public/Photos19/7.jpg',
    dest: 'photos19-quarry-test.jpg',
    title: 'Quarry Field Trials',
    category: 'Field Testing',
    location: 'Manipal, India',
    year: '2019',
    description: 'Full-day stress testing of rocker-bogie differential and motor drivers in rugged local quarries.'
  },
  {
    src: 'mrm2021/public/Photos19/6.jpg',
    dest: 'photos19-night-test.jpg',
    title: 'Night Operation & Telemetry Run',
    category: 'Field Testing',
    location: 'Field Site Alpha',
    year: '2019',
    description: 'Night vision sensors, floodlight illumination, and remote command base station testing.'
  },
  {
    src: 'mrm2021/public/photos-urc2021/grp_1.jpg',
    dest: 'urc2021-team-assembly.jpg',
    title: 'MRM Team Full Assembly',
    category: 'Team',
    location: 'MRM Lab, MIT Manipal',
    year: '2021',
    description: 'The multidisciplinary rover engineering team during the URC 2021 mission phase.'
  },
  {
    src: 'mrm2021/public/photos-urc2021/rover_1.jpg',
    dest: 'urc2021-rover-studio.jpg',
    title: 'Integrated Rover System',
    category: 'Rover Engineering',
    location: 'MAHE Robotics Facility',
    year: '2021',
    description: 'Fully integrated chassis with custom carbon-fiber electronics enclosure and manipulator.'
  },
  {
    src: 'mrm2021/public/photos20/Rover autonomous.webp',
    dest: 'photos20-rover-autonomous.webp',
    title: 'Autonomous Navigation Field Assay',
    category: 'Field Testing',
    location: 'Outdoor Testing Facility',
    year: '2020',
    description: 'Testing LiDAR mapping, stereo vision, and path-planning algorithms.'
  },
  {
    src: 'mrm2021/public/photos20/PCB Power.webp',
    dest: 'photos20-pcb-power.webp',
    title: 'Power Distribution & BMS Board',
    category: 'Rover Engineering',
    location: 'Electronics & Control Lab',
    year: '2020',
    description: 'Custom-designed power management board with overcurrent protection and telemetry sensors.'
  },
  {
    src: 'mrm2021/public/photos20/team.webp',
    dest: 'photos20-team-photo.webp',
    title: 'Mars Rover Manipal Team 2020',
    category: 'Team',
    location: 'Student Activity Centre, Manipal',
    year: '2020',
    description: 'MRM subsystem leads and engineers following 7th worldwide SAR results in URC 2020.'
  }
];

const copiedList = [];

for (const p of photoSources) {
  const fullSrc = path.join(__dirname, '..', p.src);
  const fullDest = path.join(targetDir, p.dest);
  if (fs.existsSync(fullSrc)) {
    fs.copyFileSync(fullSrc, fullDest);
    copiedList.push({
      id: p.dest.replace(/\.[^.]+$/, ''),
      src: `/photos/${p.dest}`,
      title: p.title,
      category: p.category,
      location: p.location,
      year: p.year,
      description: p.description
    });
    console.log(`Copied ${p.src} -> /photos/${p.dest}`);
  } else {
    console.warn(`Source not found: ${fullSrc}`);
  }
}

const tsContent = `export interface PhotoItem {
  id: string
  src: string
  title: string
  category: "Competitions" | "Field Testing" | "Rover Engineering" | "Team"
  location: string
  year: string
  description: string
}

export const galleryPhotos: PhotoItem[] = ${JSON.stringify(copiedList, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '..', 'lib', 'photos-data.ts'), tsContent);
console.log(`Generated lib/photos-data.ts with ${copiedList.length} photos.`);
