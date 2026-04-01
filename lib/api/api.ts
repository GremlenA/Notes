import axios from 'axios';


const getBaseUrl = () => {
 
  if (typeof window !== 'undefined') {
    return '/api'; 
  }
  
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api`;
  }
  
  return 'http://localhost:3000/api';
};

export const nextServer = axios.create({
  baseURL: getBaseUrl(), 
  withCredentials: true, 
});