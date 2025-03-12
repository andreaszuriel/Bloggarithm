
import Backendless from "backendless";


const BACKENDLESS_APP_ID = process.env.NEXT_PUBLIC_BLOGGARITHM_APP_ID!;
const BACKENDLESS_API_KEY = process.env.NEXT_PUBLIC_BLOGGARITHM_API_KEY!;


Backendless.initApp(BACKENDLESS_APP_ID, BACKENDLESS_API_KEY);
export default Backendless;


