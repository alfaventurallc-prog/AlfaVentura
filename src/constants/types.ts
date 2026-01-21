export interface CardData {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
  designer: string;
  supplier?: string;
  tags?: string[];
  date: string;
  thumbnail?: string;
}
