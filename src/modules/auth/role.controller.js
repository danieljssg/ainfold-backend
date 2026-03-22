import logger from '../../config/logger.js';
import { changeUserRole } from './role.service.js';

const AVAILABLE_ROLES = [
  'ADMIN',
  'MANAGER',
  'NATIONAL',
  'REGIONAL',
  'ZONE',
  'AGENT',
  'PARTNER',
  'OUTLET',
  'CLIENT',
  'USER',
];

export const getRoles = async (_req, res) => {
  try {
    res.json({
      success: true,
      roles: AVAILABLE_ROLES,
      count: AVAILABLE_ROLES.length,
    });
  } catch (error) {
    logger.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const getUserRole = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado',
      });
    }

    res.json({
      success: true,
      role: user.role,
      tagId: user.tagId,
      email: user.email,
    });
  } catch (error) {
    logger.error('Get user role error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Cambia el rol de un usuario.
 * El tagId y path permanecen intactos — solo cambia el campo role.
 *
 * PATCH /auth/roles/:tagId/change
 * Body: { newRole: "MANAGER" }
 */
export const changeRole = async (req, res) => {
  try {
    const { tagId } = req.params;
    const { newRole } = req.body;
    const modifierId = req.user?.id;

    if (!newRole) {
      return res.status(400).json({
        success: false,
        error: 'El campo "newRole" es requerido',
      });
    }

    if (!tagId) {
      return res.status(400).json({
        success: false,
        error: 'El parámetro "tagId" es requerido',
      });
    }

    const result = await changeUserRole(tagId, newRole, modifierId);

    res.json({
      success: true,
      data: result.user,
      message: result.message,
      details: result.details,
    });
  } catch (error) {
    logger.error('Change role error:', error);

    const statusCode = error.message.includes('no encontrado') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      error: error.message,
    });
  }
};
