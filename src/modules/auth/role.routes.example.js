/**
 * EJEMPLO DE USO DE MIDDLEWARES DE ROLES
 *
 * Este archivo muestra cómo usar los middlewares de roles en tus rutas.
 * No es necesario incluir este archivo en tu aplicación, es solo una referencia.
 */

import { Router } from 'express';
import { verifyToken } from './auth.middleware.js'; // Tu middleware de autenticación
import { getRoles, getUserRole } from './role.controller.js';
import {
  requireAdmin,
  requireAgent,
  requireClient,
  requireManager,
  requireNational,
  requireOutlet,
  requirePartner,
  requireRegional,
  requireRoles,
  requireUser,
  requireZone,
} from './role.middleware.js';

const router = Router();

// ============================================
// RUTAS DE ROLES (información del sistema)
// ============================================

/**
 * GET /api/roles
 * Obtiene todos los roles disponibles en el sistema
 * Requiere: Usuario autenticado
 */
router.get('/roles', verifyToken, getRoles);

/**
 * GET /api/roles/me
 * Obtiene el rol del usuario autenticado
 * Requiere: Usuario autenticado
 */
router.get('/roles/me', verifyToken, getUserRole);

// ============================================
// EJEMPLOS DE USO DE MIDDLEWARES DE ROLES
// ============================================

/**
 * Ejemplo 1: Solo ADMIN puede acceder
 */
router.get('/admin-only', verifyToken, requireAdmin, (_req, res) => {
  res.json({ message: 'Solo administradores pueden ver esto' });
});

/**
 * Ejemplo 2: MANAGER o ADMIN pueden acceder
 * No necesitas [requireAdmin, requireManager], solo requireManager
 */
router.get('/manager-dashboard', verifyToken, requireManager, (_req, res) => {
  res.json({ message: 'Dashboard de manager (o admin)' });
});

/**
 * Ejemplo 3: NATIONAL o ADMIN pueden acceder
 */
router.post('/national-reports', verifyToken, requireNational, (_req, res) => {
  res.json({ message: 'Reporte nacional creado' });
});

/**
 * Ejemplo 4: REGIONAL o ADMIN pueden acceder
 */
router.put('/regional-settings/:id', verifyToken, requireRegional, (_req, res) => {
  res.json({ message: 'Configuración regional actualizada' });
});

/**
 * Ejemplo 5: ZONE o ADMIN pueden acceder
 */
router.get('/zone-data', verifyToken, requireZone, (_req, res) => {
  res.json({ message: 'Datos de zona' });
});

/**
 * Ejemplo 6: AGENT o ADMIN pueden acceder
 */
router.post('/agent-tasks', verifyToken, requireAgent, (_req, res) => {
  res.json({ message: 'Tarea de agente creada' });
});

/**
 * Ejemplo 7: PARTNER o ADMIN pueden acceder
 */
router.get('/partner-commissions', verifyToken, requirePartner, (_req, res) => {
  res.json({ message: 'Comisiones de partner' });
});

/**
 * Ejemplo 8: OUTLET o ADMIN pueden acceder
 */
router.get('/outlet-inventory', verifyToken, requireOutlet, (_req, res) => {
  res.json({ message: 'Inventario de outlet' });
});

/**
 * Ejemplo 9: CLIENT o ADMIN pueden acceder
 */
router.get('/client-orders', verifyToken, requireClient, (_req, res) => {
  res.json({ message: 'Órdenes del cliente' });
});

/**
 * Ejemplo 10: Cualquier usuario autenticado (USER o superior, incluyendo ADMIN)
 */
router.get('/profile', verifyToken, requireUser, (_req, res) => {
  res.json({ message: 'Perfil de usuario' });
});

/**
 * Ejemplo 11: Múltiples roles específicos usando requireRoles
 * Permite MANAGER, NATIONAL o ADMIN
 */
router.get('/sales-report', verifyToken, requireRoles(['MANAGER', 'NATIONAL']), (_req, res) => {
  res.json({ message: 'Reporte de ventas (Manager, National o Admin)' });
});

/**
 * Ejemplo 12: Combinación de múltiples roles
 * Permite REGIONAL, ZONE o ADMIN
 */
router.post('/territory-update', verifyToken, requireRoles(['REGIONAL', 'ZONE']), (_req, res) => {
  res.json({ message: 'Actualización territorial' });
});

// ============================================
// NOTAS IMPORTANTES
// ============================================

/**
 * VENTAJAS DE ESTE SISTEMA:
 *
 * 1. ADMIN siempre tiene acceso a todo automáticamente
 *    - No necesitas [requireAdmin, requireManager]
 *    - Solo usas requireManager y ADMIN también puede acceder
 *
 * 2. Código más limpio y mantenible
 *    - router.get('/ruta', verifyToken, requireManager, controller)
 *    - En lugar de: router.get('/ruta', verifyToken, requireAdmin, requireManager, controller)
 *
 * 3. Mensajes de error informativos
 *    - El usuario sabe exactamente qué roles se requieren
 *    - El usuario ve su rol actual en el mensaje de error
 *
 * 4. Flexible para casos especiales
 *    - Usa requireRoles(['ROLE1', 'ROLE2']) para múltiples roles específicos
 *    - ADMIN siempre se incluye automáticamente
 *
 * EJEMPLOS DE USO EN TUS RUTAS:
 *
 * // Solo managers (y admins automáticamente)
 * router.post('/create-team', verifyToken, requireManager, createTeam);
 *
 * // Solo regionales (y admins automáticamente)
 * router.get('/regional-stats', verifyToken, requireRegional, getRegionalStats);
 *
 * // Managers o Nacionales (y admins automáticamente)
 * router.get('/sales-dashboard', verifyToken, requireRoles(['MANAGER', 'NATIONAL']), getSalesDashboard);
 */

export default router;
