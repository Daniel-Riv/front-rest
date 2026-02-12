export default {
  common: {
    footer: 'Todos los derechos reservados, 2016 - 2026',
    back: 'Volver',
  },
  login: {
    welcome: 'Te damos la bienvenida a',
    title: 'Sazón Restobar',
    instruction:
      'Ingresa aquí con tu correo y contraseña designada para acceder a tu cuenta.',
    email: 'Correo',
    password: 'Contraseña',
    rememberPassword: 'Recordar Contraseña',
    submit: 'Ingresar',
    forgotPassword: 'Olvidé mi contraseña',
    createAccount: 'Crear una cuenta',
    noAccountYet: '¿No tienes cuenta aún?',
    tryFree: 'Prueba Sazón Restobar por 7 días, gratis.',
    goToSite: '¿Quieres ir al sitio de Sazón?',
    clickHere: 'Clic aquí',
    forgotPasswordTitle: 'Recuperar contraseña',
    forgotPasswordMessage:
      'Contacta a tu administrador para restablecer tu contraseña.',
  },
  register: {
    title: 'Crear cuenta',
    subtitle:
      'Próximamente podrás registrarte aquí. Contacta a tu administrador para obtener acceso.',
    backToLogin: 'Volver al login',
  },
  home: {
    welcome: 'Bienvenido',
    user: 'Usuario',
    logout: 'Cerrar sesión',
    role: 'Rol',
    menuTitle: 'Menú dinámico',
    menuSubtitle: 'Accesos habilitados según tus permisos',
    menuReload: 'Recargar',
    menuLoading: 'Cargando opciones...',
    menuEmpty: 'No hay menús asignados para este rol.',
    menuNoRole: 'Tu usuario no tiene rol asignado.',
    menuError: 'No fue posible obtener el menú.',
    menuPathFallback: '/sin-ruta',
  },
  validation: {
    emailInvalid: 'Email inválido',
    passwordMin: 'Mínimo 6 caracteres',
  },
} as const;
