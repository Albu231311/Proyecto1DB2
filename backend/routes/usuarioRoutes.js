const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/usuarioController');

router.post('/', userCtrl.createUsuario);
router.get('/', userCtrl.getUsuarios); 
router.get('/:id', userCtrl.getUsuario); 
router.put('/:id/direccion', userCtrl.addDireccion);
router.delete('/:id', userCtrl.deleteUsuario);

router.delete('/mantenimiento/invitados', userCtrl.deleteInvitados);


module.exports = router;