import logger from '../../config/logger.js';

const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        });
      }

      const userRole = user.role;

      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Usuario sin rol asignado',
        });
      }

      if (userRole === 'ADMIN') {
        return next();
      }
      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      if (rolesArray.includes(userRole)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesArray.join(', ')} o ADMIN`,
        requiredRoles: [...rolesArray, 'ADMIN'],
        userRole,
      });
    } catch (error) {
      logger.error('Role validation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al validar permisos',
      });
    }
  };
};

export const requireAdmin = checkRole('ADMIN');

export const requireManager = checkRole('MANAGER');

export const requireNational = checkRole('NATIONAL');

export const requireRegional = checkRole('REGIONAL');

export const requireZone = checkRole('ZONE');

export const requireAgent = checkRole('AGENT');
export const requirePartner = checkRole('PARTNER');

export const requireOutlet = checkRole('OUTLET');

export const requireClient = checkRole('CLIENT');

export const requireUser = checkRole('USER');

export const requireRoles = (roles) => checkRole(roles);
