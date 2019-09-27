import Express from 'express'
const router = Express.Router();
import User from '../models/user'
import {responseClient} from '../util'

//admin请求后台验证

router.use((req,res,next) =>{
    res.cookie('name1', 'value1');
    res.send();
});

module.exports = router;