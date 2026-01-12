export const getInitials = (name: string): string => {
  if (!name) return '';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const datePart = date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const timePart = date.toLocaleTimeString('es-ES', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  return `${datePart} a las ${timePart}`;
};

export const timeAgo = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    const years = Math.floor(interval);
    return `hace ${years} ${years === 1 ? 'año' : 'años'}`;
  }
  
  interval = seconds / 2592000;
  if (interval > 1) {
    const months = Math.floor(interval);
    return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  }
  
  interval = seconds / 604800;
  if (interval > 1) {
    const weeks = Math.floor(interval);
    return `hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
  }
  
  interval = seconds / 86400;
  if (interval > 1) {
    const days = Math.floor(interval);
    return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
  }
  
  interval = seconds / 3600;
  if (interval > 1) {
    const hours = Math.floor(interval);
    if (hours === 1) {
      const minutes = Math.floor((seconds % 3600) / 60);
      if (minutes > 0) {
        return `hace 1 hora y ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
      }
    }
    return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }
  
  interval = seconds / 60;
  if (interval > 1) {
    const minutes = Math.floor(interval);
    return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }
  
  return "hace unos segundos";
};
