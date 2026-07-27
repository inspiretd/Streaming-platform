export type Channel = {
  id: string;
  name: string;
  shortName: string;
  category: string;
  country: string;
  language: string;
  program: string;
  next: string;
  quality: string;
  tone: string;
  live: boolean;
};

export const demoChannels: Channel[] = [
  { id: 'toshkent', name: 'Toshkent', shortName: 'T', category: 'General', country: 'UZ', language: 'O‘zbek', program: 'Shahar ritmi', next: '18:30 Yangiliklar', quality: 'HD', tone: 'sand', live: true },
  { id: 'madaniyat', name: 'Madaniyat va Ma’rifat', shortName: 'M', category: 'Education', country: 'UZ', language: 'O‘zbek', program: 'Ochiq kitob', next: '19:00 Musiqa', quality: 'FHD', tone: 'plum', live: true },
  { id: 'sport-uz', name: 'Sport UZ', shortName: 'S', category: 'Sport', country: 'UZ', language: 'O‘zbek', program: 'Live arena', next: '20:00 Stadion', quality: 'HD', tone: 'teal', live: true },
  { id: 'world-news', name: 'World News', shortName: 'W', category: 'News', country: 'INT', language: 'English', program: 'The daily brief', next: '18:45 Market watch', quality: 'HD', tone: 'blue', live: false },
  { id: 'bolajon', name: 'Bolajon', shortName: 'B', category: 'Kids', country: 'UZ', language: 'O‘zbek', program: 'Rangli olam', next: '18:20 Qiziqarli fan', quality: 'HD', tone: 'coral', live: true },
];
