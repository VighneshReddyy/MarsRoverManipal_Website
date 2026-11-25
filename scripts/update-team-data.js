const fs = require('fs');

// 1. Update lib/alumni.json
const alumniPath = 'lib/alumni.json';
const alumni = JSON.parse(fs.readFileSync(alumniPath, 'utf8'));

if (!alumni['2026']) {
  alumni['2026'] = [];
}

const seniorResearchersToAlumni = [
  {
    id: 101,
    name: 'Siddharth Penumatsa',
    img: '',
    pos: 'Senior Researcher',
    linkedin: 'https://www.linkedin.com/in/siddharth-penumatsa-967464280/',
    github: '',
    domain: 'Research',
    description: 'VLSI Design Engineer, Researcher',
    year: '2026'
  },
  {
    id: 102,
    name: 'Dhrumil Bhatt',
    img: 'https://drive.google.com/file/d/1H76ZWWJsX54zbELggBuf37xmBEBx-vkn/view?usp=sharing',
    pos: 'Senior Researcher',
    linkedin: 'https://www.linkedin.com/in/dhrumilbhatt26',
    github: '',
    domain: 'Research',
    description: 'Electrical and Electronics Engineer, Researcher',
    year: '2026'
  },
  {
    id: 103,
    name: 'Aadiv Rath',
    img: 'https://drive.google.com/file/d/1M7r0Un635ivC2VjwYA5WDM1H0gxHIYyY/view?usp=sharing',
    pos: 'Senior Researcher',
    linkedin: 'https://www.linkedin.com/in/aadivrath/',
    github: '',
    domain: 'Research',
    description: 'Machine Learning and AI Researcher',
    year: '2026'
  },
  {
    id: 104,
    name: 'Aditya Naidu',
    img: 'https://drive.google.com/file/d/1TYLmiaRufc09GpJdYFBh87OYDwxaL5k8/view?usp=drive_link',
    pos: 'Senior Researcher',
    linkedin: 'https://www.linkedin.com/in/aditya-naidu-7620232a7/',
    github: 'https://github.com/adityaX1412',
    domain: 'Research',
    description: 'Machine Learning and AI Researcher',
    year: '2026'
  }
];

// Ensure no duplicates in 2026 alumni
for (const sr of seniorResearchersToAlumni) {
  const existingIdx = alumni['2026'].findIndex(m => m.name.toLowerCase() === sr.name.toLowerCase());
  if (existingIdx !== -1) {
    alumni['2026'][existingIdx] = sr;
  } else {
    alumni['2026'].push(sr);
  }
}

fs.writeFileSync(alumniPath, JSON.stringify(alumni, null, 2));
console.log('Updated lib/alumni.json with 2026 Senior Researchers. Total 2026:', alumni['2026'].length);

// 2. Update cached_sheets.json
const sheetsPath = 'cached_sheets.json';
const sheets = JSON.parse(fs.readFileSync(sheetsPath, 'utf8'));

// Board restructuring
sheets['Board'] = [
  {
    name: 'Sanjana Puranik',
    'link to image': 'https://drive.google.com/file/d/1GWFqUZHWWTQCEBkUoZgAQkjTK8HFpIx4/view?usp=sharing',
    year: '2025-2026',
    position: 'Team Lead',
    description: '',
    expertise: '',
    linkedin: 'https://www.linkedin.com/in/sanjana-puranik-217766227/',
    github: '',
    'website ( others )': ''
  },
  {
    name: 'Sanchit',
    'link to image': 'https://drive.google.com/file/d/13zPqbIbVB944pGnHEtWN1pF0ZMMk6lxy/view?usp=sharing',
    year: '2025-2026',
    position: 'Team Manager & Head of Mechanical Design and Manufacturing',
    description: '',
    expertise: '',
    linkedin: 'https://www.linkedin.com/in/sai-sanchit-m-j-117763345',
    github: '',
    'website ( others )': ''
  },
  {
    name: 'Dhruv Shankar Banerjee',
    'link to image': 'https://drive.google.com/file/d/1gcDwhbcPIa066XQDEOp4MxFScpavu0Zi/view?usp=sharing',
    year: '2025-2026',
    position: 'Head of Operations',
    description: '',
    expertise: '',
    linkedin: '',
    github: '',
    'website ( others )': ''
  },
  {
    name: 'Vighnesh Reddy',
    'link to image': 'https://drive.google.com/file/d/1STQmamRDzsbvYB0O8tP-it6BczrKjf9L/view?usp=drivesdk',
    year: '2025-2026',
    position: 'Head of AI & Automation',
    description: '',
    expertise: '',
    linkedin: 'https://www.linkedin.com/in/vighnesh-reddy-satti-402172321/',
    github: 'https://github.com/VighneshReddyy',
    'website ( others )': ''
  },
  {
    name: 'Shreya Agarwal',
    'link to image': 'https://drive.google.com/file/d/1pHOXp-TK7xH1quur5pxDLUfcJMVjvLPp/view?usp=sharing',
    year: '2025-2026',
    position: 'Head of Life Sciences',
    description: '',
    expertise: '',
    linkedin: 'https://www.linkedin.com/in/shreya-agarwal-b0b236321',
    github: '',
    'website ( others )': ''
  },
  {
    name: 'Anakha Kurup',
    'link to image': '',
    year: '2025-2026',
    position: 'Head of Research',
    description: '',
    expertise: '',
    linkedin: 'https://www.linkedin.com/in/anakha-k-041542397',
    github: '',
    'website ( others )': ''
  }
];

// Senior Team Members
sheets['Senior team'] = [
  {
    name: 'Sarath',
    'link to image': 'https://drive.google.com/file/d/1nIMZw0CkulF9I81Xi_jxcg76nXb4Xu0c/view?usp=drive_link',
    year: '2025-2026',
    position: 'Senior Team Member',
    description: '',
    expertise: '',
    linkedin: 'https://www.linkedin.com/in/saisarath-krishnan-5293b8386',
    github: 'https://github.com/Saisarathkrishnan',
    'website ( others )': ''
  },
  {
    name: 'Anish',
    'link to image': 'https://drive.google.com/file/d/1A24N_JnzzbPNEi1c6fxjJd17R21IbDOt/view?usp=sharing',
    year: '2025-2026',
    position: 'Senior Team Member',
    description: '',
    expertise: '',
    linkedin: '',
    github: '',
    'website ( others )': ''
  },
  {
    name: 'Vishwant',
    'link to image': 'https://drive.google.com/file/d/1cPW1qVRYcdES6wT_0S0wC9Sca8XqXU4j/view?usp=drivesdk',
    year: '2025-2026',
    position: 'Senior Team Member',
    description: '',
    expertise: '',
    linkedin: '',
    github: '',
    'website ( others )': ''
  }
];

// Research Team (All promoted to Senior Researcher, no duplicates)
sheets['Research'] = [
  {
    name: 'Siddhanth Methil',
    'link to image': 'https://drive.google.com/file/d/1wl3p5hQEchRUBMjYQwxI1EHj3j_3xNeq/view?usp=drivesdk',
    year: '2025-26',
    position: 'Senior Researcher',
    description: '',
    expertise: '',
    linkedin: 'https://www.linkedin.com/in/siddhanth-methil/',
    github: 'https://github.com/hexager',
    'website ( others )': ''
  },
  {
    name: 'Bhagyesh Kumar',
    'link to image': '',
    year: '2025-26',
    position: 'Senior Researcher',
    description: '',
    expertise: '',
    linkedin: 'https://www.linkedin.com/in/invi-bhagyesh',
    github: 'https://github.com/invi-bhagyesh',
    'website ( others )': ''
  },
  {
    name: 'Akshat Satyanarayan',
    'link to image': '',
    year: '2025-26',
    position: 'Senior Researcher',
    description: '',
    expertise: '',
    linkedin: 'https://www.linkedin.com/in/akshat-satyanarayan-111410378/',
    github: 'https://github.com/akshat652256',
    'website ( others )': ''
  },
  {
    name: 'Sarayu Madakasira',
    'link to image': 'https://drive.google.com/file/d/1-lkLUELy9ia2c9Wl_ssKP7G3cNI-eLT1/view?usp=sharing',
    year: '2025-26',
    position: 'Senior Researcher',
    description: '',
    expertise: '',
    linkedin: 'https://www.linkedin.com/in/sarayu-madakasira/',
    github: 'https://github.com/MSarayu512',
    'website ( others )': ''
  },
  {
    name: 'Vidushi Kumar',
    'link to image': '',
    year: '2025-26',
    position: 'Senior Researcher',
    description: '',
    expertise: '',
    linkedin: 'https://www.linkedin.com/in/vidushikumar19/',
    github: '',
    'website ( others )': ''
  },
  {
    name: 'Siddharth',
    'link to image': 'https://drive.google.com/file/d/1kmzXgpHBSGjzPElx4OvbfX-rMcns2TqF/view?usp=drive_link',
    year: '2025-26',
    position: 'Senior Researcher',
    description: '',
    expertise: '',
    linkedin: 'https://www.linkedin.com/in/siddharth-724ab0246/',
    github: 'https://github.com/machinenirvanaa',
    'website ( others )': ''
  }
];

fs.writeFileSync(sheetsPath, JSON.stringify(sheets, null, 2));
console.log('Updated cached_sheets.json successfully.');
