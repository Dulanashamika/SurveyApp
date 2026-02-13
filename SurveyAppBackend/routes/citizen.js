const express = require('express');
const router = express.Router();
const citizenController = require('../controllers/citizenController');
const { protect } = require('../middleware/authMiddleware');

// ==================== PLANT ROUTES ====================
router.post('/plants', protect, citizenController.createPlant);
router.get('/plants', protect, citizenController.getAllPlants);
router.get('/plants/:id', protect, citizenController.getPlantById);
router.put('/plants/:id', protect, citizenController.updatePlant);
router.delete('/plants/:id', protect, citizenController.deletePlant);

// ==================== ANIMAL ROUTES ====================
router.post('/animals', protect, citizenController.createAnimal);
router.get('/animals', protect, citizenController.getAllAnimals);
router.get('/animals/:id', protect, citizenController.getAnimalById);
router.put('/animals/:id', protect, citizenController.updateAnimal);
router.delete('/animals/:id', protect, citizenController.deleteAnimal);

// ==================== NATURE ROUTES ====================
router.post('/nature', protect, citizenController.createNature);
router.get('/nature', protect, citizenController.getAllNature);
router.get('/nature/:id', protect, citizenController.getNatureById);
router.put('/nature/:id', protect, citizenController.updateNature);
router.delete('/nature/:id', protect, citizenController.deleteNature);

// ==================== HUMAN ACTIVITY ROUTES ====================
router.post('/human-activity', protect, citizenController.createHumanActivity);
router.get('/human-activity', protect, citizenController.getAllHumanActivity);
router.get('/human-activity/:id', protect, citizenController.getHumanActivityById);
router.put('/human-activity/:id', protect, citizenController.updateHumanActivity);
router.delete('/human-activity/:id', protect, citizenController.deleteHumanActivity);

module.exports = router;
