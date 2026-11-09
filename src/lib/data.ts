import profileData from '../data/profile.yml';
import photoData from '../data/photos.yml';

export interface Profile {
  name: string;
  tagline: string;
  location: string;
  status: string;
  intro: string;
  chips: string[];
  contact: { email: string; phone: string; phoneHref: string; linkedin: string; instagram: string; instagramHandle: string };
  experience: { role: string; org: string; place: string; dates: string; bullets: string[] }[];
  education: { school: string; detail: string; dates: string; gpa: string; coursework: string[] }[];
  leadership: { role: string; org: string; dates: string; bullets: string[] }[];
  skills: { technical: string[]; certifications: string[]; languages: string[]; interests: string[] };
}

export interface Photo {
  /** File name in src/assets/images */
  image: string;
  alt: string;
  caption: string;
  place: string;
  featured?: boolean;
}

export const profile = profileData as Profile;
export const photos = photoData as Photo[];
