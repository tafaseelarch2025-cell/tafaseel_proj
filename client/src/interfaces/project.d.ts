import type { BaseKey } from "@refinedev/core";



export interface ProjectCardProps {
  id?: BaseKey | undefined;
  name: string;
  backgroundImage: string[];
  category?: string; 
 
}