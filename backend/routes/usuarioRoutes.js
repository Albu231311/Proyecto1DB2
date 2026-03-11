const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/usuarioController');

router.delete('/invitados', userCtrl.deleteInvitados);

router.post('/', userCtrl.createUsuario);
router.get('/', userCtrl.getUsuarios); 
router.get('/:id', userCtrl.getUsuario); 
router.put('/:id', userCtrl.updateUsuario);
router.put('/:id/direccion', userCtrl.addDireccion);
router.delete('/:id', userCtrl.deleteUsuario);

// Esta también usa userCtrl correctamente
router.delete('/mantenimiento/invitados', userCtrl.deleteInvitados);

module.exports = router;