export const ENV = {
  // Cambia esta URL cuando pases a producción o uses un nuevo túnel de ngrok
  BASE_URL: 'https://overfoul-domingo-unharmable.ngrok-free.dev',
  
  // URL base para los endpoints de la API
  get API_URL() {
    return `${this.BASE_URL}/api`;
  }
};
