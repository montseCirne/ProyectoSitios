export interface Usuario {
    id: number; 
    nombre: string;
    correo: string;
    contraseña: string;
    rol: 'mesero' | 'cocinero' | 'administrador'; 
  }
  
  export interface Mesa {
    id: number; 
    numero: number;
    estado: 'disponible' | 'ocupada'; // Estados posibles para la mesa
  }
  
  export interface Comanda {
    id: number; 
    idMesa: number; 
    platillos: string[];
    bebidas: string[]; 
    notas?: string; 
    estado: 'pendiente' | 'en preparación' | 'listo'; // Estados posibles de la comanda
  }
  
  export interface AuthStore {
    crearUsuario(usuario: Usuario): Promise<Usuario>;
    obtenerUsuarioPorCorreo(correo: string): Promise<Usuario | null>;
    validarContraseña(usuario: Usuario, contraseña: string): Promise<boolean>;
    listarUsuarios(): Promise<Usuario[]>;
  }
  
  export interface Role {
    rol: 'mesero' | 'cocinero' | 'administrador';
  }
  