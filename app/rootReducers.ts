import Auth from "./reducers/auth.reducers";
import Nft from "./reducers/nft.reducers";
import User from "./reducers/user.reducers";
import Collection from "./reducers/collection.reducers";

const rootReducers = {
  auth: Auth,
  nft: Nft,
  user: User,
  collection: Collection,
};

export default rootReducers;
