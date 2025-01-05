import {
    addDoc,
    collection,
    doc,
    getCountFromServer,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    setDoc,
    startAt,
    where,
    type Firestore,
} from "firebase/firestore";

import { User, UserSubscription, UserTimelineArticle } from "@/entities/User";
import { FirestoreRepositoryCore } from "@/repositories/core/FirestoreRepositoryCore";


export class UserRepository extends FirestoreRepositoryCore {
    constructor(
        database: Firestore
    ) {
        super(database);
    }

    private async getUserRef(uid: string) {
        if (!uid) {
            throw new Error("Integrity check failed: uid is required");
        }

        return doc(this.database, "users", uid);
    }

    public async createUser(uid:string, data: User): Promise<void> {
        // ユーザーのメインドキュメントを作成
        const userDocRef = await this.getUserRef(uid);

        if (!data.sid) {
            throw new Error("sid is required");
        }

        if (!data.name) {
            data.name = "New User";
        }

        if (data.uid !== uid) {
            throw new Error("key uid must be equal to the uid parameter");
        }

        // 既にユーザーが存在する場合はエラーを返す
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            throw new Error("User already exists");
        }

        await setDoc(userDocRef, {
            sid: data.sid,
            name: data.name,
        });

        // サブスクリプションをサブコレクションとして追加
        if (data.subscriptions && Array.isArray(data.subscriptions)) {
            for (const subscription of data.subscriptions) {
                await addDoc(collection(userDocRef, "subscriptions"), subscription);
            }
        }

        // タイムラインをサブコレクションとして追加
        if (data.timeline && Array.isArray(data.timeline)) {
            for (const article of data.timeline) {
                await addDoc(collection(userDocRef, "timeline"), article);
            }
        }
    }

    public async getUserProfile(uid: string): Promise<User | null> {
        const userDocRef = await this.getUserRef(uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const data = userDoc.data();
            if (data) {
                return {
                    uid: userDoc.id,
                    sid: data.sid,
                    name: data.name,
                    avatarUrl: data.avatarUrl,
                    subscriptions: [],
                    timeline: [],
                };
            } else {
                throw new Error("User data is empty");
            }
        } else {
            return null;
        }
    }

    public async updateUser(uid: string, data: Partial<User>): Promise<void> {
        const userDocRef = await this.getUserRef(uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            throw new Error("User not found");
        }

        if (data.name) {
            await setDoc(userDocRef, {
                name: data.name,
            }, { merge: true });
        }

        if (data.avatarUrl) {
            await setDoc(userDocRef, {
                avatarUrl: data.avatarUrl,
            }, { merge: true });
        }
    }

    public async addSubscription(uid: string, subscription: UserSubscription): Promise<void> {
        if (!subscription.url) {
            throw new Error("url is required");
        }

        if (!subscription.name) {
            throw new Error("name is required");
        }

        const userDocRef = await this.getUserRef(uid);
        const subscriptionsRef = collection(userDocRef, "subscriptions");

        // 既に同じURLのサブスクリプションが登録されている場合はエラーを返す
        const q = query(subscriptionsRef, limit(1), where("url", "==", subscription.url));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            throw new Error("Subscription already exists");
        }

        // 既に256件以上のサブスクリプションが登録されている場合はエラーを返す
        const countSnapshot = await getCountFromServer(subscriptionsRef);
        if (countSnapshot.data().count >= 256) {
            throw new Error("Maximum number of subscriptions exceeded");
        }

        await addDoc(collection(userDocRef, "subscriptions"), subscription);
    }

    public async getSubscriptions(uid: string): Promise<UserSubscription[]> {
        const userDocRef = await this.getUserRef(uid);
        const subscriptionsRef = collection(userDocRef, "subscriptions");
        const snapshot = await getDocs(subscriptionsRef);
        const subscriptions: UserSubscription[] = [];
        snapshot.forEach((doc) => {
            const subscription: UserSubscription = doc.data() as UserSubscription;
            subscriptions.push(subscription);
        });

        return subscriptions;
    }

    public async addTimelineArticle(uid: string, article: UserTimelineArticle): Promise<void> {
        const userDocRef = await this.getUserRef(uid);
        await addDoc(collection(userDocRef, "timeline"), article);
    }

    public async getTimeline(uid: string, articlesPerPage: number = 12, page: number = 1): Promise<UserTimelineArticle[]> {
        if (articlesPerPage < 1 || articlesPerPage > 20) {
            throw new Error("articlesPerPage must be between 1 and 20");
        }

        if (page < 1) {
            throw new Error("page must be greater than or equal to 1");
        }

        const userDocRef = await this.getUserRef(uid);
        const timelineRef = collection(userDocRef, "timeline");
        const offset = articlesPerPage * (page - 1);
        const q = query(
            timelineRef,
            limit(articlesPerPage),
            orderBy("index", "asc"),
            startAt(offset)
        );

        const snapshot = await getDocs(q);
        const timeline: UserTimelineArticle[] = [];
        snapshot.forEach((doc) => {
            const article: UserTimelineArticle = doc.data() as UserTimelineArticle;
            timeline.push(article);
        });

        return timeline;
    }
}
