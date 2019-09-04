import { Schema 	 , SchemaInterface} from "./schema"
import { Permissions } from "./permission"
import { Routes 	 } from "./route"
import { Method 	 } from "./method"
import { Validation  } from "./validation"

export class Model
{
	Schema 		: SchemaInterface;
	Permissions ;
	Method		;
	Routes		;

	constructor()
	{
		this.Schema = new Schema( this );
		this.Method = new Method();
	}

	register()
	{
		this.Schema.register();
		this.Method.register();
	}
}

export interface ModelInterface extends Model{};