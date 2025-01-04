import { type Firestore } from "firebase/firestore";

export abstract class FirestoreRepositoryCore {
    protected constructor(
        protected readonly database: Firestore
    ) {}
}
