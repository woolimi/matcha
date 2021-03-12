import express from 'express';
import SearchController from '../../controller/Search';
import authToken from '../../middleware/authToken';
import validator from '../../middleware/validator';

const searchRouter = express.Router();
searchRouter.post('/', authToken, validator.searchQuery, SearchController.search);
export default searchRouter;
