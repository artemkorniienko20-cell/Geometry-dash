import { Level, LevelData } from './Level';
import { ObjectType } from './GameObject';

type LevelBuilder = {
  objects: LevelData['objects'];
  addBlock: (x: number, y: number) => void;
  addHalfBlock: (x: number, y: number) => void;
  addSpike: (x: number, y: number, rotation?: number) => void;
  addHalfSpike: (x: number, y: number, rotation?: number) => void;
  addOrb: (type: ObjectType, x: number, y: number) => void;
  addPad: (type: ObjectType, x: number, y: number) => void;
  addPortal: (type: ObjectType, x: number, y: number) => void;
  addCoin: (x: number, y: number) => void;
  addEnd: (x: number) => void;
};

function createBuilder(): LevelBuilder {
  const objects: LevelData['objects'] = [];
  return {
    objects,
    addBlock: (x, y) => objects.push({ type: ObjectType.BLOCK, x, y }),
    addHalfBlock: (x, y) => objects.push({ type: ObjectType.HALF_BLOCK, x, y }),
    addSpike: (x, y, rotation = 0) => objects.push({ type: ObjectType.SPIKE, x, y, rotation }),
    addHalfSpike: (x, y, rotation = 0) => objects.push({ type: ObjectType.HALF_SPIKE, x, y, rotation }),
    addOrb: (type, x, y) => objects.push({ type, x, y }),
    addPad: (type, x, y) => objects.push({ type, x, y }),
    addPortal: (type, x, y) => objects.push({ type, x, y }),
    addCoin: (x, y) => objects.push({ type: ObjectType.COIN, x, y }),
    addEnd: (x) => objects.push({ type: ObjectType.END_TRIGGER, x, y: 0, width: 40, height: 400 })
  };
}

// 1. STEREO MADNESS (Easy - 1★ - 130 BPM)
export function createStereoMadnessLevel(): Level {
  const b = createBuilder();
  b.addSpike(450, 0);
  b.addSpike(750, 0);
  b.addSpike(780, 0);

  b.addBlock(1050, 0);
  b.addBlock(1080, 0);
  b.addBlock(1110, 0);
  b.addSpike(1140, 0);

  b.addSpike(1350, 0);
  b.addSpike(1380, 0);
  b.addOrb(ObjectType.ORB_YELLOW, 1365, 60);

  b.addPad(ObjectType.PAD_YELLOW, 1600, 0);
  b.addBlock(1750, 90);
  b.addBlock(1780, 90);
  b.addBlock(1810, 90);
  b.addCoin(1780, 140);

  b.addSpike(1950, 0);
  b.addSpike(1980, 0);
  b.addSpike(2010, 0);

  // Ракета
  b.addPortal(ObjectType.PORTAL_SHIP, 2250, 30);
  for (let x = 2220; x <= 3650; x += 30) b.addBlock(x, 210);
  b.addBlock(2600, 0);
  b.addBlock(2600, 30);
  b.addSpike(2600, 60);
  b.addBlock(2900, 150);
  b.addBlock(2900, 180);
  b.addSpike(2900, 120, 180);
  b.addBlock(3200, 0);
  b.addBlock(3200, 30);
  b.addBlock(3200, 60);
  b.addCoin(3350, 110);

  // Куля
  b.addPortal(ObjectType.PORTAL_BALL, 3700, 30);
  for (let x = 3800; x <= 5000; x += 30) b.addBlock(x, 150);
  b.addSpike(4000, 0);
  b.addSpike(4250, 120, 180);
  b.addSpike(4500, 0);
  b.addSpike(4750, 120, 180);

  // НЛО
  b.addPortal(ObjectType.PORTAL_UFO, 5100, 30);
  b.addPortal(ObjectType.PORTAL_SPEED_FAST, 5200, 30);
  b.addBlock(5450, 0);
  b.addBlock(5450, 30);
  b.addBlock(5450, 180);
  b.addBlock(5450, 210);
  b.addBlock(5750, 0);
  b.addBlock(5750, 60);
  b.addBlock(5750, 210);
  b.addBlock(5750, 240);

  // Хвиля
  b.addPortal(ObjectType.PORTAL_WAVE, 6300, 60);
  for (let x = 6270; x <= 7730; x += 30) b.addBlock(x, 240);
  b.addSpike(6600, 0);
  b.addSpike(6800, 210, 180);
  b.addSpike(7000, 0);
  b.addSpike(7200, 210, 180);
  b.addCoin(7350, 100);
  b.addSpike(7450, 0);

  // Фініш
  b.addPortal(ObjectType.PORTAL_CUBE, 7700, 30);
  b.addPortal(ObjectType.PORTAL_SPEED_NORMAL, 7750, 30);
  b.addBlock(7850, 0);
  b.addPad(ObjectType.PAD_YELLOW, 7850, 30);
  b.addBlock(8000, 90);
  b.addBlock(8030, 90);
  b.addBlock(8060, 90);
  b.addEnd(8300);

  return new Level({
    id: 'stereo_madness',
    name: 'Stereo Madness',
    creator: 'RobTop',
    difficulty: 'Easy',
    stars: 1,
    bpm: 130,
    length: 8600,
    bgColor: '#0a0f1d',
    groundColor: '#001a2b',
    objects: b.objects
  });
}

// 2. BACK ON TRACK (Normal - 2★ - 135 BPM)
export function createBackOnTrackLevel(): Level {
  const b = createBuilder();
  b.addSpike(400, 0);
  b.addBlock(650, 0);
  b.addPad(ObjectType.PAD_YELLOW, 650, 30);
  b.addBlock(850, 90);
  b.addBlock(880, 90);
  b.addSpike(880, 120);
  b.addBlock(910, 90);

  b.addPad(ObjectType.PAD_YELLOW, 1150, 0);
  b.addSpike(1240, 0);
  b.addSpike(1270, 0);
  b.addSpike(1300, 0);

  b.addBlock(1450, 30);
  b.addOrb(ObjectType.ORB_PINK, 1550, 70);
  b.addBlock(1650, 60);
  b.addBlock(1680, 60);
  b.addCoin(1680, 110);

  b.addSpike(1850, 0);
  b.addSpike(1880, 0);
  b.addOrb(ObjectType.ORB_YELLOW, 1865, 50);

  b.addPortal(ObjectType.PORTAL_SHIP, 2100, 30);
  for (let x = 2070; x <= 3650; x += 30) b.addBlock(x, 220);
  b.addBlock(2400, 0);
  b.addBlock(2400, 30);
  b.addSpike(2400, 60);
  b.addBlock(2700, 140);
  b.addBlock(2700, 170);
  b.addSpike(2700, 110, 180);
  b.addBlock(3000, 40);
  b.addBlock(3030, 40);
  b.addCoin(3015, 90);

  b.addPortal(ObjectType.PORTAL_CUBE, 3700, 30);
  b.addPad(ObjectType.PAD_YELLOW, 3850, 0);
  b.addBlock(4000, 90);
  b.addPad(ObjectType.PAD_YELLOW, 4000, 120);
  b.addBlock(4200, 180);
  b.addBlock(4230, 180);
  b.addSpike(4400, 0);
  b.addSpike(4430, 0);
  b.addSpike(4460, 0);
  b.addOrb(ObjectType.ORB_YELLOW, 4430, 70);
  b.addCoin(4615, 120);
  b.addEnd(5000);

  return new Level({
    id: 'back_on_track',
    name: 'Back On Track',
    creator: 'RobTop',
    difficulty: 'Normal',
    stars: 2,
    bpm: 135,
    length: 5300,
    bgColor: '#110b29',
    groundColor: '#1d1142',
    objects: b.objects
  });
}

// 3. POLARGEIST (Hard - 3★ - 140 BPM)
export function createPolargeistLevel(): Level {
  const b = createBuilder();
  b.addSpike(400, 0);
  b.addSpike(430, 0);
  b.addBlock(650, 0);
  b.addBlock(680, 0);
  b.addOrb(ObjectType.ORB_PINK, 780, 45);

  b.addBlock(900, 30);
  b.addBlock(930, 30);
  b.addSpike(960, 0);
  b.addOrb(ObjectType.ORB_YELLOW, 1150, 60);
  b.addOrb(ObjectType.ORB_PINK, 1300, 90);
  b.addBlock(1450, 90);
  b.addBlock(1480, 90);
  b.addCoin(1480, 140);
  b.addPad(ObjectType.PAD_RED, 1600, 0);

  b.addPortal(ObjectType.PORTAL_BALL, 1950, 30);
  for (let x = 1920; x <= 3450; x += 30) b.addBlock(x, 160);
  b.addSpike(2200, 0);
  b.addSpike(2400, 130, 180);
  b.addSpike(2600, 0);
  b.addCoin(2750, 80);
  b.addSpike(2800, 130, 180);
  b.addSpike(3000, 0);

  b.addPortal(ObjectType.PORTAL_UFO, 3500, 30);
  b.addBlock(3700, 0);
  b.addBlock(3700, 30);
  b.addBlock(3700, 180);
  b.addBlock(3950, 0);
  b.addBlock(3950, 60);
  b.addBlock(3950, 210);
  b.addCoin(4200, 105);

  b.addPortal(ObjectType.PORTAL_CUBE, 4400, 30);
  b.addSpike(4600, 0);
  b.addOrb(ObjectType.ORB_YELLOW, 4600, 60);
  b.addEnd(5100);

  return new Level({
    id: 'polargeist',
    name: 'Polargeist',
    creator: 'RobTop',
    difficulty: 'Hard',
    stars: 3,
    bpm: 140,
    length: 5400,
    bgColor: '#021a24',
    groundColor: '#032e3d',
    objects: b.objects
  });
}

// 4. DRY OUT (Harder - 4★ - 142 BPM)
export function createDryOutLevel(): Level {
  const b = createBuilder();
  b.addSpike(450, 0);
  b.addSpike(700, 0);
  b.addSpike(730, 0);
  b.addPad(ObjectType.PAD_PINK, 600, 0);

  b.addPortal(ObjectType.PORTAL_GRAVITY_UP, 1000, 30);
  for (let x = 1000; x <= 2200; x += 30) b.addBlock(x, 210);
  b.addSpike(1300, 180, 180);
  b.addSpike(1550, 180, 180);
  b.addCoin(1565, 120);
  b.addOrb(ObjectType.ORB_YELLOW, 1800, 140);

  b.addPortal(ObjectType.PORTAL_GRAVITY_DOWN, 2250, 120);
  b.addPortal(ObjectType.PORTAL_WAVE, 2400, 30);
  for (let x = 2370; x <= 3730; x += 30) b.addBlock(x, 210);
  b.addSpike(2650, 0);
  b.addSpike(2850, 180, 180);
  b.addCoin(3150, 100);

  b.addPortal(ObjectType.PORTAL_CUBE, 3700, 30);
  b.addPad(ObjectType.PAD_YELLOW, 3850, 0);
  b.addBlock(4000, 90);
  b.addCoin(4000, 140);
  b.addEnd(4600);

  return new Level({
    id: 'dry_out',
    name: 'Dry Out',
    creator: 'RobTop',
    difficulty: 'Harder',
    stars: 4,
    bpm: 142,
    length: 4900,
    bgColor: '#240d04',
    groundColor: '#3b1506',
    objects: b.objects
  });
}

// 5. BASE AFTER BASE (Hard - 3★ - 138 BPM)
export function createBaseAfterBaseLevel(): Level {
  const b = createBuilder();
  b.addSpike(420, 0);
  b.addBlock(650, 0);
  b.addBlock(680, 30);
  b.addBlock(710, 60);
  b.addSpike(850, 0);
  b.addSpike(880, 0);
  b.addOrb(ObjectType.ORB_YELLOW, 865, 60);

  b.addBlock(1050, 60);
  b.addBlock(1080, 60);
  b.addCoin(1065, 110);
  b.addPad(ObjectType.PAD_YELLOW, 1250, 0);
  b.addBlock(1400, 90);
  b.addBlock(1430, 90);

  // Секція спокійної ракети
  b.addPortal(ObjectType.PORTAL_SHIP, 1650, 30);
  for (let x = 1620; x <= 2850; x += 30) b.addBlock(x, 210);
  b.addBlock(1900, 0);
  b.addBlock(1900, 30);
  b.addBlock(2200, 150);
  b.addBlock(2200, 180);
  b.addCoin(2200, 90);
  b.addBlock(2500, 40);

  // Кубик з ритмічними сходинками
  b.addPortal(ObjectType.PORTAL_CUBE, 2900, 30);
  b.addSpike(3100, 0);
  b.addOrb(ObjectType.ORB_PINK, 3100, 50);
  b.addBlock(3300, 30);
  b.addBlock(3330, 30);
  b.addSpike(3450, 0);
  b.addSpike(3480, 0);
  b.addPad(ObjectType.PAD_YELLOW, 3600, 0);
  b.addBlock(3750, 90);
  b.addCoin(3750, 140);
  b.addEnd(4200);

  return new Level({
    id: 'base_after_base',
    name: 'Base After Base',
    creator: 'RobTop',
    difficulty: 'Hard',
    stars: 3,
    bpm: 138,
    length: 4500,
    bgColor: '#061324',
    groundColor: '#0c223d',
    objects: b.objects
  });
}

// 6. CAN'T LET GO (Harder - 5★ - 146 BPM)
export function createCantLetGoLevel(): Level {
  const b = createBuilder();
  b.addSpike(400, 0);
  b.addSpike(430, 0);
  b.addBlock(650, 0);
  b.addBlock(650, 30);
  b.addOrb(ObjectType.ORB_YELLOW, 770, 70);

  b.addSpike(920, 0);
  b.addSpike(950, 0);
  b.addSpike(980, 0);
  b.addPad(ObjectType.PAD_YELLOW, 900, 0);

  // Темна секція підвісних платформ
  b.addBlock(1150, 90);
  b.addSpike(1150, 120);
  b.addBlock(1180, 90);
  b.addBlock(1210, 90);
  b.addCoin(1210, 140);

  b.addOrb(ObjectType.ORB_PINK, 1400, 60);
  b.addOrb(ObjectType.ORB_YELLOW, 1550, 90);

  b.addPortal(ObjectType.PORTAL_BALL, 1750, 30);
  for (let x = 1720; x <= 2950; x += 30) b.addBlock(x, 150);
  b.addSpike(1950, 0);
  b.addSpike(2150, 120, 180);
  b.addCoin(2250, 75);
  b.addSpike(2450, 0);
  b.addSpike(2650, 120, 180);

  b.addPortal(ObjectType.PORTAL_CUBE, 3000, 30);
  b.addPad(ObjectType.PAD_RED, 3150, 0);
  b.addSpike(3300, 0);
  b.addSpike(3330, 0);
  b.addCoin(3315, 120);
  b.addEnd(3700);

  return new Level({
    id: 'cant_let_go',
    name: "Can't Let Go",
    creator: 'RobTop',
    difficulty: 'Harder',
    stars: 5,
    bpm: 146,
    length: 4000,
    bgColor: '#160424',
    groundColor: '#28073d',
    objects: b.objects
  });
}

// 7. JUMPER (Harder - 6★ - 150 BPM)
export function createJumperLevel(): Level {
  const b = createBuilder();
  b.addPad(ObjectType.PAD_YELLOW, 400, 0);
  b.addBlock(550, 90);
  b.addPad(ObjectType.PAD_YELLOW, 550, 120);
  b.addBlock(720, 180);
  b.addCoin(720, 230);

  b.addSpike(900, 0);
  b.addSpike(930, 0);
  b.addOrb(ObjectType.ORB_YELLOW, 915, 60);

  b.addBlock(1100, 60);
  b.addBlock(1130, 60);
  b.addPad(ObjectType.PAD_PINK, 1130, 90);
  b.addBlock(1300, 120);

  // Секція швидкого стрибучого НЛО
  b.addPortal(ObjectType.PORTAL_UFO, 1500, 30);
  b.addBlock(1700, 0);
  b.addBlock(1700, 40);
  b.addBlock(1700, 170);
  b.addBlock(1700, 210);
  b.addBlock(1950, 0);
  b.addBlock(1950, 70);
  b.addBlock(1950, 200);
  b.addCoin(1950, 135);

  b.addPortal(ObjectType.PORTAL_CUBE, 2200, 30);
  b.addPad(ObjectType.PAD_YELLOW, 2350, 0);
  b.addBlock(2500, 90);
  b.addSpike(2650, 0);
  b.addSpike(2680, 0);
  b.addSpike(2710, 0);
  b.addOrb(ObjectType.ORB_RED, 2680, 70);
  b.addCoin(2680, 160);
  b.addEnd(3100);

  return new Level({
    id: 'jumper',
    name: 'Jumper',
    creator: 'RobTop',
    difficulty: 'Harder',
    stars: 6,
    bpm: 150,
    length: 3400,
    bgColor: '#1c1b03',
    groundColor: '#302f06',
    objects: b.objects
  });
}

// 8. TIME MACHINE (Harder - 7★ - 146 BPM)
export function createTimeMachineLevel(): Level {
  const b = createBuilder();
  b.addSpike(400, 0);
  b.addSpike(430, 0);
  b.addSpike(460, 0); // Потрійний шип

  b.addPad(ObjectType.PAD_YELLOW, 650, 0);
  b.addBlock(800, 90);
  b.addBlock(830, 90);
  b.addSpike(950, 0);
  b.addOrb(ObjectType.ORB_PINK, 950, 50);

  // Портал інверсії гравітації для кубика
  b.addPortal(ObjectType.PORTAL_GRAVITY_UP, 1150, 30);
  for (let x = 1120; x <= 2250; x += 30) b.addBlock(x, 210);
  b.addSpike(1400, 180, 180);
  b.addSpike(1430, 180, 180);
  b.addCoin(1550, 120);
  b.addOrb(ObjectType.ORB_YELLOW, 1750, 150);
  b.addSpike(1950, 180, 180);

  b.addPortal(ObjectType.PORTAL_GRAVITY_DOWN, 2300, 120);
  b.addPortal(ObjectType.PORTAL_SHIP, 2450, 30);
  for (let x = 2420; x <= 3450; x += 30) b.addBlock(x, 210);
  b.addBlock(2700, 0);
  b.addBlock(2700, 30);
  b.addBlock(2950, 150);
  b.addCoin(2950, 90);

  b.addPortal(ObjectType.PORTAL_CUBE, 3500, 30);
  b.addSpike(3700, 0);
  b.addSpike(3730, 0);
  b.addSpike(3760, 0);
  b.addOrb(ObjectType.ORB_YELLOW, 3730, 60);
  b.addEnd(4100);

  return new Level({
    id: 'time_machine',
    name: 'Time Machine',
    creator: 'RobTop',
    difficulty: 'Harder',
    stars: 7,
    bpm: 146,
    length: 4400,
    bgColor: '#100321',
    groundColor: '#1d0738',
    objects: b.objects
  });
}

// 9. CYCLES (Harder - 7★ - 152 BPM)
export function createCyclesLevel(): Level {
  const b = createBuilder();
  b.addSpike(420, 0);
  b.addOrb(ObjectType.ORB_YELLOW, 550, 50);
  b.addBlock(700, 60);
  b.addBlock(730, 60);

  // Фірмова розширена секція Кулі (Ball)
  b.addPortal(ObjectType.PORTAL_BALL, 950, 30);
  for (let x = 920; x <= 2800; x += 30) b.addBlock(x, 150);
  b.addSpike(1150, 0);
  b.addSpike(1350, 120, 180);
  b.addCoin(1450, 75);
  b.addSpike(1600, 0);
  b.addSpike(1800, 120, 180);
  b.addSpike(2000, 0);
  b.addSpike(2250, 120, 180);
  b.addCoin(2400, 75);
  b.addSpike(2550, 0);

  b.addPortal(ObjectType.PORTAL_CUBE, 2850, 30);
  b.addPad(ObjectType.PAD_YELLOW, 3000, 0);
  b.addBlock(3150, 90);
  b.addSpike(3300, 0);
  b.addSpike(3330, 0);
  b.addSpike(3360, 0);
  b.addOrb(ObjectType.ORB_YELLOW, 3330, 60);
  b.addCoin(3330, 140);
  b.addEnd(3700);

  return new Level({
    id: 'cycles',
    name: 'Cycles',
    creator: 'RobTop',
    difficulty: 'Harder',
    stars: 7,
    bpm: 152,
    length: 4000,
    bgColor: '#020b24',
    groundColor: '#05163d',
    objects: b.objects
  });
}

// 10. XSTEP (Insane - 8★ - 154 BPM)
export function createXStepLevel(): Level {
  const b = createBuilder();
  b.addPortal(ObjectType.PORTAL_SPEED_FAST, 250, 30);
  b.addSpike(450, 0);
  b.addSpike(480, 0);
  b.addOrb(ObjectType.ORB_BLUE, 650, 60); // Синя гравітаційна сфера

  b.addBlock(850, 150);
  b.addBlock(880, 150);
  b.addCoin(865, 100);

  b.addOrb(ObjectType.ORB_BLUE, 1050, 120);
  b.addPad(ObjectType.PAD_BLUE, 1250, 0);

  b.addPortal(ObjectType.PORTAL_SHIP, 1500, 30);
  for (let x = 1470; x <= 2700; x += 30) b.addBlock(x, 210);
  b.addBlock(1750, 0);
  b.addBlock(1750, 30);
  b.addBlock(2000, 150);
  b.addBlock(2000, 180);
  b.addCoin(2150, 90);

  b.addPortal(ObjectType.PORTAL_CUBE, 2750, 30);
  b.addOrb(ObjectType.ORB_RED, 2900, 60);
  b.addSpike(3100, 0);
  b.addSpike(3130, 0);
  b.addSpike(3160, 0);
  b.addCoin(3130, 130);
  b.addEnd(3500);

  return new Level({
    id: 'xstep',
    name: 'xStep',
    creator: 'RobTop',
    difficulty: 'Insane',
    stars: 8,
    bpm: 154,
    length: 3800,
    bgColor: '#021824',
    groundColor: '#062d3d',
    objects: b.objects
  });
}

// 11. CLUTTERFUNK (Insane - 9★ - 158 BPM)
export function createClutterfunkLevel(): Level {
  const b = createBuilder();
  b.addPortal(ObjectType.PORTAL_SPEED_FAST, 200, 30);
  b.addSpike(400, 0);
  b.addSpike(430, 0);
  b.addOrb(ObjectType.ORB_PINK, 550, 45);
  b.addOrb(ObjectType.ORB_YELLOW, 700, 75);
  b.addBlock(850, 90);
  b.addCoin(850, 140);

  b.addPortal(ObjectType.PORTAL_BALL, 1050, 30);
  for (let x = 1020; x <= 2250; x += 30) b.addBlock(x, 150);
  b.addSpike(1250, 0);
  b.addSpike(1450, 120, 180);
  b.addSpike(1650, 0);
  b.addCoin(1750, 75);
  b.addSpike(1850, 120, 180);

  b.addPortal(ObjectType.PORTAL_SHIP, 2300, 30);
  for (let x = 2270; x <= 3450; x += 30) b.addBlock(x, 210);
  b.addBlock(2550, 0);
  b.addBlock(2550, 30);
  b.addBlock(2550, 60);
  b.addBlock(2850, 150);
  b.addBlock(2850, 180);
  b.addCoin(3000, 110);

  b.addPortal(ObjectType.PORTAL_CUBE, 3500, 30);
  b.addPad(ObjectType.PAD_RED, 3650, 0);
  b.addSpike(3800, 0);
  b.addSpike(3830, 0);
  b.addSpike(3860, 0);
  b.addEnd(4200);

  return new Level({
    id: 'clutterfunk',
    name: 'Clutterfunk',
    creator: 'RobTop',
    difficulty: 'Insane',
    stars: 9,
    bpm: 158,
    length: 4500,
    bgColor: '#241002',
    groundColor: '#3d1b05',
    objects: b.objects
  });
}

// 12. THEORY OF EVERYTHING (Insane - 9★ - 160 BPM)
export function createTheoryOfEverythingLevel(): Level {
  const b = createBuilder();
  b.addSpike(420, 0);
  b.addOrb(ObjectType.ORB_YELLOW, 550, 60);
  b.addBlock(700, 60);
  b.addCoin(700, 110);

  b.addPortal(ObjectType.PORTAL_UFO, 950, 30);
  b.addBlock(1150, 0);
  b.addBlock(1150, 30);
  b.addBlock(1150, 180);
  b.addBlock(1150, 210);
  b.addBlock(1400, 0);
  b.addBlock(1400, 60);
  b.addBlock(1400, 210);
  b.addCoin(1400, 135);

  b.addPortal(ObjectType.PORTAL_SHIP, 1650, 30);
  for (let x = 1620; x <= 2700; x += 30) b.addBlock(x, 210);
  b.addBlock(1900, 0);
  b.addBlock(1900, 40);
  b.addBlock(2200, 140);
  b.addBlock(2200, 180);

  b.addPortal(ObjectType.PORTAL_WAVE, 2750, 30);
  for (let x = 2720; x <= 3850; x += 30) b.addBlock(x, 210);
  b.addSpike(2950, 0);
  b.addSpike(3150, 180, 180);
  b.addCoin(3300, 100);
  b.addSpike(3450, 0);

  b.addPortal(ObjectType.PORTAL_CUBE, 3900, 30);
  b.addPad(ObjectType.PAD_RED, 4050, 0);
  b.addEnd(4400);

  return new Level({
    id: 'toe',
    name: 'Theory of Everything',
    creator: 'RobTop',
    difficulty: 'Insane',
    stars: 9,
    bpm: 160,
    length: 4700,
    bgColor: '#160224',
    groundColor: '#25053d',
    objects: b.objects
  });
}

// 13. ELECTROMAN (Insane - 8★ - 150 BPM)
export function createElectromanLevel(): Level {
  const b = createBuilder();
  b.addPortal(ObjectType.PORTAL_SPEED_FAST, 250, 30);
  b.addSpike(450, 0);
  b.addSpike(480, 0);
  b.addOrb(ObjectType.ORB_YELLOW, 700, 50);
  b.addOrb(ObjectType.ORB_PINK, 850, 80);
  b.addOrb(ObjectType.ORB_RED, 1000, 110);
  b.addBlock(1150, 150);
  b.addCoin(1165, 200);

  b.addPortal(ObjectType.PORTAL_SHIP, 1350, 30);
  for (let x = 1320; x <= 2650; x += 30) b.addBlock(x, 210);
  b.addBlock(1600, 0);
  b.addBlock(1600, 60);
  b.addBlock(1850, 120);
  b.addCoin(2200, 110);

  b.addPortal(ObjectType.PORTAL_WAVE, 2700, 30);
  for (let x = 2670; x <= 4030; x += 30) b.addBlock(x, 210);
  b.addSpike(2900, 0);
  b.addSpike(3050, 180, 180);
  b.addCoin(3450, 100);

  b.addPortal(ObjectType.PORTAL_CUBE, 4000, 30);
  b.addPad(ObjectType.PAD_RED, 4150, 0);
  b.addSpike(4280, 0);
  b.addSpike(4310, 0);
  b.addSpike(4340, 0);
  b.addEnd(4700);

  return new Level({
    id: 'electroman',
    name: 'Electroman',
    creator: 'RobTop',
    difficulty: 'Insane',
    stars: 8,
    bpm: 150,
    length: 5000,
    bgColor: '#1d0426',
    groundColor: '#30073e',
    objects: b.objects
  });
}

// 14. ELECTRODYNAMIX (Insane - 9★ - 165 BPM)
export function createElectrodynamixLevel(): Level {
  const b = createBuilder();
  b.addPortal(ObjectType.PORTAL_SPEED_VERY_FAST, 250, 30); // 3x швидкість!
  b.addSpike(500, 0);
  b.addSpike(530, 0);
  b.addOrb(ObjectType.ORB_PINK, 700, 50);
  b.addBlock(900, 90);
  b.addCoin(900, 140);

  b.addPortal(ObjectType.PORTAL_SHIP, 1100, 30);
  for (let x = 1070; x <= 2500; x += 30) b.addBlock(x, 210);
  b.addBlock(1400, 0);
  b.addBlock(1400, 40);
  b.addBlock(1750, 140);
  b.addCoin(1900, 105);
  b.addBlock(2150, 0);
  b.addBlock(2150, 50);

  b.addPortal(ObjectType.PORTAL_BALL, 2550, 30);
  for (let x = 2520; x <= 3700; x += 30) b.addBlock(x, 150);
  b.addSpike(2800, 0);
  b.addSpike(3050, 120, 180);
  b.addCoin(3250, 75);
  b.addSpike(3450, 0);

  b.addPortal(ObjectType.PORTAL_CUBE, 3750, 30);
  b.addPad(ObjectType.PAD_RED, 3900, 0);
  b.addSpike(4100, 0);
  b.addSpike(4130, 0);
  b.addSpike(4160, 0);
  b.addEnd(4500);

  return new Level({
    id: 'electrodynamix',
    name: 'Electrodynamix',
    creator: 'RobTop',
    difficulty: 'Insane',
    stars: 9,
    bpm: 165,
    length: 4800,
    bgColor: '#1a1801',
    groundColor: '#302d03',
    objects: b.objects
  });
}

// 15. HEXAGON FORCE (Insane - 8★ - 150 BPM)
export function createHexagonForceLevel(): Level {
  const b = createBuilder();
  b.addSpike(400, 0);
  b.addOrb(ObjectType.ORB_BLUE, 550, 60);
  b.addBlock(750, 120);
  b.addCoin(750, 70);
  b.addOrb(ObjectType.ORB_BLUE, 950, 100);

  b.addPortal(ObjectType.PORTAL_BALL, 1200, 30);
  for (let x = 1170; x <= 2450; x += 30) b.addBlock(x, 150);
  b.addSpike(1450, 0);
  b.addSpike(1700, 120, 180);
  b.addCoin(1900, 75);
  b.addSpike(2100, 0);

  b.addPortal(ObjectType.PORTAL_SHIP, 2500, 30);
  for (let x = 2470; x <= 3600; x += 30) b.addBlock(x, 210);
  b.addBlock(2800, 0);
  b.addBlock(2800, 30);
  b.addBlock(3100, 150);
  b.addCoin(3250, 105);

  b.addPortal(ObjectType.PORTAL_CUBE, 3650, 30);
  b.addPad(ObjectType.PAD_YELLOW, 3800, 0);
  b.addSpike(3950, 0);
  b.addSpike(3980, 0);
  b.addEnd(4300);

  return new Level({
    id: 'hexagon_force',
    name: 'Hexagon Force',
    creator: 'RobTop',
    difficulty: 'Insane',
    stars: 8,
    bpm: 150,
    length: 4600,
    bgColor: '#031b1c',
    groundColor: '#053133',
    objects: b.objects
  });
}

// 16. BLAST PROCESSING (Harder - 5★ - 144 BPM)
export function createBlastProcessingLevel(): Level {
  const b = createBuilder();
  b.addSpike(420, 0);
  b.addBlock(650, 30);
  b.addOrb(ObjectType.ORB_YELLOW, 780, 70);
  b.addCoin(780, 120);

  // Класичний ретро-коридор Хвилі (Wave)
  b.addPortal(ObjectType.PORTAL_WAVE, 1000, 30);
  for (let x = 970; x <= 2650; x += 30) b.addBlock(x, 210);
  b.addSpike(1200, 0);
  b.addSpike(1400, 180, 180);
  b.addCoin(1550, 100);
  b.addSpike(1700, 0);
  b.addSpike(1900, 180, 180);
  b.addSpike(2100, 0);
  b.addSpike(2300, 180, 180);

  b.addPortal(ObjectType.PORTAL_UFO, 2700, 30);
  b.addBlock(2900, 0);
  b.addBlock(2900, 30);
  b.addBlock(2900, 180);
  b.addCoin(3100, 105);

  b.addPortal(ObjectType.PORTAL_CUBE, 3350, 30);
  b.addPad(ObjectType.PAD_YELLOW, 3500, 0);
  b.addEnd(3900);

  return new Level({
    id: 'blast_processing',
    name: 'Blast Processing',
    creator: 'RobTop',
    difficulty: 'Harder',
    stars: 5,
    bpm: 144,
    length: 4200,
    bgColor: '#061726',
    groundColor: '#0b263d',
    objects: b.objects
  });
}

// 17. GEOMETRICAL DOMINATOR (Harder - 6★ - 148 BPM)
export function createGeometricalDominatorLevel(): Level {
  const b = createBuilder();
  b.addSpike(400, 0);
  b.addOrb(ObjectType.ORB_YELLOW, 550, 60);
  b.addBlock(700, 60);
  b.addPad(ObjectType.PAD_PINK, 700, 90);
  b.addBlock(900, 150);
  b.addCoin(900, 200);

  b.addPortal(ObjectType.PORTAL_SHIP, 1150, 30);
  for (let x = 1120; x <= 2350; x += 30) b.addBlock(x, 210);
  b.addBlock(1400, 0);
  b.addBlock(1400, 40);
  b.addBlock(1700, 140);
  b.addCoin(1900, 100);

  b.addPortal(ObjectType.PORTAL_WAVE, 2400, 30);
  for (let x = 2370; x <= 3450; x += 30) b.addBlock(x, 210);
  b.addSpike(2600, 0);
  b.addSpike(2800, 180, 180);
  b.addCoin(3000, 100);

  b.addPortal(ObjectType.PORTAL_CUBE, 3500, 30);
  b.addPad(ObjectType.PAD_RED, 3650, 0);
  b.addEnd(4000);

  return new Level({
    id: 'geo_dominator',
    name: 'Geometrical Dominator',
    creator: 'RobTop',
    difficulty: 'Harder',
    stars: 6,
    bpm: 148,
    length: 4300,
    bgColor: '#0f0521',
    groundColor: '#1a0a38',
    objects: b.objects
  });
}

// 18. FINGERDASH (Insane - 9★ - 155 BPM)
export function createFingerdashLevel(): Level {
  const b = createBuilder();
  b.addPortal(ObjectType.PORTAL_SPEED_FAST, 200, 30);
  b.addSpike(420, 0);
  b.addSpike(450, 0);
  b.addOrb(ObjectType.ORB_RED, 600, 60);
  b.addBlock(800, 120);
  b.addCoin(800, 170);

  b.addPortal(ObjectType.PORTAL_WAVE, 1050, 30);
  for (let x = 1020; x <= 2250; x += 30) b.addBlock(x, 210);
  b.addSpike(1250, 0);
  b.addSpike(1450, 180, 180);
  b.addCoin(1650, 105);
  b.addSpike(1850, 0);

  b.addPortal(ObjectType.PORTAL_SHIP, 2300, 30);
  for (let x = 2270; x <= 3450; x += 30) b.addBlock(x, 210);
  b.addBlock(2550, 0);
  b.addBlock(2550, 50);
  b.addBlock(2850, 140);
  b.addCoin(3050, 100);

  b.addPortal(ObjectType.PORTAL_CUBE, 3500, 30);
  b.addPad(ObjectType.PAD_RED, 3650, 0);
  b.addSpike(3800, 0);
  b.addSpike(3830, 0);
  b.addSpike(3860, 0);
  b.addEnd(4200);

  return new Level({
    id: 'fingerdash',
    name: 'Fingerdash',
    creator: 'RobTop',
    difficulty: 'Insane',
    stars: 9,
    bpm: 155,
    length: 4500,
    bgColor: '#240604',
    groundColor: '#3d0a07',
    objects: b.objects
  });
}

// 19. CLUBSTEP (Demon - 10★ - 155 BPM)
export function createClubstepLevel(): Level {
  const b = createBuilder();
  b.addSpike(400, 0);
  b.addSpike(430, 0);
  b.addSpike(460, 0);
  b.addBlock(650, 30);
  b.addOrb(ObjectType.ORB_PINK, 780, 60);

  b.addPortal(ObjectType.PORTAL_SHIP, 1150, 30);
  for (let x = 1120; x <= 2500; x += 30) b.addBlock(x, 210);
  b.addBlock(1400, 0);
  b.addSpike(1400, 30);
  b.addBlock(1400, 180);
  b.addSpike(1400, 150, 180);
  b.addBlock(1700, 0);
  b.addBlock(1700, 180);
  b.addCoin(1700, 90);

  b.addPortal(ObjectType.PORTAL_BALL, 2600, 30);
  b.addPortal(ObjectType.PORTAL_SPEED_FAST, 2700, 30);
  for (let x = 2570; x <= 3900; x += 30) b.addBlock(x, 150);
  b.addSpike(2900, 0);
  b.addSpike(3100, 120, 180);
  b.addCoin(3400, 75);

  b.addPortal(ObjectType.PORTAL_WAVE, 4000, 30);
  for (let x = 3970; x <= 5330; x += 30) b.addBlock(x, 210);
  b.addSpike(4200, 0);
  b.addSpike(4350, 180, 180);
  b.addCoin(4750, 105);

  b.addPortal(ObjectType.PORTAL_CUBE, 5300, 30);
  b.addPad(ObjectType.PAD_RED, 5450, 0);
  b.addSpike(5580, 0);
  b.addSpike(5610, 0);
  b.addSpike(5640, 0);
  b.addEnd(6000);

  return new Level({
    id: 'clubstep',
    name: 'Clubstep (Demon)',
    creator: 'RobTop',
    difficulty: 'Demon',
    stars: 10,
    bpm: 155,
    length: 6300,
    bgColor: '#1c0205',
    groundColor: '#300309',
    objects: b.objects
  });
}

// 20. DEADLOCKED (Demon - 10★ - 168 BPM)
export function createDeadlockedLevel(): Level {
  const b = createBuilder();
  b.addPortal(ObjectType.PORTAL_SPEED_VERY_FAST, 200, 30); // 3x Швидкість
  b.addSpike(400, 0);
  b.addSpike(430, 0);
  b.addSpike(460, 0);
  b.addOrb(ObjectType.ORB_RED, 620, 60);

  b.addBlock(850, 120);
  b.addCoin(850, 170);

  // Смертоносний тунель ракети
  b.addPortal(ObjectType.PORTAL_SHIP, 1050, 30);
  for (let x = 1020; x <= 2400; x += 30) b.addBlock(x, 210);
  b.addBlock(1300, 0);
  b.addBlock(1300, 50);
  b.addBlock(1600, 130);
  b.addBlock(1600, 180);
  b.addCoin(1800, 95);

  // Демонічна хвиля на 3x швидкості
  b.addPortal(ObjectType.PORTAL_WAVE, 2450, 30);
  for (let x = 2420; x <= 3850; x += 30) b.addBlock(x, 210);
  b.addSpike(2650, 0);
  b.addSpike(2800, 180, 180);
  b.addSpike(2950, 0);
  b.addCoin(3150, 105);
  b.addSpike(3300, 180, 180);
  b.addSpike(3500, 0);

  b.addPortal(ObjectType.PORTAL_CUBE, 3900, 30);
  b.addPad(ObjectType.PAD_RED, 4050, 0);
  b.addSpike(4180, 0);
  b.addSpike(4210, 0);
  b.addSpike(4240, 0);
  b.addEnd(4600);

  return new Level({
    id: 'deadlocked',
    name: 'Deadlocked (Demon)',
    creator: 'RobTop',
    difficulty: 'Demon',
    stars: 10,
    bpm: 168,
    length: 4900,
    bgColor: '#170104',
    groundColor: '#2b0207',
    objects: b.objects
  });
}

/**
 * Отримати список усіх 20 офіційних культових рівнів
 */
export function getAllDefaultLevels(): Level[] {
  return [
    createStereoMadnessLevel(),
    createBackOnTrackLevel(),
    createPolargeistLevel(),
    createDryOutLevel(),
    createBaseAfterBaseLevel(),
    createCantLetGoLevel(),
    createJumperLevel(),
    createTimeMachineLevel(),
    createCyclesLevel(),
    createXStepLevel(),
    createClutterfunkLevel(),
    createTheoryOfEverythingLevel(),
    createElectromanLevel(),
    createElectrodynamixLevel(),
    createHexagonForceLevel(),
    createBlastProcessingLevel(),
    createGeometricalDominatorLevel(),
    createFingerdashLevel(),
    createClubstepLevel(),
    createDeadlockedLevel()
  ];
}
