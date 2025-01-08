import { UserSubscription } from "@/entities/User";
import { UserRepository } from "@/repositories/UserRepository";


export class SubscriptionService {
    constructor(
        private readonly userRepository: UserRepository
    ) {}

    public async getSubscriptions(uid: string): Promise<UserSubscription[]> {
        const fetched = await this.userRepository.getSubscriptions(uid);
        if (!fetched) {
            throw new Error("User not found");
        }

        return fetched;
    }

    public async addSubscription(uid: string, subscription: UserSubscription): Promise<void> {
        await this.userRepository.addSubscription(uid, subscription);
    }
}
