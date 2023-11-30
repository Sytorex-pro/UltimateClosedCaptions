
import { Router } from "express";
import { User, UserSecretsSchema } from "../entity/User";

export const secretsRouter = Router();

secretsRouter.post('', async (req, res, next)=>{
	try{
		const user = await User.findOneByOrFail({twitchId: req.session.userid});
		Object.assign(user.secrets, UserSecretsSchema.parse(req.body));
		await User.update({
			id: user.id
		},{
			secrets: user.secrets
		});
		res.json({success: true});
	}catch(e) {
		next(e);
	}
});

