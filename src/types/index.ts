export interface MediaItem {
  id: string;
  type: 'photo' | 'video' | 'presentation';
  name: string;
  url: string;
  thumbnail?: string;
  size?: number;
  uploadDate: string;
  isYouTube?: boolean;
  youtubeId?: string;
  storagePath?: string;  // Путь к файлу в Supabase Storage
  storageBucket?: string; // Имя бакета в Supabase Storage
}

export interface Speaker {
  id: string;
  name: string;
  description: string;
  photoUrl: string;
  role: string;
  photoStoragePath?: string; // Путь к фото в Supabase Storage
  photoStorageBucket?: string; // Имя бакета в Supabase Storage
}

export interface SurveyResponse {
  id: string;
  fullName: string;
  contacts: string;
  occupation: string;
  materialUseful: 'yes' | 'no' | 'unknown';
  recommendation: 'definitely' | 'probably' | 'unknown' | 'probably-not' | 'definitely-not';
  aiExperience: 'nothing' | 'reading' | 'team-using' | 'attempts';
  companyName?: string;
  missingInfo?: {
    enough: boolean;
    needPractice: boolean;
    comment?: string;
  };
  aiServices?: {
    notUsing: boolean;
    services?: string;
  };
  obstacles?: {
    nothing: boolean;
    dataSecurity: boolean;
    accessPayment: boolean;
    lowQuality: boolean;
    specificProduct: boolean;
    comment?: string;
  };
  comments?: string;
  submittedAt: string;
}
