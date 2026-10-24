import { Level, LevelData } from './Level';
import { ObjectType } from './GameObject';

// ==========================================
// 1. STEREO MADNESS (Easy - 1★ - 130 BPM)
// ==========================================
export function createStereoMadnessLevel(): Level {
  const objects: LevelData['objects'] = [];

  const addBlock = (x: number, y: number) => objects.push({ type: ObjectType.BLOCK, x, y });
  const addSpike = (x: number, y: number, rotation: number = 0) => objects.push({ type: ObjectType.SPIKE, x, y, rotation });
  const addOrb = (type: ObjectType, x: number, y: number) => objects.push({ type, x, y });
  const addPad = (type: ObjectType, x: number, y: number) => objects.push({ type, x, y });
  const addPortal = (type: ObjectType, x: number, y: number) => objects.push({ type, x, y });
  const addCoin = (x: number, y: number) => objects.push({ type: ObjectType.COIN, x, y });

  // СЕКЦІЯ 1: КУБИК
  addSpike(450, 0);
  addSpike(750, 0);
  addSpike(780, 0);

  addBlock(1050, 0);
  addBlock(1080, 0);
  addBlock(1110, 0);
  addSpike(1140, 0);

  addSpike(1350, 0);
  addSpike(1380, 0);
  addOrb(ObjectType.ORB_YELLOW, 1365, 60);

  addPad(ObjectType.PAD_YELLOW, 1600, 0);
  addBlock(1750, 90);
  addBlock(1780, 90);
  addBlock(1810, 90);
  addCoin(1780, 140); // Монета 1

  addSpike(1950, 0);
  addSpike(1980, 0);
  addSpike(2010, 0);

  // СЕКЦІЯ 2: РАКЕТА
  addPortal(ObjectType.PORTAL_SHIP, 2250, 30);
  for (let x = 2300; x <= 3600; x += 30) {
    addBlock(x, 210);
  }
  addBlock(2600, 0);
  addBlock(2600, 30);
  addSpike(2600, 60);

  addBlock(2900, 150);
  addBlock(2900, 180);
  addSpike(2900, 120, 180);

  addBlock(3200, 0);
  addBlock(3200, 30);
  addBlock(3200, 60);
  addCoin(3350, 110); // Монета 2

  // СЕКЦІЯ 3: КУЛЯ
  addPortal(ObjectType.PORTAL_BALL, 3700, 30);
  for (let x = 3800; x <= 5000; x += 30) {
    addBlock(x, 150);
  }
  addSpike(4000, 0);
  addSpike(4250, 120, 180);
  addSpike(4500, 0);
  addSpike(4750, 120, 180);

  // СЕКЦІЯ 4: НЛО
  addPortal(ObjectType.PORTAL_UFO, 5100, 30);
  addPortal(ObjectType.PORTAL_SPEED_FAST, 5200, 30);

  addBlock(5450, 0);
  addBlock(5450, 30);
  addBlock(5450, 180);
  addBlock(5450, 210);

  addBlock(5750, 0);
  addBlock(5750, 60);
  addBlock(5750, 210);
  addBlock(5750, 240);

  addBlock(6050, 0);
  addBlock(6050, 30);
  addBlock(6050, 180);
  addBlock(6050, 210);

  // СЕКЦІЯ 5: ХВИЛЯ (Безперервний коридор від порталу входу до виходу)
  addPortal(ObjectType.PORTAL_WAVE, 6300, 60);
  for (let x = 6270; x <= 7730; x += 30) {
    addBlock(x, 240); // Верхній бар'єр
  }
  addSpike(6600, 0);
  addSpike(6800, 210, 180);
  addSpike(7000, 0);
  addSpike(7200, 210, 180);
  addCoin(7350, 100); // Монета 3
  addSpike(7450, 0);

  // ФІНІШ
  addPortal(ObjectType.PORTAL_CUBE, 7700, 30);
  addPortal(ObjectType.PORTAL_SPEED_NORMAL, 7750, 30);

  addBlock(7850, 0);
  addPad(ObjectType.PAD_YELLOW, 7850, 30);
  addBlock(8000, 90);
  addBlock(8030, 90);
  addBlock(8060, 90);

  objects.push({
    type: ObjectType.END_TRIGGER,
    x: 8300,
    y: 0,
    width: 40,
    height: 400
  });

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
    objects
  });
}

// ==========================================
// 2. BACK ON TRACK (Normal - 2★ - 135 BPM)
// ==========================================
export function createBackOnTrackLevel(): Level {
  const objects: LevelData['objects'] = [];

  const addBlock = (x: number, y: number) => objects.push({ type: ObjectType.BLOCK, x, y });
  const addSpike = (x: number, y: number, rotation: number = 0) => objects.push({ type: ObjectType.SPIKE, x, y, rotation });
  const addOrb = (type: ObjectType, x: number, y: number) => objects.push({ type, x, y });
  const addPad = (type: ObjectType, x: number, y: number) => objects.push({ type, x, y });
  const addPortal = (type: ObjectType, x: number, y: number) => objects.push({ type, x, y });
  const addCoin = (x: number, y: number) => objects.push({ type: ObjectType.COIN, x, y });

  // Сходинки та жовті батути
  addSpike(400, 0);

  // Сходинка 1
  addBlock(650, 0);
  addPad(ObjectType.PAD_YELLOW, 650, 30);
  addBlock(850, 90);
  addBlock(880, 90);
  addSpike(880, 120);
  addBlock(910, 90);

  // Жовтий батут через потрійний шип
  addPad(ObjectType.PAD_YELLOW, 1150, 0);
  addSpike(1240, 0);
  addSpike(1270, 0);
  addSpike(1300, 0);

  // Сходинки з рожевими сферами
  addBlock(1450, 30);
  addOrb(ObjectType.ORB_PINK, 1550, 70);
  addBlock(1650, 60);
  addBlock(1680, 60);
  addCoin(1680, 110); // Монета 1

  addSpike(1850, 0);
  addSpike(1880, 0);
  addOrb(ObjectType.ORB_YELLOW, 1865, 50);

  // Каверна ракети з порталом
  addPortal(ObjectType.PORTAL_SHIP, 2100, 30);
  for (let x = 2150; x <= 3600; x += 30) {
    addBlock(x, 220); // Стеля
  }

  // Острівці посеред польоту
  addBlock(2400, 0);
  addBlock(2400, 30);
  addSpike(2400, 60);

  addBlock(2700, 140);
  addBlock(2700, 170);
  addSpike(2700, 110, 180);

  addBlock(3000, 40);
  addBlock(3030, 40);
  addCoin(3015, 90); // Монета 2

  addBlock(3300, 120);
  addBlock(3330, 120);
  addSpike(3300, 90, 180);
  addSpike(3330, 90, 180);

  // Портал кубика та ритмічні батути
  addPortal(ObjectType.PORTAL_CUBE, 3700, 30);
  addPad(ObjectType.PAD_YELLOW, 3850, 0);
  addBlock(4000, 90);
  addPad(ObjectType.PAD_YELLOW, 4000, 120);
  addBlock(4200, 180);
  addBlock(4230, 180);

  // Серія сфер над ямою з шипами
  addSpike(4400, 0);
  addSpike(4430, 0);
  addSpike(4460, 0);
  addOrb(ObjectType.ORB_YELLOW, 4430, 70);

  addSpike(4600, 0);
  addSpike(4630, 0);
  addOrb(ObjectType.ORB_YELLOW, 4615, 60);
  addCoin(4615, 120); // Монета 3

  // Фініш
  objects.push({
    type: ObjectType.END_TRIGGER,
    x: 5000,
    y: 0,
    width: 40,
    height: 400
  });

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
    objects
  });
}

// ==========================================
// 3. POLARGEIST (Hard - 3★ - 140 BPM)
// ==========================================
export function createPolargeistLevel(): Level {
  const objects: LevelData['objects'] = [];

  const addBlock = (x: number, y: number) => objects.push({ type: ObjectType.BLOCK, x, y });
  const addSpike = (x: number, y: number, rotation: number = 0) => objects.push({ type: ObjectType.SPIKE, x, y, rotation });
  const addOrb = (type: ObjectType, x: number, y: number) => objects.push({ type, x, y });
  const addPad = (type: ObjectType, x: number, y: number) => objects.push({ type, x, y });
  const addPortal = (type: ObjectType, x: number, y: number) => objects.push({ type, x, y });
  const addCoin = (x: number, y: number) => objects.push({ type: ObjectType.COIN, x, y });

  // Подвійні шипи та точні рожеві сфери (Pink Orbs)
  addSpike(400, 0);
  addSpike(430, 0);

  addBlock(650, 0);
  addBlock(680, 0);
  addOrb(ObjectType.ORB_PINK, 780, 45); // Низький точний стрибок

  addBlock(900, 30);
  addBlock(930, 30);
  addSpike(960, 0);

  // Секція з інверсією сфер
  addOrb(ObjectType.ORB_YELLOW, 1150, 60);
  addOrb(ObjectType.ORB_PINK, 1300, 90);
  addBlock(1450, 90);
  addBlock(1480, 90);
  addCoin(1480, 140); // Монета 1

  addSpike(1650, 0);
  addSpike(1680, 0);
  addSpike(1710, 0);
  addPad(ObjectType.PAD_RED, 1600, 0); // Червоний батут-суперстрибок

  // Секція Кулі (Ball) на високих перевернутих стелях
  addPortal(ObjectType.PORTAL_BALL, 1950, 30);
  for (let x = 2000; x <= 3400; x += 30) {
    addBlock(x, 160); // Стеля кулі
  }

  addSpike(2200, 0);
  addSpike(2400, 130, 180);
  addSpike(2600, 0);
  addCoin(2750, 80); // Монета 2
  addSpike(2800, 130, 180);
  addSpike(3000, 0);
  addSpike(3200, 130, 180);

  // Секція НЛО (UFO) з вузькими вертикальними проходами
  addPortal(ObjectType.PORTAL_UFO, 3500, 30);
  addBlock(3700, 0);
  addBlock(3700, 30);
  addBlock(3700, 180);
  addBlock(3700, 210);

  addBlock(3950, 0);
  addBlock(3950, 60);
  addBlock(3950, 210);
  addBlock(3950, 240);

  addBlock(4200, 0);
  addBlock(4200, 30);
  addCoin(4200, 105); // Монета 3
  addBlock(4200, 180);
  addBlock(4200, 210);

  // Фінал кубика
  addPortal(ObjectType.PORTAL_CUBE, 4400, 30);
  addSpike(4600, 0);
  addOrb(ObjectType.ORB_YELLOW, 4600, 60);
  addSpike(4750, 0);
  addSpike(4780, 0);

  objects.push({
    type: ObjectType.END_TRIGGER,
    x: 5100,
    y: 0,
    width: 40,
    height: 400
  });

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
    objects
  });
}

// ==========================================
// 4. DRY OUT (Harder - 4★ - 142 BPM)
// ==========================================
export function createDryOutLevel(): Level {
  const objects: LevelData['objects'] = [];

  const addBlock = (x: number, y: number) => objects.push({ type: ObjectType.BLOCK, x, y });
  const addSpike = (x: number, y: number, rotation: number = 0) => objects.push({ type: ObjectType.SPIKE, x, y, rotation });
  const addOrb = (type: ObjectType, x: number, y: number) => objects.push({ type, x, y });
  const addPad = (type: ObjectType, x: number, y: number) => objects.push({ type, x, y });
  const addPortal = (type: ObjectType, x: number, y: number) => objects.push({ type, x, y });
  const addCoin = (x: number, y: number) => objects.push({ type: ObjectType.COIN, x, y });

  // Вступ кубика
  addSpike(450, 0);
  addSpike(700, 0);
  addSpike(730, 0);
  addPad(ObjectType.PAD_PINK, 600, 0);

  // Секція інвертованої гравітації (Gravity Portal UP) для кубика!
  addPortal(ObjectType.PORTAL_GRAVITY_UP, 1000, 30);
  for (let x = 1050; x <= 2200; x += 30) {
    addBlock(x, 210); // Верхня підлога
  }

  // Шипи, що звисають з верхньої підлоги
  addSpike(1300, 180, 180);
  addSpike(1550, 180, 180);
  addSpike(1580, 180, 180);
  addCoin(1565, 120); // Монета 1 (у центрі)

  addSpike(1800, 180, 180);
  addOrb(ObjectType.ORB_YELLOW, 1800, 140);

  // Повернення до нормальної гравітації
  addPortal(ObjectType.PORTAL_GRAVITY_DOWN, 2250, 120);

  // Швидкісна хвиля під кутом 45 (коридор без щілин)
  addPortal(ObjectType.PORTAL_WAVE, 2400, 30);
  for (let x = 2370; x <= 3730; x += 30) {
    addBlock(x, 210);
  }
  addSpike(2650, 0);
  addSpike(2850, 180, 180);
  addSpike(3050, 0);
  addCoin(3150, 100); // Монета 2
  addSpike(3250, 180, 180);
  addSpike(3450, 0);

  // Завершальний кубик
  addPortal(ObjectType.PORTAL_CUBE, 3700, 30);
  addPad(ObjectType.PAD_YELLOW, 3850, 0);
  addBlock(4000, 90);
  addCoin(4000, 140); // Монета 3
  addSpike(4200, 0);
  addSpike(4230, 0);
  addSpike(4260, 0);

  objects.push({
    type: ObjectType.END_TRIGGER,
    x: 4600,
    y: 0,
    width: 40,
    height: 400
  });

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
    objects
  });
}

// ==========================================
// 5. ELECTROMAN (Insane - 8★ - 150 BPM)
// ==========================================
export function createElectromanLevel(): Level {
  const objects: LevelData['objects'] = [];

  const addBlock = (x: number, y: number) => objects.push({ type: ObjectType.BLOCK, x, y });
  const addSpike = (x: number, y: number, rotation: number = 0) => objects.push({ type: ObjectType.SPIKE, x, y, rotation });
  const addOrb = (type: ObjectType, x: number, y: number) => objects.push({ type, x, y });
  const addPad = (type: ObjectType, x: number, y: number) => objects.push({ type, x, y });
  const addPortal = (type: ObjectType, x: number, y: number) => objects.push({ type, x, y });
  const addCoin = (x: number, y: number) => objects.push({ type: ObjectType.COIN, x, y });

  // 2x швидкість від самого початку!
  addPortal(ObjectType.PORTAL_SPEED_FAST, 250, 30);

  addSpike(450, 0);
  addSpike(480, 0);

  // Ланцюжок сфер у повітрі
  addOrb(ObjectType.ORB_YELLOW, 700, 50);
  addOrb(ObjectType.ORB_PINK, 850, 80);
  addOrb(ObjectType.ORB_RED, 1000, 110);
  addBlock(1150, 150);
  addBlock(1180, 150);
  addCoin(1165, 200); // Монета 1

  // Секція швидкісної ракети з вузькими тунелями
  addPortal(ObjectType.PORTAL_SHIP, 1350, 30);
  for (let x = 1400; x <= 2600; x += 30) {
    addBlock(x, 210);
  }
  addBlock(1600, 0);
  addBlock(1600, 30);
  addBlock(1600, 60);

  addBlock(1850, 120);
  addBlock(1850, 150);
  addBlock(1850, 180);

  addBlock(2100, 0);
  addBlock(2100, 30);
  addCoin(2200, 110); // Монета 2

  addBlock(2350, 150);
  addBlock(2350, 180);

  // Швидкісна хвиля в тунелі з зубцями (без щілин)
  addPortal(ObjectType.PORTAL_WAVE, 2700, 30);
  for (let x = 2670; x <= 4030; x += 30) {
    addBlock(x, 210);
  }
  addSpike(2900, 0);
  addSpike(3050, 180, 180);
  addSpike(3200, 0);
  addSpike(3350, 180, 180);
  addCoin(3450, 100); // Монета 3
  addSpike(3550, 0);
  addSpike(3700, 180, 180);

  // Фінішний кубик на шаленій швидкості
  addPortal(ObjectType.PORTAL_CUBE, 4000, 30);
  addPad(ObjectType.PAD_RED, 4150, 0);
  addSpike(4280, 0);
  addSpike(4310, 0);
  addSpike(4340, 0);

  objects.push({
    type: ObjectType.END_TRIGGER,
    x: 4700,
    y: 0,
    width: 40,
    height: 400
  });

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
    objects
  });
}

// ==========================================
// 6. CLUBSTEP (Demon - 10★ - 155 BPM)
// ==========================================
export function createClubstepLevel(): Level {
  const objects: LevelData['objects'] = [];

  const addBlock = (x: number, y: number) => objects.push({ type: ObjectType.BLOCK, x, y });
  const addSpike = (x: number, y: number, rotation: number = 0) => objects.push({ type: ObjectType.SPIKE, x, y, rotation });
  const addOrb = (type: ObjectType, x: number, y: number) => objects.push({ type, x, y });
  const addPad = (type: ObjectType, x: number, y: number) => objects.push({ type, x, y });
  const addPortal = (type: ObjectType, x: number, y: number) => objects.push({ type, x, y });
  const addCoin = (x: number, y: number) => objects.push({ type: ObjectType.COIN, x, y });

  // Потрійні шипи від самого початку!
  addSpike(400, 0);
  addSpike(430, 0);
  addSpike(460, 0);

  addBlock(650, 30);
  addBlock(680, 30);
  addOrb(ObjectType.ORB_PINK, 780, 60);

  addSpike(920, 0);
  addSpike(950, 0);
  addSpike(980, 0);

  // Демонічна щелепа для ракети
  addPortal(ObjectType.PORTAL_SHIP, 1150, 30);
  for (let x = 1200; x <= 2500; x += 30) {
    addBlock(x, 210);
  }

  // Монстри з шипами
  addBlock(1400, 0);
  addSpike(1400, 30);
  addBlock(1400, 180);
  addSpike(1400, 150, 180);

  addBlock(1700, 0);
  addBlock(1700, 30);
  addSpike(1700, 60);
  addBlock(1700, 150);
  addBlock(1700, 180);
  addSpike(1700, 120, 180);
  addCoin(1700, 90); // Монета 1 (крізь щелепу!)

  addBlock(2000, 0);
  addSpike(2000, 30);
  addBlock(2000, 180);
  addSpike(2000, 150, 180);

  // Секція екстремальної Кулі
  addPortal(ObjectType.PORTAL_BALL, 2600, 30);
  addPortal(ObjectType.PORTAL_SPEED_FAST, 2700, 30);
  for (let x = 2750; x <= 3900; x += 30) {
    addBlock(x, 150);
  }
  addSpike(2900, 0);
  addSpike(3100, 120, 180);
  addSpike(3300, 0);
  addCoin(3400, 75); // Монета 2
  addSpike(3500, 120, 180);
  addSpike(3700, 0);

  // Демон Хвиля (Wave) на шаленій швидкості (без щілин)
  addPortal(ObjectType.PORTAL_WAVE, 4000, 30);
  for (let x = 3970; x <= 5330; x += 30) {
    addBlock(x, 210);
  }
  addSpike(4200, 0);
  addSpike(4350, 180, 180);
  addSpike(4500, 0);
  addSpike(4650, 180, 180);
  addCoin(4750, 105); // Монета 3
  addSpike(4850, 0);
  addSpike(5000, 180, 180);

  // Фінальний прорив кубика крізь потрійні шипи
  addPortal(ObjectType.PORTAL_CUBE, 5300, 30);
  addPad(ObjectType.PAD_RED, 5450, 0);
  addSpike(5580, 0);
  addSpike(5610, 0);
  addSpike(5640, 0);

  objects.push({
    type: ObjectType.END_TRIGGER,
    x: 6000,
    y: 0,
    width: 40,
    height: 400
  });

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
    objects
  });
}

/**
 * Отримати список усіх вбудованих рівнів
 */
export function getAllDefaultLevels(): Level[] {
  return [
    createStereoMadnessLevel(),
    createBackOnTrackLevel(),
    createPolargeistLevel(),
    createDryOutLevel(),
    createElectromanLevel(),
    createClubstepLevel()
  ];
}
