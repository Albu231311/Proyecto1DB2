const express = require('express');
const router = express.Router();
const resenaCtrl = require('../controllers/resenaController');

router.post('/', resenaCtrl.createResena);
router.get('/', resenaCtrl.getResenas);
router.get('/:id', resenaCtrl.getResenaById);
router.put('/:id', resenaCtrl.updateResena);
router.delete('/:id', resenaCtrl.deleteResena);

module.exports = router;