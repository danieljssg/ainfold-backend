import User from '../../shared/models/User.js';
import { createLogEntry, saveAuditLog } from '../../utils/audit.logger.js';

const HIERARCHY_LEVELS = {
  ADMIN: 1,
  MANAGER: 2,
  NATIONAL: 3,
  REGIONAL: 4,
  ZONE: 5,
  AGENT: 6,
  PARTNER: 7,
  OUTLET: 8,
  CLIENT: 9,
  USER: 10,
};

const AVAILABLE_ROLES = Object.keys(HIERARCHY_LEVELS);

/**
 * Cambia el rol de un usuario.
 * El tagId y path NO se modifican — son identificadores permanentes.
 * El control de acceso a módulos se maneja via middleware de roles.
 *
 * PATCH /auth/roles/:tagId/change
 * Body: { newRole: "MANAGER" }
 */
export const changeUserRole = async (tagId, newRole, modifierId = null) => {
  const upperRole = newRole.toUpperCase();

  if (!AVAILABLE_ROLES.includes(upperRole)) {
    throw new Error(`Rol inválido: ${newRole}`);
  }

  const user = await User.findOne({ tagId, isActive: true });
  if (!user) {
    throw new Error(`Usuario con tagId ${tagId} no encontrado`);
  }

  if (user.role === upperRole) {
    throw new Error(`El usuario ya tiene el rol ${upperRole}`);
  }

  const originalUser = user.toObject();

  const updatedUser = await User.findOneAndUpdate(
    { _id: user._id },
    { role: upperRole },
    { new: true, runValidators: true },
  );

  if (modifierId) {
    const logEntry = createLogEntry(
      'User',
      originalUser,
      { role: upperRole },
      modifierId,
      'update',
      user._id,
    );
    await saveAuditLog(logEntry);
  }

  return {
    user: updatedUser,
    message: `Rol cambiado de ${originalUser.role} a ${upperRole}.`,
    details: {
      tagId,
      oldRole: originalUser.role,
      newRole: upperRole,
    },
  };
};
